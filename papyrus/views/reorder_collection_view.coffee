global.myd ?= {}

class ReorderCollectionView extends Backbone.View
  collection: myd.GridCollection
  id: "reorder"

  events:
    'click .cancel-reorder-btn':      'clickedCancel'
    'click .done-reorder-btn':        'clickedDone'

  initialize: (params) ->
    @render()
    @

  render: ->
    @overlay = new myd.OverlayView
    $("#overlay").append(@$el.append(Mustache.render($("#reorder_collection_template").html())))
    @dragText = @$el.find(".drag-text")

    @list = @$el.find("#reorder-list")
    _.each @collection.models, (model) =>
      @list.append "<li data-id='#{model.get("uid")}'>#{myd.renderScreen(model.toJSON(), "reorder")}</li>"

    @list.sortable({
      placeholder: "ui-state-highlight"
      cursor: 'all-scroll'
      start: =>
        @dragText.css("visibility", "hidden")
      stop: =>
        @dragText.css("visibility", "visible")
    })
    @list.disableSelection();
    $("body").addClass("noscroll")

  clickedCancel: ->
    @close()
    false

  clickedDone: ->
    newOrderScreens = []
    _.each @list.find(" > li"), (screen, idx) =>
      localScreen = @collection.get($(screen).data("id"))
      localScreen.set "index", idx, silent: true

    @collection.sort()
    @collection.trigger('reordered')
    @close()
    false

  onClose: ->
    $("body").removeClass("noscroll")
    @overlay.close()

global.myd.ReorderCollectionView = ReorderCollectionView
