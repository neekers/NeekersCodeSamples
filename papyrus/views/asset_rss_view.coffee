global.myd ?= {}

class AssetRSSView extends Backbone.View
  model: myd.ItemModel

  events:
    'click .rssRow a, .rssHeader a'                  : 'clickedRSSReadMore'


  initialize: (params) ->

    rss_options =
      limit: 3
      header: true
      snippet: false
      content: true
      linktarget: "_blank"

    @containerEl = params.container
    @removeEvents = params.removeEvents ? false
    if params.limit? then rss_options.limit = params.limit
    if params.showContent? then rss_options.content = params.showContent
    @context = params.context || "collections"

    @render(rss_options)

  render: (rss_options) ->
    @setElement(@containerEl.find('.content'))
    if !global.myd.feature.testing
      @$el.rssfeed @model.get("feed_url"), rss_options, => @enhanceRssContents()

  enhanceRssContents: ->
    @$el.addClass('content-loaded')
    #extra links confuse the user, so let's remove at product's request
    @$el.find("a[href*=feedburner], img[src*=feedburner], img[src*='ads.'], img[src*=pheedo], iframe").remove()

    # Remove links from facts and rss when on profile
    if (@model.get("type") == "feed" or @model.get("type") == "fact") and
    @context != "collections"
      @$el.find('a').contents().unwrap().wrap("<span class='spanned-link'>").find("span")

  clickedRSSReadMore: (event) ->
    if !@removeEvents
      $(event.target).attr("target", "_blank").attr('href')
      event.stopPropagation()


global.myd.AssetRSSView = AssetRSSView

