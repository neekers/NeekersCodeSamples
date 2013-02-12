global.myd ?= {}

class AddFeedView extends Backbone.View
  tagName: "div"
  className: "screen-item add-asset feed-type cf"
  collection: myd.ItemsCollection

  events:
    'click .close-add-item':          'clickedClosed'
    'click .add-button': 'clickedAdd'

  initialize: (params) ->
    @containerTarget = params.container
    @index = params.index

    @collection = new myd.ItemsCollection
    @collection.bind("reset", @render, @)

    @collection.fetch("FeedAsset")
  render: ->
    @template = $("#add_feed_item_template").html()
    @$el.append Mustache.render(@template)

    @$el.insertAfter @containerTarget

    likedItemsList = @$el.find("ul.liked-items")
    
    @itemViews = []
    _.each @collection.models, (item) =>
      view = new myd.AddItemView(model: item)
      likedItemsList.append(view.el)
      view.bind("addItem", @addItem, @)
      @itemViews.push view

    @$el.show("blind", 1000)

  addItem: (item) ->
    if !item
      url = @$el.find('.feed_url').val()

      # TODO: Use regex to verify
      if url.length < 1
        return

      item = new myd.ItemModel(
        asset_type: "feed"
        title: ''
        feed_url: url
        type: "feed"
        index: @index
      )
    else
      item.set('asset_type', 'feed')
      item.set('index', @index)

    @trigger("addItem", item)

    @clickedClosed()

  clickedAdd: ->
    @addItem()
    false

  clickedClosed: ->
    @$el.hide("blind", 1000, =>
      @close()
    )
    false

  onClose: ->


global.myd.AddFeedView = AddFeedView
