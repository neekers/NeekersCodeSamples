(function() {
  var AppView, _base, _base1, _base2, _ref, _ref1, _ref2, _ref3,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  if ((_ref1 = (_base = global.myd).urls) == null) {
    _base.urls = {};
  }

  if ((_ref2 = (_base1 = global.myd.urls).current_user) == null) {
    _base1.current_user = {};
  }

  if ((_ref3 = (_base2 = global.myd).topics) == null) {
    _base2.topics = {};
  }

  AppView = (function(_super) {

    __extends(AppView, _super);

    function AppView() {
      return AppView.__super__.constructor.apply(this, arguments);
    }

    AppView.prototype.el = "body";

    AppView.prototype.prevScreenId = null;

    AppView.prototype.currentView = null;

    AppView.prototype.initialize = function(dependencies) {
      var ca, campaignCode, i, _i, _len;
      window.Router = new myd.PapyrusRouter({
        app_view: this
      });
      this.feedbackView = new global.myd.FeedbackView();
      this.headerView = new global.myd.HeaderView(this);
      this.notificationsView = new global.myd.NotificationsListView({
        container: this.headerView.$el.find(".login")
      });
      campaignCode = new global.myd.Uri(window.location).get("utm_campaign");
      if (campaignCode) {
        _gaq.push(['_setCustomVar', 1, 'Member Type', campaignCode.value, 1]);
      }
      ca = document.cookie.split(';');
      for (_i = 0, _len = ca.length; _i < _len; _i++) {
        i = ca[_i];
        if (i.indexOf("publish") > -1) {
          global.myd.feature["publish"] = true;
        }
      }
      this.setFeatureFlags();
      omnicollagio.pageName = 'home';
      return this;
    };

    AppView.prototype.setFeatureFlags = function() {
      var flags;
      flags = _.map(_.keys(global.myd.feature), function(flag) {
        return "ff-" + flag;
      });
      return $('html').addClass(flags.join(' '));
    };

    AppView.prototype.showCollection = function(mydCollection, assetUID) {
      var collageView;
      collageView = new myd.CollageView({
        collection: new myd.GridCollection,
        streamView: true
      });
      return this.showView(collageView, mydCollection, assetUID);
    };

    AppView.prototype.showAssetInFullScreen = function(assetUID) {
      if (this.currentView != null) {
        return this.currentView.showFullScreen(assetUID);
      }
    };

    AppView.prototype.closeCurrentView = function() {
      $(".menu a.selected").removeClass("selected");
      this.currentView.unbind("rendered", this.rendered, this);
      this.currentView.close();
      return this.currentView = null;
    };

    AppView.prototype.showView = function() {
      var params, view, _ref4;
      view = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if ((params != null ? params.tab : void 0) === 'likes' && document.location.hash.indexOf('first') !== -1) {
        $('#first_time_user_callout').remove();
      }
      if (this.currentView != null) {
        this.closeCurrentView();
      }
      if (this.notificationsView != null) {
        this.notificationsView.toggleList({
          close: true
        });
        this.notificationsView.refresh();
      }
      this.currentView = view;
      this.currentView.bind("rendered", this.rendered, this);
      return (_ref4 = this.currentView).display.apply(_ref4, params);
    };

    AppView.prototype.rendered = function(params) {
      var body, smallScreen, template, url;
      smallScreen = false;
      new mediaQuery({
        media: 'screen and (max-width: 639px)',
        entry: function() {
          return smallScreen = true;
        },
        exit: function() {}
      });
      if ((this.wayBackCollection != null) && (params != null)) {
        if (params.clearHistory) {
          this.wayBackCollection.reset();
        }
        url = Backbone.history.getFragment();
        if ((params != null) && (params.thumbnail != null)) {
          this.wayBackCollection.add(new myd.BreadcrumbModel({
            url: url,
            name: document.title,
            thumbnail: params.thumbnail
          }), {
            at: 0
          });
        } else {
          this.wayBackCollection.add(new myd.BreadcrumbModel({
            url: url,
            name: document.title
          }), {
            at: 0
          });
        }
      }
      if ((params != null ? params.tab : void 0) === 'likes' && !smallScreen && document.location.hash.indexOf('first') !== -1) {
        body = $('body');
        body.addClass("cf");
        body.addClass('onboardComplete');
        template = Mustache.render($("#first_time_user_callout").html());
        $(".name-header").append(template);
        this.$el.bind('click', function() {
          return $(this).removeClass('onboardComplete');
        });
      }
      omnicollagio.eVar16 = myd.urls.current_user;
      omnicollagio.eVar23 = "D=v16";
      omnicollagio.t(this, 'o', window.location);
      return omnicollagio.events = '';
    };

    AppView.prototype.showNewest = function() {
      var newestView;
      newestView = new myd.ExploreNewestView({
        collection: _.extend(new myd.NewestGridCollection, {
          url: myd.urls.new_stream
        }),
        filter: "newest",
        streamView: true,
        appView: this
      });
      this.showView(newestView);
      return this.trigger("changedSection", {
        section: 'newest'
      });
    };

    AppView.prototype.showByMostLikes = function() {
      var exploreMostLikesView;
      exploreMostLikesView = new myd.ExploreMostLikesView({
        collection: _.extend(new myd.MostLikesGridCollection, {
          url: myd.urls.popular
        }),
        filter: "likes",
        streamView: true,
        appView: this
      });
      this.showView(exploreMostLikesView);
      return this.trigger("changedSection", {
        section: 'likes'
      });
    };

    AppView.prototype.showByModifiedDate = function() {
      var exploreModifiedDateView;
      exploreModifiedDateView = new myd.ExploreModifiedDateView({
        collection: _.extend(new myd.ModifiedDateGridCollection, {
          url: myd.urls.modification
        }),
        filter: "modified",
        streamView: true,
        appView: this
      });
      this.showView(exploreModifiedDateView);
      return this.trigger("changedSection", {
        section: 'modified'
      });
    };

    AppView.prototype.showByMostCommented = function() {
      var exploreMostCommentedView;
      exploreMostCommentedView = new myd.ExploreMostCommentedView({
        collection: _.extend(new myd.MostCommentedGridCollection, {
          url: myd.urls.comments
        }),
        filter: "commented",
        streamView: true,
        appView: this
      });
      this.showView(exploreMostCommentedView);
      return this.trigger("changedSection", {
        section: 'commented'
      });
    };

    AppView.prototype.showByViews = function() {
      var exploreByViews;
      exploreByViews = new myd.ExploreByViews({
        collection: _.extend(new myd.ViewsGridCollection, {
          url: myd.urls.views
        }),
        filter: "views",
        streamView: true,
        appView: this
      });
      this.showView(exploreByViews);
      return this.trigger("changedSection", {
        section: 'views'
      });
    };

    AppView.prototype.showByReuses = function() {
      var exploreByReuses;
      exploreByReuses = new myd.ExploreByReuses({
        collection: _.extend(new myd.ReusesGridCollection, {
          url: myd.urls.reuses
        }),
        filter: "reuses",
        streamView: true,
        appView: this
      });
      this.showView(exploreByReuses);
      return this.trigger("changedSection", {
        section: 'reuses'
      });
    };

    AppView.prototype.showTopic = function(params) {
      var topicView;
      if (params == null) {
        params = {
          uid: 0,
          filter: "newest"
        };
      }
      topicView = new myd.ExploreTopicView({
        collection: _.extend(new myd.TopicGridCollection, {
          url: "/api/collections/" + params.uid
        }),
        filter: params.filter,
        uid: params.uid,
        streamView: true,
        appView: this
      });
      return this.showView(topicView);
    };

    AppView.prototype.showFollowing = function(params) {
      var exploreFollowing, followingRoutes;
      if (params == null) {
        params = {
          filter: "modified"
        };
      }
      followingRoutes = {
        "newest": myd.urls.following_collections_creation,
        "likes": myd.urls.following_collections_likes,
        "modified": myd.urls.following_collections_modification,
        "commented": myd.urls.following_collections_comments,
        "views": myd.urls.following_collections_views,
        "reuses": myd.urls.following_collections_reuses
      };
      exploreFollowing = new myd.ExploreFollowing({
        collection: _.extend(new myd.FollowingGridCollection, {
          url: followingRoutes[params.filter]
        }),
        filter: params.filter,
        streamView: true,
        appView: this
      });
      this.showView(exploreFollowing);
      return this.trigger("changedSection", {
        section: 'following'
      });
    };

    AppView.prototype.showProfile = function(params) {
      var myProfileView;
      myProfileView = new myd.ProfileView({
        collection: new myd.ProfileGridCollection(params),
        tab: params.tab
      });
      return this.showView(myProfileView, {
        tab: params.tab,
        userPath: params.userPath
      });
    };

    AppView.prototype.showSearch = function(query) {
      var searchGridView;
      searchGridView = new myd.SearchView({
        collection: new myd.GridCollection,
        searchTerm: query
      });
      return this.showView(searchGridView);
    };

    AppView.prototype.showBookmarklet = function() {
      return this.showView(new myd.BookmarkletView);
    };

    return AppView;

  })(Backbone.View);

  global.myd.AppView = AppView;

}).call(this);
