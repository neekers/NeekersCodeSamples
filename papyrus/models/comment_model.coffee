global.myd ?= {}

class CommentModel extends Backbone.Model
  idAttribute: "uid"
  defaults:
    text: "This is a comment"
    created_timestamp: new Date()
    deleted: false
    truncated: false

  initialize: (params) ->
    @set("created_timestamp", new Date(@get("created_timestamp")*1000))
    @

global.myd.CommentModel = CommentModel
