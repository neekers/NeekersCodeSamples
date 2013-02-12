(function() {
  var LeaveCommentView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  LeaveCommentView = (function(_super) {

    __extends(LeaveCommentView, _super);

    function LeaveCommentView() {
      return LeaveCommentView.__super__.constructor.apply(this, arguments);
    }

    LeaveCommentView.prototype.model = myd.CommentModel;

    LeaveCommentView.prototype.tagName = "form";

    LeaveCommentView.prototype.events = {
      'keyup textarea': 'clickedPostComment',
      'click .leave-comment-text': 'clickedLeaveComment'
    };

    LeaveCommentView.prototype.bindToCollection = {
      "add": "clearForm"
    };

    LeaveCommentView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection = params.collection;
      this.item = params.item;
      this.model = new myd.CommentModel();
      return this.render();
    };

    LeaveCommentView.prototype.render = function() {
      var rendered_view_html;
      rendered_view_html = Mustache.render($("#leave_comment_template").html(), {
        avatar: myd.current_user_image_url
      });
      this.containerEl.append(rendered_view_html);
      this.setElement($("form.leave-comment", this.containerEl));
      this.textInput = this.$el.find(".leave-comment-text");
      this.textInput.keyup(function(e) {
        var _results;
        _results = [];
        while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
          _results.push($(this).height($(this).height() + 1));
        }
        return _results;
      });
      return this.delegateEvents();
    };

    LeaveCommentView.prototype.clickedLeaveComment = function() {
      var commentsBox, rowCount;
      commentsBox = this.containerEl.find(".screen-comments ol");
      commentsBox.scrollTop(commentsBox[0].scrollHeight);
      rowCount = this.textInput.attr("rows");
      if (rowCount === "1") {
        this.textInput.attr("rows", "3");
        return $(".post-comment-btn").show();
      }
    };

    LeaveCommentView.prototype.clickedPostComment = function(event) {
      var commentText, commentsBox;
      if (event.keyCode !== 13) {
        return true;
      }
      commentText = this.textInput.val().trim();
      if (commentText.length === 0) {
        this.textInput.addClass("field_validation_error");
        return false;
      } else {
        this.textInput.removeClass("field_validation_error");
      }
      this.model.set("text", commentText);
      this.collection.save(this.model);
      commentsBox = this.containerEl.find(".screen-comments ol");
      commentsBox.scrollTop(commentsBox[0].scrollHeight);
      return false;
    };

    LeaveCommentView.prototype.clearForm = function() {
      this.$el.find("textarea").val("");
      this.textInput.height(30);
      this.model = new myd.CommentModel();
      this.textInput.blur();
      $("body").focus();
      return false;
    };

    return LeaveCommentView;

  })(Backbone.View);

  global.myd.LeaveCommentView = LeaveCommentView;

}).call(this);
