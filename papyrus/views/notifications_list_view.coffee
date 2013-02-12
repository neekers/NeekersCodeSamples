global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class NotificationsListView extends Backbone.View
  collection: myd.NotificationsCollection
  notificationViews: []

  events:
    "click":                              "fallThrough"

  initialize: (params) ->
    @containerEl = params.container

    $("body").on "click", =>
      @toggleList(close: true, propagate: true)

    @collection = new myd.NotificationsCollection()
    @collection.bind("reset", @render, @)

  refresh: ->
    @collection.fetch()

  render: ->
    if $("#notifications").length == 0
      $("nav .create-btn").after('<span id="count-wrapper"><a href="#" id="notifications-count" class="zero"></a></span>')
      @countEl = $("#notifications-count")
      @countEl.bind("click", => @toggleList())
      $("nav").append(Mustache.render($("#notifications_list_template").html()))
      @setElement($("#notifications"))
    else
      @$el.find("ol#notifications-list").empty()


    unread = @collection.where(read: false)
    @setCount unread.length

    #Add each comment to the UI
    @notificationsOL = @$el.find("ol#notifications-list")
    if @collection.models.length > 0
      _.each @collection.models, (note) =>
        notification = new myd.NotificationItemView model: note, container: @notificationsOL
        notification.bind("clickedView", @closeList, @)
        @notificationViews.push notification
      @notificationsOL.show()
    else
      $("#no-notifications-message").show()
      @notificationsOL.hide()

    $(".notification-date").relativeTime()

  setCount: (count) ->
    count = if count > -1 then count else @collection.length
    @countEl.html(count)
    @countEl.toggleClass("zero", count == 0)

  closeList: ->
    @toggleList(close: true)

  toggleList: (params) ->

    # remove the first time callout if it's there

    #force close from body most likely
    if @$el? and params? and params.close?
      @closeDropOut()
      if params.propagate
        return true
      return false

    if @$el? and @$el.css("display") == "none"
      @collection.markAllRead()
      @$el.show()
    else
      @closeDropOut()
    false

  closeDropOut: ->
    if @countEl?
      @$el.slideUp(500)
      @setCount(0)
      @collection.reset(@collection.models)

  fallThrough: ->
    false

  onClose: ->
    $("body").off "click"

    _.each @notificationViews, (view) ->
      view.unbind("clickedView", @closeList, @)
      view.close()

global.myd.NotificationsListView = NotificationsListView
