(function() {
  var FollowingGridCollection, GridCollection, ModifiedDateGridCollection, MostCommentedGridCollection, MostLikesGridCollection, NewestGridCollection, ProfileGridCollection, ReusesGridCollection, TopicGridCollection, ViewsGridCollection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  GridCollection = Backbone.Collection.extend({
    model: myd.ScreenModel,
    initialize: function() {},
    comparator: function(item) {
      return item.get('index');
    },
    fetch: function(collection) {
      var url,
        _this = this;
      url = this.getUrl(collection);
      if (this.contentLoaded(url)) {
        return;
      }
      return myd.serviceModule.get({
        url: url,
        success: function(response) {
          return _this.parse(response);
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    },
    fetchByUrl: function(url) {
      var _this = this;
      if (this.contentLoaded(url)) {
        return;
      }
      return myd.serviceModule.get({
        url: url,
        success: function(response) {
          return _this.parse(response);
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    },
    fetchSearchResults: function(searchQuery) {
      var _this = this;
      return myd.serviceModule.get({
        url: myd.urls.search + searchQuery,
        success: function(response) {
          return _this.parse(response);
        }
      });
    },
    fetchInternalSearchResults: function(searchQuery) {
      var _this = this;
      return myd.serviceModule.get({
        url: myd.urls.search_internal + searchQuery,
        success: function(response) {
          return _this.parse(response);
        }
      });
    },
    parse: function(response) {
      var asset, assets, _i, _len, _ref1;
      this.frontMatter = new myd.FrontMatterTileModel(response.collection);
      this.uid = response.collection.uid;
      this.syncUrl = response.collection.sync_url;
      this.url = this.syncUrl;
      this.newItemUrl = response.collection.add_new_item_url;
      this.coverUrl = response.collection.cover_url;
      this.coverAsset = response.collection.cover_asset;
      this.editItemsUrl = response.collection.edit_items_url;
      this.collection = response.collection;
      this.originalCover = new myd.ItemModel(response.collection.cover_asset);
      if (this.context === "likes") {
        this.collection.screens = this.sortScreensCollectedCountDescending();
      }
      if (this.context === "newest") {
        this.collection.screens = this.sortScreensByDateDescending();
      }
      if (this.context === "topic") {
        if (this.filter === "likes") {
          this.collection.screens = this.sortScreensCollectedCountDescending();
        }
        if (this.filter === "newest") {
          this.collection.screens = this.sortScreensByDateDescending();
        }
        if (this.filter === "modified") {
          this.collection.screens = this.sortScreensByModifiedDateDescending();
        }
        if (this.filter === "commented") {
          this.collection.screens = this.sortScreensByCommentsDescending();
        }
        if (this.filter === "views") {
          this.collection.screens = this.sortScreensByViewsDescending();
        }
        if (this.filter === "reuses") {
          this.collection.screens = this.sortScreensByReusesDescending();
        }
      }
      if (this.context === "profile" && this.tab === "collections") {
        this.collection.screens = this.sortScreensByModifiedDateDescending();
      }
      assets = [];
      _ref1 = response.collection.screens;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        asset = _ref1[_i];
        if (asset.item.cover_asset == null) {
          asset.item.cover_asset = {
            thumbnail_url: "/images/default_new_collection.png",
            asset_url: "/images/default_new_collection.png"
          };
        }
        if (typeof asset.editable === "undefined" && this.context === "profile") {
          asset.editable = response.collection.editable;
        }
        assets.push(new myd.ScreenModel(asset));
      }
      this.reset(assets, {
        sort: false
      });
      return this.originalResponse = response;
    },
    sortScreensCollectedCountDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.collected_count;
      });
      return sortedScreens;
    },
    sortScreensByDateDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.created_timestamp;
      });
      return sortedScreens;
    },
    sortScreensByModifiedDateDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.modified_timestamp;
      });
      return sortedScreens;
    },
    sortScreensByCommentsDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.total_comment_count;
      });
      return sortedScreens;
    },
    sortScreensByViewsDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.view_count;
      });
      return sortedScreens;
    },
    sortScreensByReusesDescending: function() {
      var sortedScreens,
        _this = this;
      sortedScreens = _.sortBy(this.collection.screens, function(screen) {
        return -screen.item.reuse_count;
      });
      return sortedScreens;
    },
    cancelEditing: function() {
      this.setCoverImage(this.originalCover);
      this.parse(this.originalResponse);
      return this.sync();
    },
    setCoverImage: function(item) {
      var _this = this;
      return myd.serviceModule.post({
        url: this.coverUrl,
        data: {
          cover_asset_url: item.get('entity_url')
        },
        success: function(response) {}
      });
    },
    getUrl: function(collection) {
      if (collection != null) {
        return collection.pathname;
      } else {
        return this.url;
      }
    },
    getLastPath: function() {
      if (this.lastRequestUrl != null) {
        if (this.lastRequestUrl.indexOf("http://") > -1) {
          return false;
        } else {
          return this.lastRequestUrl.slice(1);
        }
      } else {
        return "";
      }
    },
    contentLoaded: function(url) {
      if (this.lastRequestUrl === url) {
        return true;
      }
      this.lastRequestUrl = url;
      return false;
    },
    deleteScreen: function(collectionUrl, asset) {
      var _this = this;
      return myd.serviceModule["delete"]({
        url: asset.get("item").get("type") === "collection" ? myd.urls.edit_collection : asset.get('item').get("entity_url"),
        data: asset.get("item").get("type") === "collection" ? [collectionUrl] : void 0,
        success: function(response) {
          var oldCount;
          _.each(_this.models, function(item) {
            if (item.get("originalUID") === asset.get("uid") && item.get("type") === "collection") {
              return item.set({
                type: "fact",
                text: "This item has been removed by the owner.",
                thumbnail_url: null
              });
            }
          });
          _this.remove(asset);
          oldCount = _this.frontMatter.get("collection_count");
          _this.frontMatter.set("collection_count", --oldCount);
          return _this.reset(_this.models);
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    },
    addItemToCollection: function(itemModel, atIndex) {
      var _this = this;
      if (atIndex == null) {
        atIndex = 0;
      }
      return myd.serviceModule.post({
        url: this.editItemsUrl,
        data: [
          {
            entity_url: itemModel.get("entity_url"),
            index: atIndex
          }
        ],
        success: function(response) {
          return _this.add(new myd.ScreenModel(response[0]), {
            at: atIndex
          });
        },
        error: function(response) {
          return global.myd.modalAlert(response.responseText);
        }
      });
    },
    addNewItem: function(itemModel, atIndex) {
      var _this = this;
      if (atIndex == null) {
        atIndex = 0;
      }
      itemModel.set("index", atIndex);
      return myd.serviceModule.post({
        url: this.newItemUrl,
        data: itemModel,
        success: function(response) {
          return _this.add(new myd.ScreenModel(response), {
            at: atIndex
          });
        },
        error: function(response) {
          return global.myd.modalAlert(response.responseText);
        }
      });
    },
    saveCurrentStateAsOriginal: function() {
      var response,
        _this = this;
      response = {};
      response.collection = this.frontMatter.toJSON();
      response.collection.screens = this.toJSON();
      _.each(response.collection.screens, function(screen) {
        return screen.item = screen.item.toJSON();
      });
      return this.originalResponse = response;
    },
    sync: function(callBack) {
      var changedStuff, itemsPayload, needSync,
        _this = this;
      itemsPayload = [];
      needSync = true;
      _.each(this.models, function(screen) {
        var item;
        if (!screen.isNew()) {
          item = screen.changed;
          item.uid = screen.get('uid');
          if (!_.isEmpty(screen.get("item").changed)) {
            item.item = screen.get("item").changed;
          }
          delete item.index;
          delete item.nextIndex;
          delete item.prevIndex;
          if (item.item != null) {
            item.item.uid = screen.get("item").get("uid");
          }
        } else {
          item = screen;
        }
        itemsPayload.push(item);
        if (Object.keys(item).length > 1) {
          return needSync = true;
        }
      });
      changedStuff = this.frontMatter.changed;
      if (Object.keys(changedStuff).length) {
        needSync = true;
      }
      changedStuff.screens = itemsPayload;
      if (!needSync) {
        if (callBack != null) {
          callBack();
        }
        return;
      }
      return myd.serviceModule.post({
        url: this.syncUrl,
        data: changedStuff,
        success: function(response) {
          if (callBack != null) {
            return callBack(response);
          }
        },
        error: function(response) {
          return global.myd.modalAlert(response.responseText);
        }
      });
    },
    syncReorder: function(items, callBack) {
      var _this = this;
      return myd.serviceModule.post({
        url: this.syncUrl,
        data: {
          screens: items
        },
        success: function(response) {
          if (callBack != null) {
            return callBack();
          }
        },
        error: function(response) {
          return global.myd.modalAlert(response.responseText);
        }
      });
    }
  });

  MostLikesGridCollection = (function(_super) {

    __extends(MostLikesGridCollection, _super);

    function MostLikesGridCollection() {
      return MostLikesGridCollection.__super__.constructor.apply(this, arguments);
    }

    MostLikesGridCollection.prototype.initialize = function() {
      return this.context = "likes";
    };

    return MostLikesGridCollection;

  })(GridCollection);

  NewestGridCollection = (function(_super) {

    __extends(NewestGridCollection, _super);

    function NewestGridCollection() {
      return NewestGridCollection.__super__.constructor.apply(this, arguments);
    }

    NewestGridCollection.prototype.initialize = function() {
      return this.context = "newest";
    };

    return NewestGridCollection;

  })(GridCollection);

  ModifiedDateGridCollection = (function(_super) {

    __extends(ModifiedDateGridCollection, _super);

    function ModifiedDateGridCollection() {
      return ModifiedDateGridCollection.__super__.constructor.apply(this, arguments);
    }

    ModifiedDateGridCollection.prototype.initialize = function() {
      return this.context = "modified";
    };

    return ModifiedDateGridCollection;

  })(GridCollection);

  MostCommentedGridCollection = (function(_super) {

    __extends(MostCommentedGridCollection, _super);

    function MostCommentedGridCollection() {
      return MostCommentedGridCollection.__super__.constructor.apply(this, arguments);
    }

    MostCommentedGridCollection.prototype.initialize = function() {
      return this.context = "comments";
    };

    return MostCommentedGridCollection;

  })(GridCollection);

  ViewsGridCollection = (function(_super) {

    __extends(ViewsGridCollection, _super);

    function ViewsGridCollection() {
      return ViewsGridCollection.__super__.constructor.apply(this, arguments);
    }

    ViewsGridCollection.prototype.initialize = function() {
      return this.context = "views";
    };

    return ViewsGridCollection;

  })(GridCollection);

  ReusesGridCollection = (function(_super) {

    __extends(ReusesGridCollection, _super);

    function ReusesGridCollection() {
      return ReusesGridCollection.__super__.constructor.apply(this, arguments);
    }

    ReusesGridCollection.prototype.initialize = function() {
      return this.context = "reuses";
    };

    return ReusesGridCollection;

  })(GridCollection);

  TopicGridCollection = (function(_super) {

    __extends(TopicGridCollection, _super);

    function TopicGridCollection() {
      return TopicGridCollection.__super__.constructor.apply(this, arguments);
    }

    TopicGridCollection.prototype.initialize = function() {
      return this.context = "topic";
    };

    return TopicGridCollection;

  })(GridCollection);

  ProfileGridCollection = (function(_super) {

    __extends(ProfileGridCollection, _super);

    function ProfileGridCollection() {
      return ProfileGridCollection.__super__.constructor.apply(this, arguments);
    }

    ProfileGridCollection.prototype.initialize = function(params) {
      this.context = "profile";
      return this.tab = params.tab;
    };

    return ProfileGridCollection;

  })(GridCollection);

  FollowingGridCollection = (function(_super) {

    __extends(FollowingGridCollection, _super);

    function FollowingGridCollection() {
      return FollowingGridCollection.__super__.constructor.apply(this, arguments);
    }

    FollowingGridCollection.prototype.initialize = function() {
      return this.context = "following";
    };

    return FollowingGridCollection;

  })(GridCollection);

  global.myd.GridCollection = GridCollection;

  global.myd.MostLikesGridCollection = MostLikesGridCollection;

  global.myd.NewestGridCollection = NewestGridCollection;

  global.myd.TopicGridCollection = TopicGridCollection;

  global.myd.ProfileGridCollection = ProfileGridCollection;

  global.myd.ModifiedDateGridCollection = ModifiedDateGridCollection;

  global.myd.MostCommentedGridCollection = MostCommentedGridCollection;

  global.myd.ViewsGridCollection = ViewsGridCollection;

  global.myd.ReusesGridCollection = ReusesGridCollection;

  global.myd.FollowingGridCollection = FollowingGridCollection;

}).call(this);
