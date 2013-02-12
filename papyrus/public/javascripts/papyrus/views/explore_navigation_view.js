(function() {
  var ExploreNavigationView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ExploreNavigationView = (function(_super) {

    __extends(ExploreNavigationView, _super);

    function ExploreNavigationView() {
      return ExploreNavigationView.__super__.constructor.apply(this, arguments);
    }

    ExploreNavigationView.prototype["class"] = 'explore-navigation-header';

    ExploreNavigationView.prototype.searchViews = [];

    ExploreNavigationView.prototype.events = function() {
      return {
        'click .explore-following': 'clickedFollowing',
        'click .explore-newest': 'clickedViewNewest',
        'click .explore-likes': 'clickedViewMostLiked',
        'click .explore-modified': 'clickedViewModified',
        'click .explore-commented': 'clickedViewCommented',
        'click .explore-views': 'clickedViewViews',
        'click .explore-reused': 'clickedViewReused',
        'click .topics-options .title': 'clickedTopic',
        'click .explore-search a': 'toggleSearch',
        'focus .search-form input': 'focusSearch'
      };
    };

    ExploreNavigationView.prototype.initialize = function(params) {
      var _this = this;
      this.appView = params.appView;
      this.containerEl = params.container;
      this.filter = params.filter;
      this.context = params.context;
      this.uid = params.uid;
      this.model = params.model;
      this.searchTerm = params.searchTerm;
      this.navigationFilters = {
        "likes": "MOST LIKED",
        "newest": "NEWEST",
        "modified": "MODIFIED DATE",
        "commented": "MOST COMMENTED",
        "views": "MOST VIEWS",
        "reuses": "MOST REUSED"
      };
      this.templateObj = {
        topics: []
      };
      this.templateObj.searchTerm = params.searchTerm || "";
      _.each(myd.topics, function(topic) {
        var pathName, uid;
        pathName = new myd.Uri(topic.entity_url).getPathname();
        uid = pathName.split("/")[3];
        topic.url = "/papyrus/topic/" + uid;
        topic.title = topic.title.toUpperCase();
        return _this.templateObj.topics.push(topic);
      });
      this.templateObj.topics.unshift({
        title: "All Topics",
        entity_url: "/papyrus/" + this.filter
      });
      return this.render();
    };

    ExploreNavigationView.prototype.render = function() {
      var _this = this;
      this.containerEl.prepend(Mustache.render($("#explore_navigation_template").html(), this.templateObj));
      this.setElement($(".explore-navigation-header", this.containerEl));
      this.topicsButton = this.$el.find(".explore-topics");
      this.topicsMenu = this.$el.find(".topics-options");
      this.followingButton = this.$el.find(".explore-following");
      this.filtersButton = this.$el.find(".explore-filters");
      this.filtersMenu = this.$el.find(".filter-options");
      this.newestFilterButton = this.$el.find(".explore-newest");
      this.mostLikedFilterButton = this.$el.find(".explore-likes");
      this.modifiedFilterButton = this.$el.find(".explore-modified");
      this.mostCommentedFilterButton = this.$el.find(".explore-commented");
      this.mostViewsFilterButton = this.$el.find(".explore-views");
      this.mostReusedFilterButton = this.$el.find(".explore-reused");
      this.searchInput = this.$el.find(".search-form input");
      if (this.context === "search") {
        this.topicsButton.hide();
        this.newestFilterButton.hide();
        this.mostLikedFilterButton.hide();
        this.topicsMenu.hide();
        this.toggleSearch();
      }
      this.topicsButton.hover(function() {
        return _this.topicsMenu.toggle();
      }, function() {
        return _this.topicsMenu.toggle();
      });
      this.topicsMenu.hover(function() {
        _this.topicsMenu.show();
        if (_this.context === "following") {
          return _this.topicsButton.addClass('over');
        }
      }, function() {
        _this.topicsMenu.hide();
        if (_this.context === "following") {
          return _this.topicsButton.removeClass('over');
        }
      });
      this.filtersButton.hover(function() {
        return _this.filtersMenu.toggle();
      }, function() {
        return _this.filtersMenu.toggle();
      });
      this.filtersMenu.hover(function() {
        _this.filtersMenu.show();
        return _this.filtersButton.addClass('over');
      }, function() {
        _this.filtersMenu.hide();
        return _this.filtersButton.removeClass('over');
      });
      return this.initFilters();
    };

    ExploreNavigationView.prototype.initFilters = function() {
      this.setSelectedTopic();
      this.setActiveTopic();
      this.setSelectedFilter();
      this.setActiveFilter();
      this.checkIsFollowingActive();
      return this.checkIsAllTopicsActive();
    };

    ExploreNavigationView.prototype.checkIsAllTopicsActive = function() {
      if (this.context !== "following") {
        return this.topicsButton.addClass("selected");
      }
    };

    ExploreNavigationView.prototype.setSelectedTopic = function() {
      if (this.uid) {
        return this.$el.find(".explore-topics a").text(this.model.get('title').toUpperCase());
      }
    };

    ExploreNavigationView.prototype.checkIsFollowingActive = function() {
      if (this.context === "following") {
        return this.followingButton.addClass("selected");
      }
    };

    ExploreNavigationView.prototype.setActiveTopic = function() {
      var _this = this;
      this.$el.find('.topics-options .title').removeClass('topic-selected');
      if (this.model != null) {
        if (!(this.model.get("title") != null)) {
          this.model.set("title", "All Topics");
        }
        if (this.model.get("title")) {
          return this.$el.find('.topics-options .title').each(function(i, el) {
            if ($(el).text().toLowerCase() === _this.model.get("title").toLowerCase()) {
              return $(el).addClass("topic-selected");
            }
          });
        }
      }
    };

    ExploreNavigationView.prototype.setSelectedFilter = function() {
      return this.$el.find(".explore-filters a").text(this.navigationFilters[this.filter]);
    };

    ExploreNavigationView.prototype.setActiveFilter = function() {
      this.resetFilters();
      switch (this.filter) {
        case "likes":
          return this.mostLikedFilterButton.find('.title').addClass("filter-selected");
        case "newest":
          return this.newestFilterButton.find('.title').addClass("filter-selected");
        case "modified":
          return this.modifiedFilterButton.find('.title').addClass("filter-selected");
        case "commented":
          return this.mostCommentedFilterButton.find('.title').addClass("filter-selected");
        case "views":
          return this.mostViewsFilterButton.find('.title').addClass("filter-selected");
        case "reuses":
          return this.mostReusedFilterButton.find('.title').addClass("filter-selected");
      }
    };

    ExploreNavigationView.prototype.resetFilters = function() {
      return this.$el.find(".filter-options .title").removeClass("filter-selected");
    };

    ExploreNavigationView.prototype.clickedFollowing = function() {
      var newFollowingRoute;
      if (this.context !== "following") {
        newFollowingRoute = "/following/modified";
        return Router.navigate(newFollowingRoute, true);
      } else {
        return Router.navigate("/", {
          trigger: true
        });
      }
    };

    ExploreNavigationView.prototype.clickedViewNewest = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/newest";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/newest";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("newest", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedViewMostLiked = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/likes";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/likes";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("likes", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedViewModified = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/modified";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/modified";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("modified", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedViewCommented = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/commented";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/commented";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("commented", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedViewViews = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/views";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/views";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("views", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedViewReused = function() {
      var newFollowingRoute, newTopicRoute;
      if (this.context === "topic") {
        newTopicRoute = "/topic/" + this.uid + "/reuses";
        Router.navigate(newTopicRoute, true);
      } else if (this.context === "following") {
        newFollowingRoute = "/following/reuses";
        Router.navigate(newFollowingRoute, true);
      } else {
        Router.navigate("reuses", {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.clickedTopic = function(event) {
      var href;
      href = $(event.target).attr("href");
      if (this.filter === null || this.filter === void 0) {
        this.filter = "likes";
      }
      if (href !== "#") {
        Router.navigate(href.replace("/papyrus", "") + ("/" + this.filter), {
          trigger: true
        });
      }
      return false;
    };

    ExploreNavigationView.prototype.toggleSearch = function() {
      var search;
      search = this.$el.find(".navigation");
      if (search.hasClass("searchOpen")) {
        Router.navigate("/newest", {
          trigger: true
        });
        this.$el.find(".explore-topics, .explore-filters, .explore-following, .explore-sort-label").css('opacity', 1);
      } else {
        this.$el.find(".explore-topics, .explore-filters, .explore-following, .explore-sort-label").css('opacity', 0.4);
      }
      search.toggleClass("searchOpen");
      return false;
    };

    ExploreNavigationView.prototype.focusSearch = function() {
      if (typeof this.searchTerm === "undefined") {
        return Router.navigate("/search", {
          trigger: true
        });
      }
    };

    ExploreNavigationView.prototype.onClose = function() {
      return _.each(this.searchViews, function(view) {
        return view.close();
      });
    };

    return ExploreNavigationView;

  })(Backbone.View);

  global.myd.ExploreNavigationView = ExploreNavigationView;

}).call(this);
