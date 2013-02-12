(function() {
  var ScreenModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ScreenModel = (function(_super) {

    __extends(ScreenModel, _super);

    function ScreenModel() {
      return ScreenModel.__super__.constructor.apply(this, arguments);
    }

    ScreenModel.prototype.idAttribute = "uid";

    ScreenModel.prototype.defaults = {
      editable: false,
      showActions: false,
      showLikeButton: false,
      showReuseButton: false,
      showFacebookShareButton: false,
      showScreenNavigation: false,
      showDeleteButton: false
    };

    ScreenModel.prototype.initialize = function(options) {
      this.bookmark_url = myd.urls.bookmarks;
      return this.set("item", new myd.ItemModel(this.get("item")));
    };

    ScreenModel.prototype.setCoverImage = function() {
      var _this = this;
      myd.serviceModule.post({
        url: this.collection.coverUrl,
        data: {
          cover_asset_url: this.get("item").get('entity_url')
        },
        success: function(response) {}
      });
      return this.isCoverImageCandidate = false;
    };

    return ScreenModel;

  })(Backbone.Model);

  global.myd.ScreenModel = ScreenModel;

}).call(this);
