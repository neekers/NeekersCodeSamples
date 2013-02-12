(function() {
  var AssetMetaDataView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AssetMetaDataView = (function(_super) {

    __extends(AssetMetaDataView, _super);

    function AssetMetaDataView() {
      return AssetMetaDataView.__super__.constructor.apply(this, arguments);
    }

    AssetMetaDataView.prototype.model = myd.ScreenModel;

    AssetMetaDataView.prototype.events = {
      'click .origin_source_url': 'clickedViewSource',
      'click .parent_collection_url': 'clickedViewParentCollection',
      'click .asset_owner_url': 'clickedViewAssetOwner'
    };

    AssetMetaDataView.prototype.initialize = function(params) {
      var all_meta_data;
      this.containerEl = params.container;
      all_meta_data = this.model.get("metaData");
      if (!!all_meta_data) {
        if (all_meta_data.uploaded) {
          all_meta_data.source_url_name = "Uploaded by User";
        } else if (all_meta_data.source_url === null && all_meta_data.asset_url === null) {
          all_meta_data.source_url_name = "Added by User";
        } else if (all_meta_data.source_url === null) {
          all_meta_data.source_url = all_meta_data.asset_url;
        }
        all_meta_data.owner_link = "/papyrus/p" + new global.myd.Uri(all_meta_data.owner.user_url).getPathname() + "/collections";
        return this.render(all_meta_data);
      }
    };

    AssetMetaDataView.prototype.render = function(all_meta_data) {
      var template;
      this.containerEl.append("<div class='meta_data_holder' style='display: none;'>");
      this.setElement($(".meta_data_holder", this.containerEl));
      this.containerEl.toggleClass('showing_meta_data', !!all_meta_data);
      template = $("#asset_meta_data_template").html();
      this.$el.html(Mustache.render(template, all_meta_data));
      return this.$el.slideDown();
    };

    AssetMetaDataView.prototype.toggle = function() {
      this.containerEl.toggleClass('showing_meta_data');
      if (this.containerEl.hasClass("showing_meta_data")) {
        this.$el.slideDown();
        return true;
      } else {
        this.$el.slideUp();
        return false;
      }
    };

    AssetMetaDataView.prototype.clickedViewSource = function() {
      var sourceUrl;
      sourceUrl = this.model.get("metaData").source_url;
      if (sourceUrl.indexOf("http://") === 0) {
        this.sourceWindow = window.open(this.model.get("metaData").source_url);
      }
      return false;
    };

    AssetMetaDataView.prototype.clickedViewParentCollection = function(event) {
      var collectionRoute, parentCollectionUrl;
      parentCollectionUrl = $(event.target).attr('href');
      collectionRoute = global.myd.routesModule.getRoutesFromUrl(parentCollectionUrl);
      Router.navigate(collectionRoute.getPapyrusPath(), {
        trigger: true
      });
      return false;
    };

    AssetMetaDataView.prototype.clickedViewAssetOwner = function() {
      var ownerUrl;
      ownerUrl = this.model.get("metaData").owner.user_url;
      Router.navigateToProfileTab({
        userPath: new global.myd.Uri(ownerUrl).getPathname(),
        tab: 'collections'
      });
      return false;
    };

    AssetMetaDataView.prototype.onClose = function() {
      return this.containerEl.removeClass("showing_meta_data");
    };

    return AssetMetaDataView;

  })(Backbone.View);

  global.myd.AssetMetaDataView = AssetMetaDataView;

}).call(this);
