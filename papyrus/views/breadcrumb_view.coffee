global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class BreadcrumbView extends Backbone.View
  tagName: "li"
  model: myd.BreadcrumbModel

  events:
    "click a":        "goBack"

  initialize: (params) ->
    @containerEl = params.container
    @render()

  render: ->
    rendered_view_html = Mustache.render($("#breadcrumb_template").html(), @model.toJSON())
    @containerEl.append(rendered_view_html)
    @setElement($("li:last-child", @containerEl))

  goBack: ->
    @trigger("goBack", @model)
    return false

global.myd.BreadcrumbView = BreadcrumbView
