global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class LeaveCommentView extends Backbone.View
  model: myd.CommentModel
  tagName: "form"

  events:
    'keyup textarea':          'clickedPostComment'
    'click .leave-comment-text':        'clickedLeaveComment'

  bindToCollection:
    "add":    "clearForm"

  initialize: (params) ->
    @containerEl = params.container
    @collection = params.collection
    @item = params.item
    @model = new myd.CommentModel( )

    @render()

  render: ->
    rendered_view_html = Mustache.render($("#leave_comment_template").html(), avatar: myd.current_user_image_url)
    @containerEl.append(rendered_view_html)

    @setElement($("form.leave-comment", @containerEl))
    @textInput = @$el.find(".leave-comment-text")
    @textInput.keyup((e) ->
      while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth")))
        $(this).height($(this).height()+1)
    )
    @delegateEvents()

  clickedLeaveComment: ->
    commentsBox = @containerEl.find(".screen-comments ol")
    commentsBox.scrollTop(commentsBox[0].scrollHeight)
    rowCount = @textInput.attr("rows")
    if rowCount == "1"
      @textInput.attr("rows", "3")
      $(".post-comment-btn").show()

  clickedPostComment: (event) ->
    if event.keyCode != 13
      return true

    commentText = @textInput.val().trim()
    if commentText.length == 0
      @textInput.addClass("field_validation_error")
      return false
    else
      @textInput.removeClass("field_validation_error")

    @model.set("text", commentText)

    #pass the item sync url so the comment model can add itself
    @collection.save(@model)
    commentsBox = @containerEl.find(".screen-comments ol")
    commentsBox.scrollTop(commentsBox[0].scrollHeight)
    false

  clearForm: ->
    @$el.find("textarea").val("")
    @textInput.height(30)
    @model = new myd.CommentModel()
    @textInput.blur()
    $("body").focus()
    false

global.myd.LeaveCommentView = LeaveCommentView
