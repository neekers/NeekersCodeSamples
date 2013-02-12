global.myd ?= {}

class AddBarView extends Backbone.View
  model: myd.ScreenModel

  events:
    'click .add-bar a':             'clickedAddBarButton'
    'click .add-fact':              'clickAddText'
    'click .add-photo':             'clickAddPhoto'
    'click .add-video':             'clickAddVideo'
    'click .add-collage':           'clickAddCollage'
    'click .add-rss':               'clickAddFeed'

  bindToModel:
    "change:index": "updateIndex"

  showFrontMatter: true
  prevScreenId: null

  initialize: (params) ->
    @index = params.index
    @firstTime = params.first_time

    # TODO: we'll need to tackle this one later.  It's causing problems
    ###
    @bind "finishEdit", =>
      @close()

    @bind "cancelEdit", =>
      @close()
    ###

  reset: ->
    @render()

  render: ->
    @$el.html(Mustache.render($("#add_bar_view_template").html(), first_time: @firstTime))


    # show the full add-bar toolbar when a user wants to create a collage
    if @firstTime
      @$el.find(".add-bar").addClass("add-bar-show")
    @$el

  updateIndex: ->
    @index = @model.get("index")

  clickAddText: (event) ->
    target = $(event.target).parents('.add-bar')

    @newFactAsset = new myd.AddFactView(container: target, index: @index)

    @bind "finishEdit", =>
      @newFactAsset.trigger("finishEdit")

    @bind "cancelEdit", =>
      @newFactAsset.trigger("cancelEdit")

    @newFactAsset.bind("addItem", @callAddNewItem, @)

  clickAddPhoto: (event) ->
    @addPhotoVideo event, "image"

  callAddItemToCollection: (item) ->
    @trigger("addItem", view: @, item: item)
    return false

  callAddNewItem: (item) ->
    @trigger("addNewItem", view: @, item: item)
    return false

  clickAddVideo: (event) ->
    @addPhotoVideo event, "video"

  addPhotoVideo: (event, addType) ->
    target = $(event.target).parents('.add-bar')
    @newPhotoVideoView = new myd.AddPhotoVideoView(container: target, addType: addType, addItemUrl: @model.get("add_new_item_url"), index: @index)
    @newPhotoVideoView.bind("addItem", @callAddItemToCollection, @)
    @newPhotoVideoView.bind("addNewItem", @callAddNewItem, @)

  clickAddCollage: (event)->
    @addPhotoVideo event, "collage"

  clickAddFeed: (event) ->
    target = $(event.target).parents('.add-bar')

    @newFeedAsset = new myd.AddFeedView(container: target, index: @index)
    @newFeedAsset.bind("addItem", @callAddNewItem, @)

  clickedAddBarButton: ->
    $("body, html").animate({
      'scrollTop':  @$el.find(".add-bar").offset().top - 80
    }, 750, "easeOutBack")

    # remove the add-bar-show class to make the toolbar show/hide with animation
    @$el.find(".add-bar").removeClass("add-bar-show")

    # hide the first-edit-callout if it's there
    @$el.find('.first-edit-callout').remove()

    false

  onClose: ->
    if @newFactAsset?
      @newFactAsset.unbind("addItem")
      @newFactAsset.close()
    if @newPhotoVideoView?
      @newPhotoVideoView.unbind("addItem")
      @newPhotoVideoView.close()
    if @newFeedAsset?
      @newFeedAsset.unbind("addItem")
      @newFeedAsset.close()
    @unbind("finishEdit")

global.myd.AddBarView = AddBarView