(function() {
  var CollectionAuthorView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  CollectionAuthorView = (function(_super) {

    __extends(CollectionAuthorView, _super);

    function CollectionAuthorView() {
      return CollectionAuthorView.__super__.constructor.apply(this, arguments);
    }

    CollectionAuthorView.prototype.tagName = "div";

    CollectionAuthorView.prototype.className = "collection_tile_meta";

    CollectionAuthorView.prototype.events = {
      'click .asset_owner_url': 'clickedViewAssetOwner',
      'click .collection_tile_owner_image': 'clickedViewAssetOwner'
    };

    CollectionAuthorView.prototype.initialize = function() {
      return this;
    };

    CollectionAuthorView.prototype.clickedViewAssetOwner = function() {
      var ownerUrl;
      ownerUrl = this.model.get("item").get("owner").entity_url;
      Router.navigateToProfileTab({
        userPath: new global.myd.Uri(ownerUrl).getPathname(),
        tab: 'collections'
      });
      return false;
    };

    return CollectionAuthorView;

  })(Backbone.View);

  global.myd.CollectionAuthorView = CollectionAuthorView;

}).call(this);
