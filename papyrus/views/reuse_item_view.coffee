global.myd ?= {}

renderVideoEmbed = global.myd.renderVideoEmbed



class ReuseItemView extends Backbone.View
  model: myd.ScreenModel

  events:
    "click .cancel-btn":      "close"
    "click .reuse-btn":       "clickedReuseItem"
    "click .screen-item":      "clickFail"
    'click .selected-collage':        'clickedDropdown'
    'click .options li':        'clickedDropdownItem'

  initialize: (params) ->
    @selectedCollectionUrl = null
    @getUserCollections()
    @render()

  render: ->
    template = $("#reuse_item_template").html()
    if template == null
      return false

    $("div#content").append("<div id='reuse'>")
    @setElement($("#reuse"))

    @overlayView = new myd.OverlayView()

    caption = @model.get("caption")
    creator = if @model.collection.frontMatter? then @model.collection.frontMatter.get("owner") else @model.frontMatter.get("owner")

    if @model.models?
      collageScreen = new myd.ScreenModel( @model.frontMatter.toJSON() )
      screensModels = []
      _.each @model.models, (screen) =>
        if screen.get("item").get("uid") != @model.frontMatter.get("cover_asset")?.uid #Get's all but the cover
          item = screen.get("item")
          screenObj = screen.toJSON()
          screenObj.item = item.toJSON()
          screensModels.push screenObj

      templateObj = collageScreen.toJSON()
      templateObj.item.set("type", "collection")
      templateObj.item.set("cover_asset", @model.frontMatter.get("cover_asset"))
      templateObj.item.set("screens", screensModels)
      templateObj.item.set("screens_count", @model.frontMatter.get("screens_count"))
      templateObj.item.set("created_timestamp", @model.frontMatter.get("created_timestamp"))

      @$el.html( Mustache.render(template, templateObj ))
      @$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"))
      myd.renderAssetFragment collageScreen, @context, @$el
      @$el.find(".screen-item").addClass("wide")

      #collections don't need captions
      $("#reuse-asset-caption").remove()
      $(".reuse-item-form-wrapper").height("440px")

    else if typeof @model.get("item").get("screens") == "undefined" #screens
      templateObj = @model.toJSON()
      if caption? and caption.length > 0
        templateObj.quotedCaption = "#{creator.first_name} #{creator.last_name}: #{caption}"
      templateObj.owner = null
      delete templateObj.caption
      templateObj.item.screens_count = null
      templateObj.item.collected_count = null

      @$el.html( Mustache.render(template, templateObj ))
      @$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"))

    else #collage screens
      templateObj = @model.toJSON()
      if caption? and caption.length > 0
        templateObj.quotedCaption = "#{creator.first_name} #{creator.last_name}: #{caption}"
      templateObj.caption = null
      @$el.html( Mustache.render(template, @model))
      @$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"))
      myd.renderAssetFragment @model, @context, @$el
      @$el.find('.screen-item').addClass('wide')

    if typeof @$el.find('.asset .image').attr('src') == "undefined"
      @$el.find('.asset .image').attr('src', @$el.find('.asset .image').data('src-745'))


    if $.browser.msie
      global.myd.Placeholder().refresh(@$el)

    if @model.get("item")?
      if @model.get("item").get("type") == "feed"
        @assetRSSView = new global.myd.AssetRSSView( model: @model.get("item"), container: @$el.find(".screen"), removeEvents: true )
      else if @model.get("item").get("type") == 'video' and @model.get('item').get("youtube_id")?
        renderVideoEmbed @model, @$el

      if @model.get("item").get("type") == "feed" or @model.get("item").get("type") == "collection" or @model.get("item").get("type") == "fact"
        $("#reuse-asset-caption").remove()
        $(".reuse-item-form-wrapper").height("440px")


    @dropdown = @$el.find(".dropdown-container .options")

    new global.myd.ImageCenter( @$el.find('.asset') )



  clickFail: ->
    false

  clickedReuseItem: ->
    url = @selectedCollectionUrl

    if !url?
      @$el.find("#collection-error-message").text("Please select a collage").show()
      return false

    asset = {}
    asset.entity_url = if @model.get("item")? then @model.get("item").get("entity_url") else  @model.collection.entity_url
    asset.caption = @$el.find("#reuse-asset-caption").val()

    myd.serviceModule.post(
      url: url
      data:  [ asset ]
      success: ( response ) =>
        @close()
      error: (response) =>
        @$el.find("#collection-error-message").text(response.responseText).show()
        @trigger("errorReset")
    )

  getUserCollections: ->
    myd.serviceModule.get(
      url: myd.urls.my_collection_list
      success: ( response ) =>
        _.each response, (collection) =>
          collection.title = if collection.title.length > 50 then collection.title.substr(0, 49) + " ..." else collection.title
          option = $("<li>").data("value": collection.uid).text(collection.title)
          jQuery.data(option[0], 'edit_items_url', collection.edit_items_url)
          @dropdown.append(option)
      error: (response) =>
        @trigger("errorReset")
    )

  clickedDropdown: ->
    @$el.find("#collection-error-message").hide()
    @$el.find('.dropdown-container').toggleClass('open')
    @$el.find('.options').toggle('blind', 150)

  clickedDropdownItem: (event)->
    target = $(event.target)
    @selectedCollectionUrl = target.data('edit_items_url')
    @$el.find('.selected-collage').text(target.text())
    @$el.find(".reuse-btn").removeClass("inactive")
    @clickedDropdown()

  onClose: ->
    @assetRSSView?.close()
    @overlayView?.close()


global.myd.ReuseItemView = ReuseItemView
