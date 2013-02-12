global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class ScreenCommentsListView extends Backbone.View
  collection: myd.CommentsCollection
  page: 0

  events:
    'click .comments-count':      'clickedViewMore'
    
  bindToCollection:
    "add": "addCommentUI"
    "remove": "removeCommentUI"
    "reset": "reset"
    "change:deleted": "deleteComment"

  initialize: (params) ->
    @containerEl = params.container
    @item = params.item
    @render()
    @commentViews = []
    @commentsCount = @item.get('comment_count')

  render: ->
    if $(".screen-comments", @containerEl).length == 0
      @containerEl.prepend("<div class='screen-comments'><div class='section-title'>Comments</div><ol>")
      @setElement($(".screen-comments", @containerEl))
      @commentsOL = @$el.find("ol")
      if @item.get("comment_count") > 20
        @$el.find(".section-title").hide()
        @$el.prepend("<a href='#' class='comments-count'>View all <span class='count'>#{@commentsCount}</span> comments <b class='notch'></b></a>")

  reset: ->
    @renderList(prepend: @page > 0)

  removeCommentUI: (removedCommentModel, collection, options) ->
    removeView = @commentViews[options.index]
    if removeView?
      removeView.close()
      @commentViews.splice(options.index, 1)
      @commentsCount--
      @setCommentsCount()

  renderList: (params = prepend: false) ->
    _.each @collection.models, (comment) =>
      commentView = new myd.ScreenCommentView model: comment, container: @commentsOL
      @commentViews.push commentView

    @setCommentsCount()
    @trigger("rendered")

    @$el.animate({
    'scrollTop':  @$el.height() + 200
    }, 1000);

    if @item.get("showComments")
      $("body. html").animate({
        'scrollTop':  @$el.offset().top
      }, 1000);
      @item.set("showComments", false)
    @

  setCommentsCount: ->
    commentsText = myd.pluralizeIfNeededText(@commentsCount, 'Comment')
    @$el.find(".section-title").html("#{@commentsCount} #{commentsText}")
    @$el.find(".count").html("#{@commentsCount}")

  deleteComment: (model) ->
    @collection.delete model

  addCommentUI: (newComment, collection, options) ->
    commentView = new myd.ScreenCommentView model: newComment, container: @commentsOL, prepend: (@page > 0)
    @commentViews.splice(options.index, 0, commentView)
    @commentsCount++
    @setCommentsCount()

  clickedViewMore: ->
    @page++
    @collection.fetch(@page)
    @$el.find(".comments-count").remove()
    @$el.find(".title").show()
    false

  onClose: ->
    _.each @commentViews, (commentView) ->
      commentView.unbind("deleted", @deleteComment, @)
      commentView.close()

global.myd.ScreenCommentsListView = ScreenCommentsListView
