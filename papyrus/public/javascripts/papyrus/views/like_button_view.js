(function() {
  var LikeButtonView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  LikeButtonView = (function(_super) {

    __extends(LikeButtonView, _super);

    function LikeButtonView() {
      return LikeButtonView.__super__.constructor.apply(this, arguments);
    }

    LikeButtonView.prototype.model = myd.ScreenModel;

    LikeButtonView.prototype.className = "like-container";

    LikeButtonView.prototype.events = {
      'click': 'clickedLike',
      'click .follow-topic': 'clickedFollow'
    };

    LikeButtonView.prototype.initialize = function(params) {
      if (this.model.get("item") != null) {
        this.model.get("item").bind('change:collected', this.refreshLike, this);
      } else {
        this.model.bind('change:collected', this.refreshLike, this);
      }
      this.likeCount = this.$el.find(".like-count");
      return this.refreshLike();
    };

    LikeButtonView.prototype.clickedFollow = function() {
      var following_el;
      this.clickedLike();
      following_el = $(".follow-topic");
      if (following_el.find(".text").html().toLowerCase() === "following topic") {
        following_el.find(".text").html("FOLLOW TOPIC");
        following_el.removeClass("followed-topic-btn").addClass("following-topic-btn");
      } else {
        following_el.find(".text").html("FOLLOWING TOPIC");
        following_el.addClass("followed-topic-btn").removeClass("following-topic-btn");
      }
      return false;
    };

    LikeButtonView.prototype.clickedLike = function(event) {
      if (this.model.get("item") != null) {
        this.model.get("item").toggleLike();
      } else {
        this.model.toggleLike();
      }
      if (this.$el.hasClass("liked")) {
        this.$el.removeClass("liked");
      } else {
        this.$el.addClass("liked");
      }
      return false;
    };

    LikeButtonView.prototype.refreshLike = function() {
      var collectedCount, following_el, _ref1, _ref2;
      following_el = $(".follow-topic");
      if (this.model.get("collected")) {
        following_el.find(".text").html("FOLLOWING TOPIC");
        following_el.addClass("followed-topic-btn").removeClass("following-topic-btn");
      } else {
        following_el.find(".text").html("FOLLOW TOPIC");
      }
      following_el = $(".follow-topic");
      if (this.model.get("collected")) {
        following_el.find(".text").html("FOLLOWING TOPIC");
        following_el.addClass("followed-topic-btn").removeClass("following-topic-btn");
      } else {
        following_el.find(".text").html("FOLLOW TOPIC");
        following_el.removeClass("followed-topic-btn").addClass("following-topic-btn");
      }
      if (this.model.get("item") != null) {
        collectedCount = (_ref1 = this.model.get("item")) != null ? _ref1.get("collected_count") : void 0;
      } else {
        collectedCount = this.model.get("collected_count");
      }
      this.likeCount.html("" + collectedCount);
      if (((_ref2 = this.model.get("item")) != null ? _ref2.get("collected") : void 0) || this.model.get("collected")) {
        return this.$el.addClass("liked");
      }
    };

    return LikeButtonView;

  })(Backbone.View);

  global.myd.LikeButtonView = LikeButtonView;

}).call(this);
