(function() {
  var AssetRSSView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AssetRSSView = (function(_super) {

    __extends(AssetRSSView, _super);

    function AssetRSSView() {
      return AssetRSSView.__super__.constructor.apply(this, arguments);
    }

    AssetRSSView.prototype.model = myd.ItemModel;

    AssetRSSView.prototype.events = {
      'click .rssRow a, .rssHeader a': 'clickedRSSReadMore'
    };

    AssetRSSView.prototype.initialize = function(params) {
      var rss_options, _ref1;
      rss_options = {
        limit: 3,
        header: true,
        snippet: false,
        content: true,
        linktarget: "_blank"
      };
      this.containerEl = params.container;
      this.removeEvents = (_ref1 = params.removeEvents) != null ? _ref1 : false;
      if (params.limit != null) {
        rss_options.limit = params.limit;
      }
      if (params.showContent != null) {
        rss_options.content = params.showContent;
      }
      this.context = params.context || "collections";
      return this.render(rss_options);
    };

    AssetRSSView.prototype.render = function(rss_options) {
      var _this = this;
      this.setElement(this.containerEl.find('.content'));
      if (!global.myd.feature.testing) {
        return this.$el.rssfeed(this.model.get("feed_url"), rss_options, function() {
          return _this.enhanceRssContents();
        });
      }
    };

    AssetRSSView.prototype.enhanceRssContents = function() {
      this.$el.addClass('content-loaded');
      this.$el.find("a[href*=feedburner], img[src*=feedburner], img[src*='ads.'], img[src*=pheedo], iframe").remove();
      if ((this.model.get("type") === "feed" || this.model.get("type") === "fact") && this.context !== "collections") {
        return this.$el.find('a').contents().unwrap().wrap("<span class='spanned-link'>").find("span");
      }
    };

    AssetRSSView.prototype.clickedRSSReadMore = function(event) {
      if (!this.removeEvents) {
        $(event.target).attr("target", "_blank").attr('href');
        return event.stopPropagation();
      }
    };

    return AssetRSSView;

  })(Backbone.View);

  global.myd.AssetRSSView = AssetRSSView;

}).call(this);
