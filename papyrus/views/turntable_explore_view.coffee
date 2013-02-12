global.myd ?= {}

class TurntableExploreView extends Backbone.View
  itemWidth: 850
  singleWidth: 100

  collection: myd.GridCollection

  events:
    "click #records li":        "clickedSingle"
    "click #turntable li .advance":    "clickedAdvance"
    "click #records-wrapper .turntable-arrow-left": 'clickPrevFilmstrip'
    "click #records-wrapper .turntable-arrow-right": 'clickNextFilmstrip'

  bindToCollection:
    "reset": "render"

  initialize: (params) ->
    @containerEl = params.container
    @collection = new myd.GridCollection()
    @topic = params.topic || 'All Topics'
    @collection.fetchByUrl("#{myd.urls.spotlight}?topic=#{@topic}")
    @turntableViews = []
    @filmstripPage = 0

  render: ->
    $("#explore-turntable").remove()

    items = @collection.pluck "item"
    itemsObj = (item.toJSON() for item in items)
    rendered_view_html = Mustache.render($("#turntable_explore_template").html(), items: itemsObj )

    if @topic != "All Topics"
      $("#content header#topic-header").after(rendered_view_html)
    else
      $("#content header:first-child").after(rendered_view_html)

    @setElement($("#explore-turntable"))
    @turntable = @$el.find("ol#turntable")
    @records = @$el.find("ol#records")
    @recordsContainer = @$el.find("#records-wrapper")

    if !@$el.length
      return

    @recordsCount = @records.find('li').length

    #adjust the width of the ol to the size of the items
    @turntable.css("width", (@collection.models.length+1) * (@itemWidth+20))
    @records.css("width", @collection.models.length * (@singleWidth+5))

    _.each @collection.models,  (collage) =>
      collageView = new myd.TurntableCollageView( model: collage, container: @turntable )
      @turntableViews.push collageView
      collageView.renderScreens()

    @getScreensForCollection(0)

    #Unbinds clicks
    @turntable.find('li').unbind('click')

    @records.find('li').eq(0).addClass('pager-active')

    @recordsContainer.find('.turntable-arrow-left').css('opacity', 0)

    if @recordsCount <= 10 then @recordsContainer.find('.turntable-arrow-right').hide()

    @slider = new myd.TurntableModule(
      el: @$el.find("#turntable")
      onAfterSlide: (currentSlideNumber, forced) => @getScreensForCollection(currentSlideNumber, forced)
    )

    @turntable.hover(
      => @slider.stopTimer()
    ,
      => @slider.startTimer()
    )

    if myd.feature.turntableslide
      $("#explore-turntable").css('margin-top', '-592px')
      window.setTimeout(
        -> $("#explore-turntable").animate('margin-top': '-492px', 1000)
      , 750)

  getScreensForCollection: (currentSlideNumber, forced) ->
    if !@turntableViews.length
      @$el.hide()
      return false

    # remove all active classes
    prevPage = @turntable.find('.pager-active')
    prevPage.removeClass('pager-active')
    prevPage.find('.previous').removeClass('.previous')
    prevPage.prev().find('.turntable-arrow-left').remove()
    prevPage.next().find('.turntable-arrow-right').remove()

    @records.find('.pager-active').removeClass('pager-active')
    @turntable.removeClass('forced')

    # assisgn "pager-active" to clicked thumb
    if !@turntableViews.length
      @$el.hide()
      @close()
      return

    @turntableViews[currentSlideNumber].$el.addClass('pager-active')
    window.setTimeout(
      => @turntableViews[currentSlideNumber].$el.find('.collage-cover').addClass('previous')
    , 750)
    @$el.find('#records li').eq(currentSlideNumber).addClass('pager-active')

    if forced then @turntable.addClass('forced')

    activePage = @turntable.find('.pager-active')
    activePage.prev().append('<div class="turntable-arrow-left advance" />')
    activePage.next().append('<div class="turntable-arrow-right advance" />')

    # adjust the record slider
    slideRecordPage = Math.floor(currentSlideNumber / 10)

    if @filmstripPage != slideRecordPage
      @jumpToRecordSlide(slideRecordPage)

  clickecBack: ->
    @slider.goToPreviousSlide()
    false

  clickedSingle: (event) ->
    origin = $(event.target)
    thumbIndex = @records.find('li').index(event.target)
    @slider.slide(thumbIndex, true)

    # remove all active classes
    @records.find('.pager-active').removeClass('pager-active')

    $(event.target).addClass('pager-active')

    $("#explore-turntable").css('margin-top', '0')

    return false

  clickedAdvance: (event) ->
    thumbIndex = @turntable.children().index($(event.target).parents('li.item'))
    @slider.slide(thumbIndex, true)
    return false

  clickPrevFilmstrip: ->
    if @filmstripPage == 0 then return false

    @jumpToRecordSlide(@filmstripPage-1)

  clickNextFilmstrip: ->
    if Math.floor(@recordsCount / 10) == @filmstripPage+1 then return

    @jumpToRecordSlide(@filmstripPage+1)

  jumpToRecordSlide: (slide) ->
    @filmstripPage = slide

    @records.css('left', ((@recordsContainer.find('.container').width()+5) * @filmstripPage) * -1)

    if @filmstripPage > 0 && @recordsCount > 10
      @recordsContainer.find('.turntable-arrow-left').css('opacity': 1, 'cursor': 'pointer')
    else
      @recordsContainer.find('.turntable-arrow-left').css('opacity': 0, 'cursor': 'default')

    if Math.floor(@recordsCount / 10)-1 == @filmstripPage
      @recordsContainer.find('.turntable-arrow-right').css('opacity': 0, 'cursor': 'default')
    else
      @recordsContainer.find('.turntable-arrow-right').css('opacity': 1, 'cursor': 'pointer')     

    return false

  onClose: ->
    @slider?.close()
    _.each @views,  (collageView) ->
      collageView?.close()

global.myd.TurntableExploreView = TurntableExploreView
