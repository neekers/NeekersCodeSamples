(function() {
  var TopicHeaderView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  TopicHeaderView = (function(_super) {

    __extends(TopicHeaderView, _super);

    function TopicHeaderView() {
      return TopicHeaderView.__super__.constructor.apply(this, arguments);
    }

    TopicHeaderView.prototype.model = myd.FrontMatterTileModel;

    TopicHeaderView.prototype.id = "topic-header";

    TopicHeaderView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection = params.collection;
      this.model.bind("change:collected", this.refreshLike, this);
      return this.render();
    };

    TopicHeaderView.prototype.render = function() {
      var rendered_view_html;
      rendered_view_html = Mustache.render($("#topic_header_template").html(), this.model.toJSON());
      this.containerEl.find(".explore-navigation-header").after(rendered_view_html);
      this.setElement($("#topic-header", this.containerEl));
      return this.likeButtonView = new myd.LikeButtonView({
        model: this.model,
        el: this.$el.find(".like-container")
      });
    };

    TopicHeaderView.prototype.onClose = function() {
      return this.likeButtonView.close();
    };

    return TopicHeaderView;

  })(Backbone.View);

  global.myd.TopicHeaderView = TopicHeaderView;

}).call(this);
