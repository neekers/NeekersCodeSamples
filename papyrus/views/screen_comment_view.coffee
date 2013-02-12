global.myd ?= {}

renderAsset = global.myd.renderAsset
serviceModule = myd.serviceModule

class ScreenCommentView extends Backbone.View
  model: myd.CommentModel
  tagName: "li"

  events:
    "click .delete-comment":            "clickDeleteComment"
    "click .author, .author-name":      "clickedAuthor"
    "click .view-more":                 "clickedViewMore"

  initialize: (params = container: [], prepend: false) ->
    @containerEl = params.container
    @render(params)

  render: (params) ->
    templateObj = @model.toJSON()
    templateObj.user_url = "/papyrus/" + new global.myd.Uri(@model.get("author").entity_url).getPathname()
    rendered_view_html = Mustache.render($("#screen_comment_template").html(), templateObj )
    if params.prepend
      @containerEl.prepend(rendered_view_html)
      @setElement($("li:first-child", @containerEl))
    else
      @containerEl.append(rendered_view_html)
      @setElement($("li:last-child", @containerEl))

    @$el.find("date").relativeTime()

  clickDeleteComment: ->
    @model.set("deleted", true)
    false

  clickedAuthor: ->
    ownerUrl = @model.get("author").entity_url
    Router.navigateToProfileTab(userPath: new global.myd.Uri(ownerUrl).getPathname(), tab: 'collections')
    false

  clickedViewMore: ->
    @$el.find(".comment-text .comment").text(@model.get("text"))
    @$el.find(".comment-text").css("height", "auto")
    @$el.find(".view-more").remove()
    false

global.myd.ScreenCommentView = ScreenCommentView
