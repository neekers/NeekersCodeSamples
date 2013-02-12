(function() {
  var ExploreBaseView, ExploreByReuses, ExploreByViews, ExploreFollowing, ExploreModifiedDateView, ExploreMostCommentedView, ExploreMostLikesView, ExploreNewestView, ExploreTopicView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ExploreBaseView = (function(_super) {

    __extends(ExploreBaseView, _super);

    function ExploreBaseView() {
      return ExploreBaseView.__super__.constructor.apply(this, arguments);
    }

    ExploreBaseView.prototype.collection = myd.GridCollection;

    ExploreBaseView.prototype.bindToCollection = {
      'errorReset': "renderError",
      'reset': "reset"
    };

    ExploreBaseView.prototype.initialize = function(params) {
      this.context = params.context;
      this.clearHistory = params.clearHistory || false;
      this.filter = params.filter;
      this.appView = params.appView;
      this.topicUID = params.uid;
      this.editCollectionButton = $('#edit-collection');
      this.activeScreenIndex = 0;
      this.screenViews = [];
      this.tileViewCreator = params.tileViewCreator || function(tileModel) {
        var assetView, entity_url;
        entity_url = tileModel.get("entity_url");
        assetView = new myd.ScreenView({
          model: tileModel,
          context: params.context,
          inline: false,
          tab: params.tab
        });
        assetView.bind('selected', this.selectedAsset, this);
        this.screenViews.push(assetView);
        return assetView;
      };
      this.collection = params.collection;
      return this.collection.filter = this.filter;
    };

    ExploreBaseView.prototype.reset = function(event) {
      this.$el.find("ol").empty();
      return this.render();
    };

    ExploreBaseView.prototype.render = function() {
      if ((this.context === "modified" || this.context === "topic") && this.filter === "modified") {
        this.turntableExploreView = new myd.TurntableExploreView({
          container: this.$el,
          topic: this.collection.frontMatter.get("title")
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
      return this.$el.show();
    };

    ExploreBaseView.prototype.renderCollectionTiles = function() {
      var rendered_view_html,
        _this = this;
      rendered_view_html = this.collection.map(function(tile) {
        var view;
        view = _this.tileViewCreator(tile);
        view.render(_this.streamView);
        return view.el;
      });
      return this.$el.find('ol').html(rendered_view_html);
    };

    ExploreBaseView.prototype.display = function() {
      this.$el.show();
      return this.collection.fetch();
    };

    ExploreBaseView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    ExploreBaseView.prototype.renderError = function() {
      return this.$el.html("There was an error processing your request.");
    };

    ExploreBaseView.prototype.clickedReuse = function() {
      this.reuseItemView = new myd.ReuseItemView({
        model: this.collection
      });
      return false;
    };

    ExploreBaseView.prototype.onClose = function() {
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
      if (this.turntableExploreView != null) {
        return this.turntableExploreView.close();
      }
    };

    ExploreBaseView.prototype.checkScreenSize = function() {
      new mediaQuery({
        media: 'screen and (max-width: 639px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _ref1, _ref2, _ref3;
          $('.collage-list .screen').removeClass('featured subFeatured item');
          $('.collage-list .screen').addClass('subFeatured no-hover');
          screensList = $('.collage-list .screen');
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
          }
          return new global.myd.ImageCenter($('.asset'));
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 640px) and (max-width: 867px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _ref1, _ref2, _ref3;
          $('.collage-list .screen').removeClass('featured subFeatured item no-hover');
          $('.collage-list .screen:nth-child(n+1):nth-child(-n+2)').addClass('featured');
          $('.collage-list .screen:nth-child(n+3)').addClass('item');
          screensList = $('.collage-list .screen');
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
          }
          return new global.myd.ImageCenter($('.asset'));
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 868px) and (max-width: 949px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _ref1, _ref2, _ref3;
          $('.collage-list .screen').removeClass('featured subFeatured item');
          $('.collage-list .featured').removeClass('featured').addClass('subFeatured');
          $('.collage-list .screen:nth-child(n+1):nth-child(-n+2)').addClass('subFeatured');
          $('.collage-list .screen:nth-child(n+3)').addClass('item');
          screensList = $('.collage-list .screen');
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
          }
          return new global.myd.ImageCenter($('.asset'));
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 950px) and (max-width: 1099px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _ref1, _ref2, _ref3;
          $('.collage-list .screen').removeClass('featured subFeatured item');
          $('.collage-list .screen:nth-child(n+1):nth-child(-n+2)').addClass('featured');
          $('.collage-list .screen:nth-child(n+3)').addClass('item');
          screensList = $('.collage-list .screen');
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
          }
          return new global.myd.ImageCenter($('.asset'));
        },
        exit: function() {}
      });
      return new mediaQuery({
        media: 'screen and (min-width: 1100px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _ref1, _ref2, _ref3;
          $('.collage-list .screen').removeClass('featured subFeatured item');
          $('.collage-list .screen:nth-child(1)').addClass('featured');
          $('.collage-list .screen:nth-child(2)').addClass('featured');
          $('.collage-list .screen:nth-child(n+3):nth-child(-n+11)').addClass('subFeatured');
          $('.collage-list .screen:nth-child(n+12)').addClass('item');
          screensList = $('.collage-list .screen');
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            if ($(screen).hasClass('featured') && ((_ref1 = current.data('src-745')) != null ? _ref1.length : void 0)) {
              current.attr('src', current.data('src-745'));
            }
            if ($(screen).hasClass('subFeatured') && ((_ref2 = current.data('src-300')) != null ? _ref2.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
            if ($(screen).hasClass('item') && ((_ref3 = current.data('src-300')) != null ? _ref3.length : void 0)) {
              current.attr('src', current.data('src-300'));
            }
          }
          return new global.myd.ImageCenter($('.asset'));
        },
        exit: function() {}
      });
    };

    return ExploreBaseView;

  })(Backbone.View);

  /*
  
    SUBCLASSES
  */


  ExploreMostLikesView = (function(_super) {

    __extends(ExploreMostLikesView, _super);

    function ExploreMostLikesView() {
      return ExploreMostLikesView.__super__.constructor.apply(this, arguments);
    }

    ExploreMostLikesView.prototype.el = "#explore-most-likes";

    ExploreMostLikesView.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-most-likes" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "likes";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreMostLikesView.__super__.initialize.call(this, params);
    };

    ExploreMostLikesView.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Explore Most Likes - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreMostLikesView.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        desc = $('.description', screen);
        if ((desc.html() != null) && desc.html().trim().length > 0) {
          return $(screen).addClass('show-description');
        }
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreMostLikesView;

  })(ExploreBaseView);

  ExploreNewestView = (function(_super) {

    __extends(ExploreNewestView, _super);

    function ExploreNewestView() {
      return ExploreNewestView.__super__.constructor.apply(this, arguments);
    }

    ExploreNewestView.prototype.el = "#explore-newest";

    ExploreNewestView.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-newest" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "newest";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreNewestView.__super__.initialize.call(this, params);
    };

    ExploreNewestView.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Explore Newest - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreNewestView.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      omnicollagio.prop7 = this.collection.frontMatter.get("title");
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreNewestView;

  })(ExploreBaseView);

  ExploreModifiedDateView = (function(_super) {

    __extends(ExploreModifiedDateView, _super);

    function ExploreModifiedDateView() {
      return ExploreModifiedDateView.__super__.constructor.apply(this, arguments);
    }

    ExploreModifiedDateView.prototype.el = "#explore-modified-date";

    ExploreModifiedDateView.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-modified-date" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "modified";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreModifiedDateView.__super__.initialize.call(this, params);
    };

    ExploreModifiedDateView.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Collages by Modified Date - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreModifiedDateView.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreModifiedDateView;

  })(ExploreBaseView);

  ExploreMostCommentedView = (function(_super) {

    __extends(ExploreMostCommentedView, _super);

    function ExploreMostCommentedView() {
      return ExploreMostCommentedView.__super__.constructor.apply(this, arguments);
    }

    ExploreMostCommentedView.prototype.el = "#explore-most-commented";

    ExploreMostCommentedView.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-most-commented" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "commented";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreMostCommentedView.__super__.initialize.call(this, params);
    };

    ExploreMostCommentedView.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Collages by Most Comments - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreMostCommentedView.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreMostCommentedView;

  })(ExploreBaseView);

  ExploreByViews = (function(_super) {

    __extends(ExploreByViews, _super);

    function ExploreByViews() {
      return ExploreByViews.__super__.constructor.apply(this, arguments);
    }

    ExploreByViews.prototype.el = "#explore-by-views";

    ExploreByViews.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-by-views" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "views";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreByViews.__super__.initialize.call(this, params);
    };

    ExploreByViews.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Collages by Most Views - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreByViews.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreByViews;

  })(ExploreBaseView);

  ExploreByReuses = (function(_super) {

    __extends(ExploreByReuses, _super);

    function ExploreByReuses() {
      return ExploreByReuses.__super__.constructor.apply(this, arguments);
    }

    ExploreByReuses.prototype.el = "#explore-by-reuses";

    ExploreByReuses.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-by-reuses" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "reuses";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreByReuses.__super__.initialize.call(this, params);
    };

    ExploreByReuses.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Collages by Most Reuses - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreByReuses.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreByReuses;

  })(ExploreBaseView);

  ExploreFollowing = (function(_super) {

    __extends(ExploreFollowing, _super);

    function ExploreFollowing() {
      return ExploreFollowing.__super__.constructor.apply(this, arguments);
    }

    ExploreFollowing.prototype.el = "#explore-following";

    ExploreFollowing.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="explore-following" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "following";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreFollowing.__super__.initialize.call(this, params);
    };

    ExploreFollowing.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("Collages by Following - Collagio");
      document.title = "" + ($('#page-title').text());
      ExploreFollowing.__super__.render.call(this);
      this.$el.children('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {
        var desc;
        return desc = $('.description', screen);
      });
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreFollowing;

  })(ExploreBaseView);

  ExploreTopicView = (function(_super) {

    __extends(ExploreTopicView, _super);

    function ExploreTopicView() {
      return ExploreTopicView.__super__.constructor.apply(this, arguments);
    }

    ExploreTopicView.prototype.showFrontMatter = false;

    ExploreTopicView.prototype.initialize = function(params) {
      var _el;
      _el = $('<div id="topic" class="body"><ol class="collage-list cf"></ol></div>');
      $('#content').append(_el);
      this.setElement(_el);
      params.context = "topic";
      params.clearHistory = true;
      params.container = this.$el;
      return ExploreTopicView.__super__.initialize.call(this, params);
    };

    ExploreTopicView.prototype.render = function() {
      var $screens, params,
        _this = this;
      $("#page-title").text("" + (this.collection.frontMatter.get("title")) + " " + (myd.capFirstLetter(this.filter)) + " - Collagio");
      document.title = "" + ($('#page-title').text());
      omnicollagio.prop7 = this.collection.frontMatter.get("topic_title");
      omnicollagio.pageName = "topic > home: " + this.collection.frontMatter.get("title");
      omnicollagio.eVar15 = "D=pageName";
      ExploreTopicView.__super__.render.call(this);
      this.$el.find('.collage-list').children('li').addClass('screen');
      $screens = this.$el.find('.screen');
      _.map($screens, function(screen, index) {});
      params = {};
      params.uid = this.topicUID;
      params.context = this.context;
      params.container = this.$el;
      params.model = this.collection.frontMatter;
      params.collection = this.collection;
      params.appView = this.appView;
      params.filter = this.filter;
      this.exploreNavigationView = new global.myd.ExploreNavigationView(params);
      this.topicHeaderView = new myd.TopicHeaderView({
        container: this.$el,
        model: this.collection.frontMatter,
        collection: this.collection
      });
      this.checkScreenSize();
      return this.$el.show();
    };

    return ExploreTopicView;

  })(ExploreBaseView);

  global.myd.ExploreBaseView = ExploreBaseView;

  global.myd.ExploreTopicView = ExploreTopicView;

  global.myd.ExploreMostLikesView = ExploreMostLikesView;

  global.myd.ExploreNewestView = ExploreNewestView;

  global.myd.ExploreModifiedDateView = ExploreModifiedDateView;

  global.myd.ExploreMostCommentedView = ExploreMostCommentedView;

  global.myd.ExploreByViews = ExploreByViews;

  global.myd.ExploreByReuses = ExploreByReuses;

  global.myd.ExploreFollowing = ExploreFollowing;

}).call(this);
