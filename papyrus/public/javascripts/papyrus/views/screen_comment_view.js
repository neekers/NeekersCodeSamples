(function() {
  var ScreenCommentView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  ScreenCommentView = (function(_super) {

    __extends(ScreenCommentView, _super);

    function ScreenCommentView() {
      return ScreenCommentView.__super__.constructor.apply(this, arguments);
    }

    ScreenCommentView.prototype.model = myd.CommentModel;

    ScreenCommentView.prototype.tagName = "li";

    ScreenCommentView.prototype.events = {
      "click .delete-comment": "clickDeleteComment",
      "click .author, .author-name": "clickedAuthor",
      "click .view-more": "clickedViewMore"
    };

    ScreenCommentView.prototype.initialize = function(params) {
      if (params == null) {
        params = {
          container: [],
          prepend: false
        };
      }
      this.containerEl = params.container;
      return this.render(params);
    };

    ScreenCommentView.prototype.render = function(params) {
      var rendered_view_html, templateObj;
      templateObj = this.model.toJSON();
      templateObj.user_url = "/papyrus/" + new global.myd.Uri(this.model.get("author").entity_url).getPathname();
      rendered_view_html = Mustache.render($("#screen_comment_template").html(), templateObj);
      if (params.prepend) {
        this.containerEl.prepend(rendered_view_html);
        this.setElement($("li:first-child", this.containerEl));
      } else {
        this.containerEl.append(rendered_view_html);
        this.setElement($("li:last-child", this.containerEl));
      }
      return this.$el.find("date").relativeTime();
    };

    ScreenCommentView.prototype.clickDeleteComment = function() {
      this.model.set("deleted", true);
      return false;
    };

    ScreenCommentView.prototype.clickedAuthor = function() {
      var ownerUrl;
      ownerUrl = this.model.get("author").entity_url;
      Router.navigateToProfileTab({
        userPath: new global.myd.Uri(ownerUrl).getPathname(),
        tab: 'collections'
      });
      return false;
    };

    ScreenCommentView.prototype.clickedViewMore = function() {
      this.$el.find(".comment-text .comment").text(this.model.get("text"));
      this.$el.find(".comment-text").css("height", "auto");
      this.$el.find(".view-more").remove();
      return false;
    };

    return ScreenCommentView;

  })(Backbone.View);

  global.myd.ScreenCommentView = ScreenCommentView;

}).call(this);
