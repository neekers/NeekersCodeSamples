global.myd ?= {}

class OverlayView extends Backbone.View

  events:
    "click":      "clickedClose"

  initialize: ->
    @render()

  render: ->
    $("body").addClass("noscroll").append("<div id='overlay'>")
    @setElement($("#overlay"))

    #must do this because it's not in the DOM just yet
    window.setTimeout(->
      $("#overlay").addClass("activated")
    , 200)

  clickedClose: ->
    @trigger("clickedClose")
    false

  onClose: ->
    $("body").removeClass("noscroll")

global.myd.OverlayView = OverlayView