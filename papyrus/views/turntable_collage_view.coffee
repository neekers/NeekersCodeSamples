global.myd ?= {}


class TurntableCollageView extends Backbone.View
  tagName: "li"
  className: "item"
  model: myd.ScreenModel

  events:
    "click .collage":         "clickedCollage"

  initialize: (params) ->
    @containerEl = params.container
    @render()

  render: () ->
    itemObj = @model.get("item").toJSON()
    html = $('<li class="item"/>').append(myd.renderScreen(itemObj))
    @containerEl.append(html)
    @setElement("##{@containerEl[0].id} li:last-child")
    ###
    if @model.get("item").get("type") == "feed"
      @assetRSSView = new global.myd.AssetRSSView( model: @model.get("item"), container: @$el.find(".feed.asset"), removeEvents: true )
    else if @model.get("item").get("type") == "collection"
      @collectionAuthorView = new global.myd.CollectionAuthorView( model: @model, el: @$el.find(".collection_tile_meta"))
    ###

  clickedCollage: ->
    if @model.get("item").get("type") == "collection"
      url = @model.get('item').get("entity_url")
      routes = myd.routesModule.getRoutesFromUrl( url )
      Router.navigate(routes.getPapyrusPath(), trigger: true)
    false

  renderScreens: ->
    randomCollection = @model.get("item").get("screens")
    if randomCollection?
      randomCollection = randomCollection.slice(0, 6)

      @$el.find(".record-screens").remove()
      @$el.find(".collage").append("<ul class='record-screens'></ul>")
      screensBox = @$el.find(".record-screens").addClass("layout-#{randomCollection.length}")
      _.each randomCollection, (screen) =>
        screensBox.append("<li>").find("li:last-child").append(myd.renderTurntableScreen(screen))


global.myd.TurntableCollageView = TurntableCollageView
