(function() {
  var TurntableModule, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  TurntableModule = (function() {
    var currentPage;

    currentPage = 0;

    function TurntableModule(params) {
      var _this = this;
      this.$el = params.el;
      this.onAfterSlide = params.onAfterSlide;
      this.slides = this.$el.children('li');
      this.slideWidth = $(this.slides[0]).outerWidth();
      this.centerSlide();
      $(window).bind('resize.turntable', _.throttle($.proxy(this.centerSlide, this), 500));
      setTimeout(function() {
        return $(window).one('scroll', $.proxy(_this.stopTimer, _this));
      }, 5000);
      this.startTimer();
    }

    TurntableModule.prototype.slide = function(page, forced) {
      if (page == null) {
        page = currentPage + 1;
      }
      if (forced == null) {
        forced = false;
      }
      if (page === currentPage) {
        return;
      }
      if (page >= this.slides.length) {
        page = 0;
      }
      if (forced) {
        this.resetTimer();
      }
      currentPage = page;
      this.centerSlide();
      return this.onAfterSlide(page, forced);
    };

    TurntableModule.prototype.centerSlide = function() {
      return this.$el.css('left', (($(window).width() / 2) - (this.slideWidth / 2)) - (currentPage * this.slideWidth));
    };

    TurntableModule.prototype.startTimer = function() {
      return this.timer = window.setInterval($.proxy(this.slide, this), 5000);
    };

    TurntableModule.prototype.stopTimer = function() {
      return window.clearTimeout(this.timer);
    };

    TurntableModule.prototype.resetTimer = function() {
      this.stopTimer();
      return this.startTimer();
    };

    TurntableModule.prototype.getCurrentSlide = function() {
      return currentPage;
    };

    TurntableModule.prototype.close = function() {
      return $(window).unbind('resize.turntable');
    };

    return TurntableModule;

  })();

  global.myd.TurntableModule = TurntableModule;

}).call(this);
