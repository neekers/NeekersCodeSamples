global.myd ?= {}

class RecommendedCollagesView extends Backbone.View
  id: "recommended-collages"
  collection: myd.GridCollection

  bindToCollection:
    "reset": "render"

  initialize: (params) ->
    @containerEl = params.container
    @collection = new myd.GridCollection()
    @topic = params.topic || 'All Topics'
    @screenViews = []
    @currentCollectionUID = params.currentCollectionUID
    @collection.fetchByUrl("#{myd.urls.spotlight}?topic=#{@topic}")

  render: ->
    @containerEl.append(Mustache.render($("#recommended_collages_template").html()))
    @setElement($("#recommended-collages"))
    @list = @$el.find(".collage-list")

    noCurrentCollage = (screen for screen in @collection.models when screen.get("item").id != @currentCollectionUID)
    shortCollection = noCurrentCollage.splice(0,9)
    _.each shortCollection, (screen) =>
      screen = new myd.ScreenView(model: screen, container: @list, context: "recommendedcollages")
      screen.bind("selected", @selectedScreen, @)
      screen.render()
      @list.append(screen.el)

    #need this for the explore collage tile look and feel
    @$el.find("li").addClass("screen")
    @checkScreenSize()

    new global.myd.ImageCenter( @$el.find('.asset') )
    

  checkScreenSize: ->
    # SIZES: Less than 640px
    new mediaQuery({
      media: 'screen and (max-width: 639px)'
      entry: ->
        $('.collage-list .screen').removeClass('featured subFeatured item')
        $('.collage-list .screen').addClass('subFeatured')
        screensList = $('.collage-list .screen')
        for screen in screensList
          current = $(screen).find('.asset .frame .image')
          current.attr('src',current.data('src-745'))
      exit: ->
    })

    # SIZES: 640px - 867px
    new mediaQuery({
      media: 'screen and (min-width: 640px) and (max-width: 867px)'
      entry: ->
        $('.collage-list .screen').removeClass('featured subFeatured')
        $('.collage-list .screen').addClass('item')
        screensList = $('.collage-list .screen')
        for screen in screensList
          current = $(screen).find('.asset .frame .image')
          current.attr('src',current.data('src-745'))
      exit: ->
    })

    # SIZES: 868px - 949px
    new mediaQuery({
      media: 'screen and (min-width: 868px) and (max-width: 949px)'
      entry: ->
        $('.collage-list .screen').removeClass('featured subFeatured')
        $('.collage-list .screen').addClass('item')
        screensList = $('.collage-list .screen')
        for screen in screensList
          current = $(screen).find('.asset .frame .image')
          current.attr('src',current.data('src-745'))
      exit: ->
    })

    # SIZES: 950px - 1099px
    new mediaQuery({
      media: 'screen and (min-width: 950px) and (max-width: 1099px)'
      entry: ->
        $('.collage-list .screen').removeClass('featured subFeatured')
        $('.collage-list .screen').addClass('item')
        screensList = $('.collage-list .screen')
        for screen in screensList
          current = $(screen).find('.asset .frame .image')
          current.attr('src',current.data('src-745'))
      exit: ->
    })

    # SIZES: Over 1100px
    new mediaQuery({
      media: 'screen and (min-width: 1100px)'
      entry: ->
        $('.collage-list .screen').removeClass('featured  item')
        $('.collage-list .screen').addClass('subFeatured')
        screensList = $('.collage-list .screen')
        for screen in screensList
          current = $(screen).find('.asset .frame .image')
          current.attr('src',current.data('src-745'))
      exit: ->
    })
  selectedScreen: (args) ->
    myd.common.selectedScreen(args)

  onClose: ->
    _.each @screenViews, (screen) ->
      screen.unbind("selected", @selectedScreen, @)
      screen.close()


global.myd.RecommendedCollagesView = RecommendedCollagesView
