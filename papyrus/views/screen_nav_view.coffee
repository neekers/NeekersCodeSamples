global.myd ?= {}

class ScreenNavView extends Backbone.View
  className: "screen-nav"
  model: myd.ScreenModel

  events:
    'click a'    : 'scrollClick'

  bindToModel:
    "change:index": "reset"

  initialize: ->
    @

  reset: ->
    parentEl = @$el.parent()
    @$el.remove()
    templateObj = @model.toJSON()

    parentEl.append(Mustache.render($("#screen_nav_template").html(), templateObj))
    @setElement($(".screen-nav", parentEl))

  scrollClick: (event)->
    origin = event.target
    if origin.tagName.toLowerCase() != "a"
      origin = $(origin).closest("a")

    screenItem = $(origin).attr('href').substring(1)
    itemEl =  $("a[name='#{screenItem}']")
    if itemEl.length or screenItem == "top"
      $("body, html").animate({
      'scrollTop':  if screenItem != "top" then itemEl.offset().top - 100 else 0
      }, 500, "easeOutCirc");
    false

global.myd.ScreenNavView = ScreenNavView