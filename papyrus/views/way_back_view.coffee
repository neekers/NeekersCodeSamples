global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class WayBackView extends Backbone.View
  tagName: "div"
  className: "wayback"
  collection: myd.WayBackCollection
  turntableViews: []

  initialize: (params) ->
    @containerEl = params.container
    @collection.bind('add', @render, @)
    @collection.bind('reset', @render, @)

  render: ->
    $("#wayback").remove()

    #Never want to show the button if you just started browsing the app
    if @collection.models.length < 2
      $("#content").removeClass("wayback")
      return

    $("#content").addClass("wayback")
    renderTemplate = collection: { models: @collection.toJSON() }
    rendered_view_html = Mustache.render($("#way_back_template").html(), renderTemplate)
    $(rendered_view_html).insertAfter "body > header"
    @setElement($("#wayback", @containerEl))

    # Let's add in the breacrumbs
    _.each @collection.models,  (crumb) =>
      crumbView = new myd.BreadcrumbView( model: crumb, container: @$el.find("ol") )
      crumbView.bind("goBack", (crumbClicked) => @collection.rollBackHistory(crumbClicked))
      @turntableViews.push crumbView

  onClose: ->
    _.each @views,  (crumb) ->
      crumbView.unbind("goBack", @rollBackHistory, @)
      crumb.close()

global.myd.WayBackView = WayBackView
