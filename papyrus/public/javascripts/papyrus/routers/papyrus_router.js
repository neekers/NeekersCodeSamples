(function() {
  var PapyrusRouter, routesModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  routesModule = myd.routesModule;

  PapyrusRouter = (function(_super) {

    __extends(PapyrusRouter, _super);

    function PapyrusRouter() {
      return PapyrusRouter.__super__.constructor.apply(this, arguments);
    }

    PapyrusRouter.prototype.routes = {
      "": "modified",
      "papyrus": "modified",
      "newest": "newest",
      "likes": "likes",
      "modified": "modified",
      "commented": "commented",
      "views": "views",
      "reuses": "reuses",
      "search": "search",
      "search/:query": "search",
      "topic/:uid": "topicNewest",
      "topic/:uid/newest": "topicNewest",
      "topic/:uid/likes": "topicLikes",
      "topic/:uid/modified": "topicModified",
      "topic/:uid/commented": "topicCommented",
      "topic/:uid/views": "topicViews",
      "topic/:uid/reuses": "topicReuses",
      "following": "followingNewest",
      "following/newest": "followingNewest",
      "following/likes": "followingLikes",
      "following/modified": "followingModified",
      "following/commented": "followingCommented",
      "following/views": "followingViews",
      "following/reuses": "followingReuses",
      "bookmarklet": "bookmarklet",
      "?:query_params": "modified",
      "papyrus?:query_params": "modified"
    };

    PapyrusRouter.prototype.initialize = function(params) {
      this.appView = params.app_view;
      this.currentUsersUserPath = new global.myd.Uri(global.myd.urls.current_user).getPathname();
      this.route(/^c\/(.*)$/, 'collectionRoute', this.showCollection);
      this.route(/^c\/(.*)\/screens\/([^\/\?]+)/, 'collection', this.showCollection);
      this.route(/^p\/(.*)\/([^\/\?]+)/, 'profileTab', this.profileTab);
      return this.bind('all', this.trackPageview);
    };

    PapyrusRouter.prototype.trackPageview = function() {
      var url;
      url = Backbone.history.getFragment();
      if (typeof _gaq !== "undefined" && _gaq !== null) {
        return _gaq.push(['_trackPageview', "/" + url]);
      }
    };

    PapyrusRouter.prototype.topicNewest = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "newest"
      });
    };

    PapyrusRouter.prototype.topicLikes = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "likes"
      });
    };

    PapyrusRouter.prototype.topicModified = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "modified"
      });
    };

    PapyrusRouter.prototype.topicCommented = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "commented"
      });
    };

    PapyrusRouter.prototype.topicViews = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "views"
      });
    };

    PapyrusRouter.prototype.topicReuses = function(uid) {
      return this.appView.showTopic({
        uid: uid,
        filter: "reuses"
      });
    };

    PapyrusRouter.prototype.followingNewest = function() {
      return this.appView.showFollowing({
        filter: "newest"
      });
    };

    PapyrusRouter.prototype.followingLikes = function() {
      return this.appView.showFollowing({
        filter: "likes"
      });
    };

    PapyrusRouter.prototype.followingModified = function() {
      return this.appView.showFollowing({
        filter: "modified"
      });
    };

    PapyrusRouter.prototype.followingCommented = function() {
      return this.appView.showFollowing({
        filter: "commented"
      });
    };

    PapyrusRouter.prototype.followingViews = function() {
      return this.appView.showFollowing({
        filter: "views"
      });
    };

    PapyrusRouter.prototype.followingReuses = function() {
      return this.appView.showFollowing({
        filter: "reuses"
      });
    };

    PapyrusRouter.prototype.newest = function() {
      return this.appView.showNewest();
    };

    PapyrusRouter.prototype.likes = function() {
      return this.appView.showByMostLikes();
    };

    PapyrusRouter.prototype.modified = function() {
      return this.appView.showByModifiedDate();
    };

    PapyrusRouter.prototype.commented = function() {
      return this.appView.showByMostCommented();
    };

    PapyrusRouter.prototype.views = function() {
      return this.appView.showByViews();
    };

    PapyrusRouter.prototype.reuses = function() {
      return this.appView.showByReuses();
    };

    PapyrusRouter.prototype.bookmarklet = function() {
      return this.appView.showBookmarklet();
    };

    PapyrusRouter.prototype.showCollection = function(collectionPath, assetUID, editable) {
      var routes;
      if (editable == null) {
        editable = false;
      }
      routes = routesModule.getRoutesFromRelativePath(collectionPath);
      return this.appView.showCollection(routes, assetUID);
    };

    PapyrusRouter.prototype.search = function(query) {
      return this.appView.showSearch(query);
    };

    PapyrusRouter.prototype.profileTab = function(userPath, tabName) {
      return this.appView.showProfile({
        tab: tabName,
        userPath: userPath
      });
    };

    PapyrusRouter.prototype.navigateToProfileTabForCurrentUser = function(tab, options) {
      if (options == null) {
        options = {};
      }
      return this.navigateToProfileTab({
        tab: tab,
        userPath: this.currentUsersUserPath
      });
    };

    PapyrusRouter.prototype.navigateToProfileTab = function(params) {
      return this.navigate("p" + params.userPath + "/" + params.tab, {
        trigger: true
      });
    };

    PapyrusRouter.prototype.navigateToEditCollection = function(path, params) {
      this.navigate(path, params);
      return this.appView.currentView.startInEditMode = true;
    };

    return PapyrusRouter;

  })(Backbone.Router);

  global.myd.PapyrusRouter = PapyrusRouter;

}).call(this);
