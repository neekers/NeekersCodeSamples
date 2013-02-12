(function() {
  var RecommendedCollagesView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  RecommendedCollagesView = (function(_super) {

    __extends(RecommendedCollagesView, _super);

    function RecommendedCollagesView() {
      return RecommendedCollagesView.__super__.constructor.apply(this, arguments);
    }

    RecommendedCollagesView.prototype.id = "recommended-collages";

    RecommendedCollagesView.prototype.collection = myd.GridCollection;

    RecommendedCollagesView.prototype.bindToCollection = {
      "reset": "render"
    };

    RecommendedCollagesView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection = new myd.GridCollection();
      this.topic = params.topic || 'All Topics';
      this.screenViews = [];
      this.currentCollectionUID = params.currentCollectionUID;
      return this.collection.fetchByUrl("" + myd.urls.spotlight + "?topic=" + this.topic);
    };

    RecommendedCollagesView.prototype.render = function() {
      var noCurrentCollage, screen, shortCollection,
        _this = this;
      this.containerEl.append(Mustache.render($("#recommended_collages_template").html()));
      this.setElement($("#recommended-collages"));
      this.list = this.$el.find(".collage-list");
      noCurrentCollage = (function() {
        var _i, _len, _ref1, _results;
        _ref1 = this.collection.models;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          screen = _ref1[_i];
          if (screen.get("item").id !== this.currentCollectionUID) {
            _results.push(screen);
          }
        }
        return _results;
      }).call(this);
      shortCollection = noCurrentCollage.splice(0, 9);
      _.each(shortCollection, function(screen) {
        screen = new myd.ScreenView({
          model: screen,
          container: _this.list,
          context: "recommendedcollages"
        });
        screen.bind("selected", _this.selectedScreen, _this);
        screen.render();
        return _this.list.append(screen.el);
      });
      this.$el.find("li").addClass("screen");
      this.checkScreenSize();
      return new global.myd.ImageCenter(this.$el.find('.asset'));
    };

    RecommendedCollagesView.prototype.checkScreenSize = function() {
      new mediaQuery({
        media: 'screen and (max-width: 639px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.collage-list .screen').removeClass('featured subFeatured item');
          $('.collage-list .screen').addClass('subFeatured');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            _results.push(current.attr('src', current.data('src-745')));
          }
          return _results;
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 640px) and (max-width: 867px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.collage-list .screen').removeClass('featured subFeatured');
          $('.collage-list .screen').addClass('item');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            _results.push(current.attr('src', current.data('src-745')));
          }
          return _results;
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 868px) and (max-width: 949px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.collage-list .screen').removeClass('featured subFeatured');
          $('.collage-list .screen').addClass('item');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            _results.push(current.attr('src', current.data('src-745')));
          }
          return _results;
        },
        exit: function() {}
      });
      new mediaQuery({
        media: 'screen and (min-width: 950px) and (max-width: 1099px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.collage-list .screen').removeClass('featured subFeatured');
          $('.collage-list .screen').addClass('item');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            _results.push(current.attr('src', current.data('src-745')));
          }
          return _results;
        },
        exit: function() {}
      });
      return new mediaQuery({
        media: 'screen and (min-width: 1100px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.collage-list .screen').removeClass('featured  item');
          $('.collage-list .screen').addClass('subFeatured');
          screensList = $('.collage-list .screen');
          _results = [];
          for (_i = 0, _len = screensList.length; _i < _len; _i++) {
            screen = screensList[_i];
            current = $(screen).find('.asset .frame .image');
            _results.push(current.attr('src', current.data('src-745')));
          }
          return _results;
        },
        exit: function() {}
      });
    };

    RecommendedCollagesView.prototype.selectedScreen = function(args) {
      return myd.common.selectedScreen(args);
    };

    RecommendedCollagesView.prototype.onClose = function() {
      return _.each(this.screenViews, function(screen) {
        screen.unbind("selected", this.selectedScreen, this);
        return screen.close();
      });
    };

    return RecommendedCollagesView;

  })(Backbone.View);

  global.myd.RecommendedCollagesView = RecommendedCollagesView;

}).call(this);
