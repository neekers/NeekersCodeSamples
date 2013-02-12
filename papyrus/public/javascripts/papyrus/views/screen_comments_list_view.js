(function() {
  var ScreenCommentsListView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  ScreenCommentsListView = (function(_super) {

    __extends(ScreenCommentsListView, _super);

    function ScreenCommentsListView() {
      return ScreenCommentsListView.__super__.constructor.apply(this, arguments);
    }

    ScreenCommentsListView.prototype.collection = myd.CommentsCollection;

    ScreenCommentsListView.prototype.page = 0;

    ScreenCommentsListView.prototype.events = {
      'click .comments-count': 'clickedViewMore'
    };

    ScreenCommentsListView.prototype.bindToCollection = {
      "add": "addCommentUI",
      "remove": "removeCommentUI",
      "reset": "reset",
      "change:deleted": "deleteComment"
    };

    ScreenCommentsListView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.item = params.item;
      this.render();
      this.commentViews = [];
      return this.commentsCount = this.item.get('comment_count');
    };

    ScreenCommentsListView.prototype.render = function() {
      if ($(".screen-comments", this.containerEl).length === 0) {
        this.containerEl.prepend("<div class='screen-comments'><div class='section-title'>Comments</div><ol>");
        this.setElement($(".screen-comments", this.containerEl));
        this.commentsOL = this.$el.find("ol");
        if (this.item.get("comment_count") > 20) {
          this.$el.find(".section-title").hide();
          return this.$el.prepend("<a href='#' class='comments-count'>View all <span class='count'>" + this.commentsCount + "</span> comments <b class='notch'></b></a>");
        }
      }
    };

    ScreenCommentsListView.prototype.reset = function() {
      return this.renderList({
        prepend: this.page > 0
      });
    };

    ScreenCommentsListView.prototype.removeCommentUI = function(removedCommentModel, collection, options) {
      var removeView;
      removeView = this.commentViews[options.index];
      if (removeView != null) {
        removeView.close();
        this.commentViews.splice(options.index, 1);
        this.commentsCount--;
        return this.setCommentsCount();
      }
    };

    ScreenCommentsListView.prototype.renderList = function(params) {
      var _this = this;
      if (params == null) {
        params = {
          prepend: false
        };
      }
      _.each(this.collection.models, function(comment) {
        var commentView;
        commentView = new myd.ScreenCommentView({
          model: comment,
          container: _this.commentsOL
        });
        return _this.commentViews.push(commentView);
      });
      this.setCommentsCount();
      this.trigger("rendered");
      this.$el.animate({
        'scrollTop': this.$el.height() + 200
      }, 1000);
      if (this.item.get("showComments")) {
        $("body. html").animate({
          'scrollTop': this.$el.offset().top
        }, 1000);
        this.item.set("showComments", false);
      }
      return this;
    };

    ScreenCommentsListView.prototype.setCommentsCount = function() {
      var commentsText;
      commentsText = myd.pluralizeIfNeededText(this.commentsCount, 'Comment');
      this.$el.find(".section-title").html("" + this.commentsCount + " " + commentsText);
      return this.$el.find(".count").html("" + this.commentsCount);
    };

    ScreenCommentsListView.prototype.deleteComment = function(model) {
      return this.collection["delete"](model);
    };

    ScreenCommentsListView.prototype.addCommentUI = function(newComment, collection, options) {
      var commentView;
      commentView = new myd.ScreenCommentView({
        model: newComment,
        container: this.commentsOL,
        prepend: this.page > 0
      });
      this.commentViews.splice(options.index, 0, commentView);
      this.commentsCount++;
      return this.setCommentsCount();
    };

    ScreenCommentsListView.prototype.clickedViewMore = function() {
      this.page++;
      this.collection.fetch(this.page);
      this.$el.find(".comments-count").remove();
      this.$el.find(".title").show();
      return false;
    };

    ScreenCommentsListView.prototype.onClose = function() {
      return _.each(this.commentViews, function(commentView) {
        commentView.unbind("deleted", this.deleteComment, this);
        return commentView.close();
      });
    };

    return ScreenCommentsListView;

  })(Backbone.View);

  global.myd.ScreenCommentsListView = ScreenCommentsListView;

}).call(this);
