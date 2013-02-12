global.myd ?= {}

CommentsCollection = Backbone.Collection.extend(
  model: myd.CommentModel
  fetched: false

  initialize: (params) ->
    @commentsUrl = params.comments_url
    @

  save: (comment) ->
    myd.serviceModule.post(
      url: @commentsUrl
      data: comment.toJSON()
      success: ( response ) =>
        @add(response)
      error: (response) =>
        @trigger("errorReset")
    )

  delete: (comment) ->
    if comment.get("deleted")
      myd.serviceModule.delete(
        url: comment.get("entity_url")
        success: ( response ) =>
          @remove(comment)
        error: (response) =>
          @trigger("errorReset")
      )

  fetch: (page = 0, per_page = 20) ->
    @fetched = true
    myd.serviceModule.get(
      url: @commentsUrl
      data: page: page, per_page: per_page
      success: ( response ) =>
        if page == 0
          @reset( response )
        else
          @add response.reverse(), at: 0
      error: (response) =>
        @trigger("errorReset")
    )
)

global.myd.CommentsCollection = CommentsCollection