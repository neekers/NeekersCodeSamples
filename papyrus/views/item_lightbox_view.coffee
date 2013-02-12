global.myd ?= {}

class ItemLightboxView extends Backbone.View
  model: myd.ScreenModel

  events:
    'click .more-info':       'clickedMoreInfo'
    'click':                  'stopClick'
    'click .origin_source_url':   'clickedSource'

  initialize: (params) ->
    @model.set("index", 1)

    @model.get("item").bind("change:metaData", @toggleMetaDataView, @)

    @render()

  render: ->
    @overlayView = new myd.OverlayView()
    @overlayView.bind("clickedClose", @onClose, @)

    @overlayView.$el.html("<div id='item-lightbox'>")
    @setElement($("#item-lightbox"))

    @$el.html(myd.renderScreen(@model.toJSON(), "itemlightbox", showActions: true, showLikeButton: true))
    @$el.css("opacity", 1)
    @$el.find(".image-wrapper").css("opacity", 1)

    #paint video embed
    if @model.get("item").get("type") == "video"
      myd.renderVideoEmbed(@model, @$el, 600)
    else if @model.get("item").get("type") == "feed"
      @assetRSSView = new global.myd.AssetRSSView( model: @model.get("item"), container: @$el )

    @likeButtonView = new myd.LikeButtonView(model: @model, el: @$el.find(".like-container"))

    @$el.find(".below-asset").addClass('cf')

  toggleMetaDataView: ->
    @metaDataView = new global.myd.AssetMetaDataView( model: @model.get("item"), container: @$el.find(".below-asset"))

  clickedMoreInfo: (event) ->
    if typeof @metaDataView == "undefined" or @metaDataView == null
      @model.get("item").fetchMetaData()
    else
      isShown = @metaDataView.toggle()
    false

  clickedSource: ->
    sourceUrl = @model.get("item").get("source_page_url")
    if sourceUrl?.indexOf("http://") == 0
      @sourceWindow = window.open( sourceUrl )
    false

  stopClick: (event)->
    if $(event.target).hasClass("asset-wrapper")
      return true
    false

  onClose: ->
    @$el.slideUp(500, =>
      if @metaDataView?
        @metaDataView.close()
      if @likeButtonView?
        @likeButtonView.close()
      if @assetRSSView?
        @assetRSSView.close()

      @overlayView.unbind("clickedClose", @onClose, @)
      @overlayView.close()
    )

global.myd.ItemLightboxView = ItemLightboxView
