(function() {
  var ProfileView, ProifleBaseView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ProifleBaseView = (function(_super) {

    __extends(ProifleBaseView, _super);

    function ProifleBaseView() {
      return ProifleBaseView.__super__.constructor.apply(this, arguments);
    }

    ProifleBaseView.prototype.collection = myd.GridCollection;

    ProifleBaseView.prototype.showFrontMatter = true;

    ProifleBaseView.prototype.bindToCollection = {
      'errorReset': "renderError",
      'reset': "reset",
      'deleteScreen': "deleteScreen"
    };

    ProifleBaseView.prototype.events = function() {
      return {
        'click .follow-user': 'followClicked'
      };
    };

    ProifleBaseView.prototype.followClicked = function() {
      var bookmark, ent, following_el;
      if ((this.currentUser != null)) {
        this.collection.frontMatter = this.currentUser;
        ent = this.collection.frontMatter.get("entity_url");
      } else {
        ent = this.collection.frontMatter.get("owner").entity_url;
      }
      this.collection.frontMatter.set("entity_url", ent);
      bookmark = false;
      following_el = $(".follow-user");
      if (following_el.find(".text").html().toLowerCase() !== "following user") {
        bookmark = true;
      }
      return this.follow_unfollow(this.collection.frontMatter, bookmark);
    };

    ProifleBaseView.prototype.handleFollowUnfollow = function() {
      var following_el;
      following_el = $(".follow-user");
      if (following_el.find(".text").html().toLowerCase() === "following user") {
        following_el.find(".text").html("FOLLOW USER");
        return following_el.removeClass("followed-user-btn").addClass("following-user-btn");
      } else {
        following_el.find(".text").html("FOLLOWING USER");
        return following_el.addClass("followed-user-btn").removeClass("following-user-btn");
      }
    };

    ProifleBaseView.prototype.follow_unfollow = function(collection, bookmark) {
      var _this = this;
      return myd.serviceModule.post({
        url: myd.urls.bookmarks,
        data: {
          entity_url: collection.get("entity_url"),
          bookmarked: bookmark
        },
        success: function(response) {
          var newCount;
          newCount = bookmark;
          if (response.collected) {
            collection.set("collected_count", ++newCount);
          } else {
            collection.set("collected_count", newCount > 0 ? --newCount : 0);
          }
          _this.handleFollowUnfollow();
          return collection.set('collected', response.collected);
        }
      });
    };

    ProifleBaseView.prototype.initialize = function(params) {
      this.frontMatterView = null;
      this.context = params.context;
      this.clearHistory = params.clearHistory || false;
      this.editBar = $('.edit');
      this.filter = params.filter;
      this.lastCollageFilterOption = null;
      this.lastElementFilterOption = null;
      this.screenViews = [];
      this.tileViewCreator = params.tileViewCreator || function(tileModel) {
        var assetView, entity_url;
        entity_url = tileModel.get("entity_url");
        assetView = new myd.ScreenView({
          model: tileModel,
          context: params.context,
          inline: params.inline,
          tab: params.tab
        });
        assetView.bind('selected', this.selectedAsset, this);
        assetView.bind('delete', this.deleteScreen, this);
        this.screenViews.push(assetView);
        return assetView;
      };
      return this.collection = params.collection;
    };

    ProifleBaseView.prototype.reset = function(event) {
      var _this = this;
      if (this.showFrontMatter && this.frontMatterView !== null) {
        this.frontMatterView.unbind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.unbind("editBackground", this.launchEditBackground, this);
        this.frontMatterView.close();
      }
      return this.render();
    };

    ProifleBaseView.prototype.render = function() {
      var _this = this;
      this.editBar.find('.cancel-edit-btn').click(function() {
        return _this.cancelEdit();
      });
      this.editBar.find('.done-edit-btn').click(function() {
        return _this.finishEdit();
      });
      this.editBar.find('.reorder-btn').click(function() {
        return _this.launchReorder();
      });
      if (this.showFrontMatter) {
        this.frontMatterView = new global.myd.CollageHeaderView({
          container: this.$el,
          model: this.collection.frontMatter,
          collection: this.collection,
          isEditing: this.weAreInEditingMode || false,
          type: {
            likes: "likes",
            profile: "profile",
            newest: "newest",
            collections: "collection"
          }[this.context]
        });
        this.frontMatterView.bind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.bind("editBackground", this.launchEditBackground, this);
      }
      if (myd.feature.turntable && (this.context === "likes" || this.context === "newest")) {
        this.turntableExploreView = new myd.TurntableExploreView({
          container: this.$el,
          collection: this.collection
        });
      }
      $(".page-header").removeClass("collection");
      this.renderCollectionTiles();
      if (this.collection.frontMatter.get("cover_asset") != null) {
        this.trigger("rendered", {
          clearHistory: this.clearHistory,
          thumbnail: this.collection.frontMatter.get("cover_asset").thumbnail_url
        });
      } else {
        this.trigger("rendered", {
          clearHistory: this.clearHistory
        });
      }
      this.$el.show();
      if (this.inline && this.collection.frontMatter.get("editable")) {
        this.editCollectionButton.show();
        this.editCollectionButton.click(function() {
          return _this.enterEditingMode();
        });
      } else {
        this.editCollectionButton.hide();
      }
      if (this.startInEditMode) {
        return this.enterEditingMode();
      }
    };

    ProifleBaseView.prototype.renderCollectionTiles = function() {
      var rendered_view_html,
        _this = this;
      rendered_view_html = this.collection.map(function(tile) {
        var view;
        view = _this.tileViewCreator(tile);
        view.render(_this.streamView);
        return view.el;
      });
      if (this.$el.find('article').length) {
        this.$el.find('article').html(rendered_view_html);
      } else {
        this.$el.find('.collage-list').html(rendered_view_html);
      }
      if (this.weAreInEditingMode) {
        return this.addFullScreenAddBar();
      }
    };

    ProifleBaseView.prototype.display = function() {
      this.$el.show();
      return this.collection.fetch();
    };

    ProifleBaseView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    ProifleBaseView.prototype.deleteScreen = function(screen) {
      return this.collection.remove(screen);
    };

    ProifleBaseView.prototype.deleteScreen = function(asset) {
      return this.collection.deleteScreen(asset.get("item").get("entity_url"), asset);
    };

    ProifleBaseView.prototype.renderError = function() {
      return this.$el.html("There was an error processing your request.");
    };

    ProifleBaseView.prototype.onClose = function() {
      var _this = this;
      _.each(this.screenViews, function(screenView) {
        screenView.unbind('selected', this.selectedAsset, this);
        screenView.unbind('addItem', this.callAddItem, this);
        screenView.unbind('addNewItem', this.callAddNewItem, this);
        screenView.unbind('delete', this.deleteScreen, this);
        return screenView.close();
      });
      if (this.reuseItemView != null) {
        this.reuseItemView.close();
      }
      if (this.frontMatterView != null) {
        this.frontMatterView.unbind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.unbind("editBackground", this.launchEditBackground, this);
        this.frontMatterView.close();
      }
      if (this.itemLightboxView != null) {
        return this.itemLightboxView.close();
      }
    };

    return ProifleBaseView;

  })(Backbone.View);

  /*
  
    SUBCLASSES
  */


  ProfileView = (function(_super) {

    __extends(ProfileView, _super);

    function ProfileView() {
      return ProfileView.__super__.constructor.apply(this, arguments);
    }

    ProfileView.prototype.showFrontMatter = true;

    ProfileView.prototype.initialize = function(params) {
      var tabTemplateName;
      tabTemplateName = "profile_" + params.tab + "_view_template";
      $("#content").html(Mustache.render($("#" + tabTemplateName).html()));
      if (params.tab === "topics") {
        this.setElement($("#my-profile-following"));
      } else {
        this.setElement($("#my-profile"));
      }
      this.context = params.context;
      this.model = params.model;
      this.tab = params.tab;
      this.userPath = params.userPath;
      this.context = "profile";
      params.inline = false;
      params.context = this.context;
      params.clearHistory = true;
      new global.myd.ImageCenter($('.asset'));
      return ProfileView.__super__.initialize.call(this, params);
    };

    ProfileView.prototype.render = function() {
      var current, following_topic_text, frontMatterObj, rendered_view_html, screen, screensList, tabName, term, _i, _len,
        _this = this;
      tabName = {
        "collections": "Collages",
        "items": "Elements",
        "following": "Liked Topics",
        "likes": "Likes",
        "topics": "Topics",
        "my_stats": "My Stats"
      }[this.tab];
      $("#page-title").text("Collagio Profile " + tabName + " - " + (this.collection.frontMatter.get("owner").first_name) + " " + (this.collection.frontMatter.get("owner").last_name));
      document.title = "" + ($('#page-title').text());
      if ($("#profile-header").length) {
        $("#profile-header").remove();
      }
      this.frontMatterView = new global.myd.CollageHeaderView({
        container: this.$el,
        model: this.collection.frontMatter,
        collection: this.collection,
        currentUserModel: this.currentUser,
        type: "profile",
        collection_count_text: {
          topics: "Topic",
          items: "Item",
          collections: "Collection",
          likes: "Like"
        }[this.tab]
      });
      this.$el.append(this.frontMatterView.el);
      this.frontMatterView.bind("refresh", function() {
        return _this.collection.fetch();
      });
      $(".page-header").removeClass("collection");
      this.$el.find('#profile-header').append(this.navigationView.el);
      this.navigationView.delegateEvents();
      frontMatterObj = this.collection.frontMatter.toJSON();
      term = {
        'collections': 'Collage',
        'items': 'Element',
        'topics': 'Following Topic',
        'likes': 'Like'
      }[this.tab];
      myd.pluralizeIfNeeded(frontMatterObj, "screens_count", term);
      this.$el.find("h3.collage-count").text("" + frontMatterObj.screens_count + " " + frontMatterObj.screens_count_text);
      if (this.tab === "topics") {
        following_topic_text = frontMatterObj.screens_count !== 1 ? "Topics" : "Topic";
        this.$el.find("h3.collage-count").text("Following " + frontMatterObj.screens_count + " " + following_topic_text);
      }
      if (this.collection.length > 0) {
        rendered_view_html = this.collection.map(function(tile, index) {
          var view;
          view = _this.tileViewCreator(tile);
          view.model.set("showActions");
          view.render(_this.streamView);
          return view.el;
        });
      }
      if (this.collection.length <= 0) {
        this.template = $("#my_profile_empty_" + this.tab).html();
        rendered_view_html = Mustache.render(this.template, this.collection.frontMatter.toJSON());
      }
      this.$el.find('.collage-list').append(rendered_view_html);
      this.$el.addClass(this.tab);
      this.$el.find('.collage-list li').addClass("screen");
      if (this.tab === 'topics') {
        this.$el.find('.screen').addClass("no-hover");
      }
      /*
          TODO: This code seems to need more work.  It breaks a lot of stuff in the profile tabs
          if @tab == 'collections'
            $('.collage-list .screen').addClass('subFeatured collections')
          if @tab == 'topics'
            $('.collage-list .screen').addClass('subFeatured likes')
      
          if @tab == 'items'
            $('.collage-list .screen').addClass('subFeatured element')
          if @tab == 'likes'
            $('.collage-list .screen').addClass('subFeatured likes')
      */

      screensList = $('.collage-list .screen');
      for (_i = 0, _len = screensList.length; _i < _len; _i++) {
        screen = screensList[_i];
        current = $(screen).find('.asset .frame .image');
        current.attr('src', current.data('src-745'));
      }
      new mediaQuery({
        media: 'screen and (max-width: 639px)',
        entry: function() {
          var _j, _len1, _ref1, _ref2, _ref3, _results;
          $('.collage-list .screen').removeClass('subFeatured');
          $('.collage-list .screen').addClass('item no-hover');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_j = 0, _len1 = screensList.length; _j < _len1; _j++) {
            screen = screensList[_j];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              _results.push(current.attr('src', current.data('src-300')));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 640px) and (max-width: 867px)',
        entry: function() {
          var _j, _len1, _ref1, _ref2, _ref3, _results;
          $('.collage-list .screen').removeClass('subFeatured');
          $('.collage-list .screen').addClass('item no-hover');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_j = 0, _len1 = screensList.length; _j < _len1; _j++) {
            screen = screensList[_j];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              _results.push(current.attr('src', current.data('src-300')));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 868px)',
        entry: function() {
          var _j, _len1, _ref1, _ref2, _ref3, _results;
          $('.collage-list .screen').addClass('subFeatured');
          $('.collage-list .screen').removeClass('item');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_j = 0, _len1 = screensList.length; _j < _len1; _j++) {
            screen = screensList[_j];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              _results.push(current.attr('src', current.data('src-300')));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        },
        exit: function() {}
      });
      this.$el.show();
      this.trigger("rendered", this);
      new global.myd.ImageCenter($('.asset'));
      return this.refreshFollowingUser();
    };

    ProfileView.prototype.display = function(params) {
      params.userPath = "/" + params.userPath;
      this.tab = params.tab;
      this.navigationView = new myd.ProfileNavigationView(params);
      return this.navigationView.bind("fetchProfileTabCollection", this.fetchCollection, this);
    };

    ProfileView.prototype.fetchCollection = function(params) {
      if (params.user) {
        this.currentUser = params.user;
      }
      if (this.tab === "my_stats") {
        return this.initMyStatsView();
      } else if (this.tab === "topics") {
        this.initFollowingView();
        return this.collection.fetchByUrl(params.url);
      } else {
        return this.collection.fetchByUrl(params.url);
      }
    };

    ProfileView.prototype.selectedAsset = function(screen) {
      myd.common.selectedScreen(screen);
      return false;
    };

    ProfileView.prototype.initMyStatsView = function(user) {
      var params;
      params = {};
      params.container = this.$el.find(".profile-content");
      params.user = this.currentUser;
      params.navigationView = this.navigationView;
      params.tab = this.tab;
      this.collageFilterView = new myd.ProfileMyStatsCollageFilterView(params);
      this.elementFilterView = new myd.ProfileMyStatsElementFilterView(params);
      return this.refreshFollowingUser();
    };

    ProfileView.prototype.initFollowingView = function(user) {
      var params;
      params = {};
      params.container = this.$el.find(".profile-content");
      params.user = this.currentUser;
      params.navigationView = this.navigationView;
      params.tab = this.tab;
      params.followed = true;
      this.collageFollowingView = new myd.ProfileFollowingView(params);
      return this.refreshFollowingUser();
    };

    ProfileView.prototype.refreshFollowingUser = function() {
      var current_user_path, following_el, userid, _ref1;
      following_el = $(".follow-user");
      current_user_path = myd.urls.current_user;
      userid = current_user_path.substring(current_user_path.lastIndexOf("/") + 1, current_user_path.length);
      if (window.location.pathname.indexOf(userid) > 0) {
        return following_el.hide();
      } else {
        if (((_ref1 = this.collection.collection) != null ? _ref1.owner.collected : void 0) === true || this.currentUser.get("collected")) {
          following_el.find(".text").html("FOLLOWING USER");
          return following_el.addClass("followed-user-btn").removeClass("following-user-btn");
        } else {
          following_el.find(".text").html("FOLLOW USER");
          return following_el.removeClass("followed-user-btn").addClass("following-user-btn");
        }
      }
    };

    return ProfileView;

  })(ProifleBaseView);

  global.myd.ProifleBaseView = ProifleBaseView;

  global.myd.ProfileView = ProfileView;

}).call(this);
