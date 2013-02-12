global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class NotificationItemView extends Backbone.View
  model: myd.NotificationModel
  tagName: "li"

  events:
    "click .view-link":           "clickedView"

  initialize: (params) ->
    @containerEl = params.container
    @render()

  render: ->
    templateObj = @model.toJSON()
    if templateObj.text.length > 100
      templateObj.text = templateObj.text.substring(0, 99)
    templateObj.created_timestamp = new Date(templateObj.created_timestamp*1000)
    routes = myd.routesModule.getRoutesFromUrl( templateObj.collection_url )
    templateObj.collection_url = routes.getPapyrusPath()
    templateObj.actionText = {
                                comment:    "added a comment to your collage"
                                }[templateObj.type]

    rendered_view_html = Mustache.render($("#notifications_list_item_template").html(), templateObj )
    @containerEl.append(rendered_view_html)
    @setElement($("#notifications-list li:last-child"))

    @$el.find("time").relativeTime()

  clickedView: ->
    routes = myd.routesModule.getRoutesFromUrl( @model.get("collection_url") )
    Router.navigate(routes.getPapyrusPath() + "/screens/" + @model.get("screen_uid"), trigger: true)
    @trigger("clickedView")

global.myd.NotificationItemView = NotificationItemView
