(function() {
  var ItemLightboxView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ItemLightboxView = (function(_super) {

    __extends(ItemLightboxView, _super);

    function ItemLightboxView() {
      return ItemLightboxView.__super__.constructor.apply(this, arguments);
    }

    ItemLightboxView.prototype.model = myd.ScreenModel;

    ItemLightboxView.prototype.events = {
      'click .more-info': 'clickedMoreInfo',
      'click': 'stopClick',
      'click .origin_source_url': 'clickedSource'
    };

    ItemLightboxView.prototype.initialize = function(params) {
      this.model.set("index", 1);
      this.model.get("item").bind("change:metaData", this.toggleMetaDataView, this);
      return this.render();
    };

    ItemLightboxView.prototype.render = function() {
      this.overlayView = new myd.OverlayView();
      this.overlayView.bind("clickedClose", this.onClose, this);
      this.overlayView.$el.html("<div id='item-lightbox'>");
      this.setElement($("#item-lightbox"));
      this.$el.html(myd.renderScreen(this.model.toJSON(), "itemlightbox", {
        showActions: true,
        showLikeButton: true
      }));
      this.$el.css("opacity", 1);
      this.$el.find(".image-wrapper").css("opacity", 1);
      if (this.model.get("item").get("type") === "video") {
        myd.renderVideoEmbed(this.model, this.$el, 600);
      } else if (this.model.get("item").get("type") === "feed") {
        this.assetRSSView = new global.myd.AssetRSSView({
          model: this.model.get("item"),
          container: this.$el
        });
      }
      this.likeButtonView = new myd.LikeButtonView({
        model: this.model,
        el: this.$el.find(".like-container")
      });
      return this.$el.find(".below-asset").addClass('cf');
    };

    ItemLightboxView.prototype.toggleMetaDataView = function() {
      return this.metaDataView = new global.myd.AssetMetaDataView({
        model: this.model.get("item"),
        container: this.$el.find(".below-asset")
      });
    };

    ItemLightboxView.prototype.clickedMoreInfo = function(event) {
      var isShown;
      if (typeof this.metaDataView === "undefined" || this.metaDataView === null) {
        this.model.get("item").fetchMetaData();
      } else {
        isShown = this.metaDataView.toggle();
      }
      return false;
    };

    ItemLightboxView.prototype.clickedSource = function() {
      var sourceUrl;
      sourceUrl = this.model.get("item").get("source_page_url");
      if ((sourceUrl != null ? sourceUrl.indexOf("http://") : void 0) === 0) {
        this.sourceWindow = window.open(sourceUrl);
      }
      return false;
    };

    ItemLightboxView.prototype.stopClick = function(event) {
      if ($(event.target).hasClass("asset-wrapper")) {
        return true;
      }
      return false;
    };

    ItemLightboxView.prototype.onClose = function() {
      var _this = this;
      return this.$el.slideUp(500, function() {
        if (_this.metaDataView != null) {
          _this.metaDataView.close();
        }
        if (_this.likeButtonView != null) {
          _this.likeButtonView.close();
        }
        if (_this.assetRSSView != null) {
          _this.assetRSSView.close();
        }
        _this.overlayView.unbind("clickedClose", _this.onClose, _this);
        return _this.overlayView.close();
      });
    };

    return ItemLightboxView;

  })(Backbone.View);

  global.myd.ItemLightboxView = ItemLightboxView;

}).call(this);
