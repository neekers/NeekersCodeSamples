global.myd ?= {}

class global.myd.BookmarkletView extends Backbone.View
  tagName: "div"
  id: "bookmarklet"

  initialize: ->
    $("#content").append(@$el)
    @template = $("#bookmarklet_view").html()
    @render()

  display: ->

  render: ->
    @$el.empty().append Mustache.render(@template, null) if @template?
    @
