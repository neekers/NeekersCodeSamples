global.myd ?= {}

class AddItemView extends Backbone.View
  tagName: "li"
  className: "item"
  model: myd.ItemModel
  
  events:
    "click a":        "clickedItem"

  initialize: (params) ->
    @addType = params.addType
    @render()

  render: ->
    placeholder = "/images/placeholder-logo.jpg"    
    thumbnail = @model.get("image_300_url") || placeholder
    coverImageThumb = @model.get("preview_image_url") || placeholder
    coverImage150 = @model.get("image_150_url") || placeholder
    coverImage300 = @model.get("image_300_url") || placeholder
    coverImage745 = @model.get("image_745_url") || placeholder
    coverImage1024 = @model.get("image_1024_url") || placeholder
    coverImage2048 = @model.get("image_2048_url") || placeholder
    
    if @model.get("type").toLowerCase() == "collection"
      if @addType == "cover"
        thumbnail = @model.get("cover_asset").image_745_url || placeholder
        @$el.append("<a href='#' title='Click to add #{@model.get("type")}' style='background-image: url(#{thumbnail})' /></a>")
      else
        @$el.html(myd.renderScreen(@model.toJSON(), "addcollage")).addClass('screen')
        myd.renderAssetFragmentFromItem(@model, null, "addcollage", @$el)
    else if @model.get("type") == "video" or @model.get("type") == "VideoAsset"
      @$el.append("<a href='#' class='video-thumb' title='Click to add #{@model.get("type")}' style='background-image: url(/images/play.png), url(#{thumbnail})' /></a>")
    else if @model.get("type") == "FeedAsset" || @model.get("type") == "feed"
      @$el.append("<a href='#' title='Click to add #{@model.get("type")}' ><span class='icon rss'><img src='/images/icon-rss-large.png'  alt='rss icon'/></span>#{@model.get("title")}</a>")
    else
      @$el.append("<a href='#' title='Click to add #{@model.get("type")}' style='background-image: url(#{thumbnail})' /></a>")

    @$el.addClass('no-hover')
    @$el.find('.asset .image').attr('src',coverImage745)


  clickedItem: ->
    if @addType == "cover" && @model.get("type") == "collection"
      @trigger("addItem", new Backbone.Model(@model.get("cover_asset")))
    else
      @trigger("addItem", @model)
    false

global.myd.AddItemView = AddItemView
