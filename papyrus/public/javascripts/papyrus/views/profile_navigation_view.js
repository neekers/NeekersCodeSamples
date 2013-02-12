(function() {
  var ProfileNavigationView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ProfileNavigationView = (function(_super) {

    __extends(ProfileNavigationView, _super);

    function ProfileNavigationView() {
      return ProfileNavigationView.__super__.constructor.apply(this, arguments);
    }

    ProfileNavigationView.prototype.tagName = "div";

    ProfileNavigationView.prototype.id = "profile-navigation";

    ProfileNavigationView.prototype.events = {
      'click .collections': 'collectionsTabSelected',
      'click .topics': 'topicsTabSelected',
      'click .likes': 'likesTabSelected',
      'click .items': 'itemsTabSelected',
      'click .my_stats': 'myStatsTabSelected'
    };

    ProfileNavigationView.prototype.bindToModel = {
      'change:activeTab': 'setActiveTabClass'
    };

    ProfileNavigationView.prototype.initialize = function(params) {
      this.userPath = params.userPath;
      this.tab = params.tab;
      this.template = $("#my_profile_navigation").html();
      this.model = new Backbone.Model;
      this.render();
      return this.loadTabForUserPath();
    };

    ProfileNavigationView.prototype.render = function() {
      var renderedContent;
      this.$el.empty();
      renderedContent = Mustache.render(this.template, null);
      this.$el.append(renderedContent);
      this.setActiveTabClass();
      return this;
    };

    ProfileNavigationView.prototype.setActiveTabClass = function() {
      this.$el.find('a').removeClass('active');
      return this.$el.find('a.' + this.model.get("activeTab")).addClass("active");
    };

    ProfileNavigationView.prototype.loadTabForUserPath = function() {
      return this.getUserModelForUserWithPathAndThen();
    };

    ProfileNavigationView.prototype.profileRoute = function() {
      return this.loadTabForUserPath();
    };

    ProfileNavigationView.prototype.collectionsTabSelected = function() {
      Router.navigateToProfileTab({
        userPath: this.userPath,
        tab: 'collections'
      });
      return false;
    };

    ProfileNavigationView.prototype.topicsTabSelected = function() {
      Router.navigateToProfileTab({
        userPath: this.userPath,
        tab: 'topics'
      });
      return false;
    };

    ProfileNavigationView.prototype.likesTabSelected = function() {
      Router.navigateToProfileTab({
        userPath: this.userPath,
        tab: 'likes'
      });
      return false;
    };

    ProfileNavigationView.prototype.itemsTabSelected = function() {
      Router.navigateToProfileTab({
        userPath: this.userPath,
        tab: 'items'
      });
      return false;
    };

    ProfileNavigationView.prototype.myStatsTabSelected = function() {
      Router.navigateToProfileTab({
        userPath: this.userPath,
        tab: "my_stats"
      });
      return false;
    };

    ProfileNavigationView.prototype.updateTilesCollectionForTab = function() {
      var fetchUrl;
      this.model.set('activeTab', this.tab);
      fetchUrl = this.userModel.get({
        likes: 'bookmarks_url',
        topics: 'topics_url',
        items: 'items_url',
        collections: 'collections_url',
        my_stats: ''
      }[this.tab]);
      return this.trigger("fetchProfileTabCollection", {
        url: fetchUrl,
        user: this.userModel
      });
    };

    ProfileNavigationView.prototype.getUserModelForUserWithPathAndThen = function() {
      var _this = this;
      return myd.serviceModule.get({
        url: this.userPath,
        success: function(response) {
          _this.userModel = new myd.UserModel(response);
          return _this.updateTilesCollectionForTab();
        }
      });
    };

    return ProfileNavigationView;

  })(Backbone.View);

  global.myd.ProfileNavigationView = ProfileNavigationView;

}).call(this);
