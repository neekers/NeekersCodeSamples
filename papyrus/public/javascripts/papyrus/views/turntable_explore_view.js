(function() {
  var TurntableExploreView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  TurntableExploreView = (function(_super) {

    __extends(TurntableExploreView, _super);

    function TurntableExploreView() {
      return TurntableExploreView.__super__.constructor.apply(this, arguments);
    }

    TurntableExploreView.prototype.itemWidth = 850;

    TurntableExploreView.prototype.singleWidth = 100;

    TurntableExploreView.prototype.collection = myd.GridCollection;

    TurntableExploreView.prototype.events = {
      "click #records li": "clickedSingle",
      "click #turntable li .advance": "clickedAdvance",
      "click #records-wrapper .turntable-arrow-left": 'clickPrevFilmstrip',
      "click #records-wrapper .turntable-arrow-right": 'clickNextFilmstrip'
    };

    TurntableExploreView.prototype.bindToCollection = {
      "reset": "render"
    };

    TurntableExploreView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection = new myd.GridCollection();
      this.topic = params.topic || 'All Topics';
      this.collection.fetchByUrl("" + myd.urls.spotlight + "?topic=" + this.topic);
      this.turntableViews = [];
      return this.filmstripPage = 0;
    };

    TurntableExploreView.prototype.render = function() {
      var item, items, itemsObj, rendered_view_html,
        _this = this;
      $("#explore-turntable").remove();
      items = this.collection.pluck("item");
      itemsObj = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push(item.toJSON());
        }
        return _results;
      })();
      rendered_view_html = Mustache.render($("#turntable_explore_template").html(), {
        items: itemsObj
      });
      if (this.topic !== "All Topics") {
        $("#content header#topic-header").after(rendered_view_html);
      } else {
        $("#content header:first-child").after(rendered_view_html);
      }
      this.setElement($("#explore-turntable"));
      this.turntable = this.$el.find("ol#turntable");
      this.records = this.$el.find("ol#records");
      this.recordsContainer = this.$el.find("#records-wrapper");
      if (!this.$el.length) {
        return;
      }
      this.recordsCount = this.records.find('li').length;
      this.turntable.css("width", (this.collection.models.length + 1) * (this.itemWidth + 20));
      this.records.css("width", this.collection.models.length * (this.singleWidth + 5));
      _.each(this.collection.models, function(collage) {
        var collageView;
        collageView = new myd.TurntableCollageView({
          model: collage,
          container: _this.turntable
        });
        _this.turntableViews.push(collageView);
        return collageView.renderScreens();
      });
      this.getScreensForCollection(0);
      this.turntable.find('li').unbind('click');
      this.records.find('li').eq(0).addClass('pager-active');
      this.recordsContainer.find('.turntable-arrow-left').css('opacity', 0);
      if (this.recordsCount <= 10) {
        this.recordsContainer.find('.turntable-arrow-right').hide();
      }
      this.slider = new myd.TurntableModule({
        el: this.$el.find("#turntable"),
        onAfterSlide: function(currentSlideNumber, forced) {
          return _this.getScreensForCollection(currentSlideNumber, forced);
        }
      });
      this.turntable.hover(function() {
        return _this.slider.stopTimer();
      }, function() {
        return _this.slider.startTimer();
      });
      if (myd.feature.turntableslide) {
        $("#explore-turntable").css('margin-top', '-592px');
        return window.setTimeout(function() {
          return $("#explore-turntable").animate({
            'margin-top': '-492px'
          }, 1000);
        }, 750);
      }
    };

    TurntableExploreView.prototype.getScreensForCollection = function(currentSlideNumber, forced) {
      var activePage, prevPage, slideRecordPage,
        _this = this;
      if (!this.turntableViews.length) {
        this.$el.hide();
        return false;
      }
      prevPage = this.turntable.find('.pager-active');
      prevPage.removeClass('pager-active');
      prevPage.find('.previous').removeClass('.previous');
      prevPage.prev().find('.turntable-arrow-left').remove();
      prevPage.next().find('.turntable-arrow-right').remove();
      this.records.find('.pager-active').removeClass('pager-active');
      this.turntable.removeClass('forced');
      if (!this.turntableViews.length) {
        this.$el.hide();
        this.close();
        return;
      }
      this.turntableViews[currentSlideNumber].$el.addClass('pager-active');
      window.setTimeout(function() {
        return _this.turntableViews[currentSlideNumber].$el.find('.collage-cover').addClass('previous');
      }, 750);
      this.$el.find('#records li').eq(currentSlideNumber).addClass('pager-active');
      if (forced) {
        this.turntable.addClass('forced');
      }
      activePage = this.turntable.find('.pager-active');
      activePage.prev().append('<div class="turntable-arrow-left advance" />');
      activePage.next().append('<div class="turntable-arrow-right advance" />');
      slideRecordPage = Math.floor(currentSlideNumber / 10);
      if (this.filmstripPage !== slideRecordPage) {
        return this.jumpToRecordSlide(slideRecordPage);
      }
    };

    TurntableExploreView.prototype.clickecBack = function() {
      this.slider.goToPreviousSlide();
      return false;
    };

    TurntableExploreView.prototype.clickedSingle = function(event) {
      var origin, thumbIndex;
      origin = $(event.target);
      thumbIndex = this.records.find('li').index(event.target);
      this.slider.slide(thumbIndex, true);
      this.records.find('.pager-active').removeClass('pager-active');
      $(event.target).addClass('pager-active');
      $("#explore-turntable").css('margin-top', '0');
      return false;
    };

    TurntableExploreView.prototype.clickedAdvance = function(event) {
      var thumbIndex;
      thumbIndex = this.turntable.children().index($(event.target).parents('li.item'));
      this.slider.slide(thumbIndex, true);
      return false;
    };

    TurntableExploreView.prototype.clickPrevFilmstrip = function() {
      if (this.filmstripPage === 0) {
        return false;
      }
      return this.jumpToRecordSlide(this.filmstripPage - 1);
    };

    TurntableExploreView.prototype.clickNextFilmstrip = function() {
      if (Math.floor(this.recordsCount / 10) === this.filmstripPage + 1) {
        return;
      }
      return this.jumpToRecordSlide(this.filmstripPage + 1);
    };

    TurntableExploreView.prototype.jumpToRecordSlide = function(slide) {
      this.filmstripPage = slide;
      this.records.css('left', ((this.recordsContainer.find('.container').width() + 5) * this.filmstripPage) * -1);
      if (this.filmstripPage > 0 && this.recordsCount > 10) {
        this.recordsContainer.find('.turntable-arrow-left').css({
          'opacity': 1,
          'cursor': 'pointer'
        });
      } else {
        this.recordsContainer.find('.turntable-arrow-left').css({
          'opacity': 0,
          'cursor': 'default'
        });
      }
      if (Math.floor(this.recordsCount / 10) - 1 === this.filmstripPage) {
        this.recordsContainer.find('.turntable-arrow-right').css({
          'opacity': 0,
          'cursor': 'default'
        });
      } else {
        this.recordsContainer.find('.turntable-arrow-right').css({
          'opacity': 1,
          'cursor': 'pointer'
        });
      }
      return false;
    };

    TurntableExploreView.prototype.onClose = function() {
      var _ref1;
      if ((_ref1 = this.slider) != null) {
        _ref1.close();
      }
      return _.each(this.views, function(collageView) {
        return collageView != null ? collageView.close() : void 0;
      });
    };

    return TurntableExploreView;

  })(Backbone.View);

  global.myd.TurntableExploreView = TurntableExploreView;

}).call(this);
