global.myd ?= {}

class NotificationModel extends Backbone.Model
  defaults:
    type: "comment" #comment, commentoncomment
    source_user_name: "Eric Novins"
    text: "This is a comment"
    created_timestamp: new Date()
    read: false

  initialize: (params) ->
    @

global.myd.NotificationModel = NotificationModel
