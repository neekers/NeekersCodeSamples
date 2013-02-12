global.myd ?= {}

$(document).ready ->

  # msie blocker
  msieBrowser = $.browser.msie
  msieVersion = $.browser.version
  if msieBrowser && msieVersion < 9
      @template = $("#unsupported_browser").html()
      rendered_view_html = Mustache.render(@template)
      $('body').html( rendered_view_html )
  # end msie blocker

  # Should not be called by subviews. It unbinds EVERYTHING EVERYWHERE
  Backbone.View.prototype.close = ->

    this.remove()
    this.unbind()

    if @onClose?
      @onClose()

  app_view = app_view ? new myd.AppView()

  Backbone.history.start(pushState: true, root: "/papyrus/")
