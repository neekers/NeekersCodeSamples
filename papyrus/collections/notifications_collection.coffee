global.myd ?= {}

NotificationsCollection = Backbone.Collection.extend(
  model: myd.NotificationModel

  initialize: (params) ->
    @fetchUrl = myd.urls.notifications
    @

  fetch: ->
    myd.serviceModule.get(
      url: @fetchUrl
      success: ( response ) =>
        @reset( response )
      error: (response) =>
        @trigger("errorReset")
    )

  markAllRead: ->
    myd.serviceModule.post(
      url: @fetchUrl
      success: ( response ) =>
        _.each @models, (notification) ->
          notification.set("read", true)
    )
)

global.myd.NotificationsCollection = NotificationsCollection