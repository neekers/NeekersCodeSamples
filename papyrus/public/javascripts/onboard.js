(function() {
  var Onboard, _ref, _ref1;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  Onboard = (function() {

    function Onboard() {
      var _this = this;
      this.window = $(window);
      this.pinster = $('#pinster');
      this.windowWidth = 0;
      this.bodyScroll = $('.scrollcontainer');
      this.scroller = $('.bodycontent');
      this.pages = $('.page');
      this.pageCount = this.pages.length;
      this.logo = $('.logo');
      this.currentPage = 0;
      this.topic = '';
      this.topicData = {};
      this.topicScreens = [];
      this.cover = null;
      this.mainAsset = {};
      this.window.bind('resize', _.throttle($.proxy(this.updateWidths, this), 100));
      $('#welcome .continue').click($.proxy(this.slide, this));
      this.updateWidths();
      this.bounceTimer = setInterval((function() {
        return _this.pinster.toggleClass('bounce');
      }), 1500);
    }

    Onboard.prototype.updateWidths = function() {
      this.windowWidth = this.window.width();
      this.scroller.css('width', this.windowWidth);
      this.bodyScroll.css('width', this.windowWidth * this.pageCount);
      this.pages.css('width', this.windowWidth);
      return this.jumpTo(this.currentPage);
    };

    Onboard.prototype.jumpTo = function(page) {
      this.currentPage = page;
      this.setOffset();
      return this.updateLogo();
    };

    Onboard.prototype.slide = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      if (this.currentPage >= this.pageCount - 1) {
        return false;
      }
      this.currentPage++;
      this.setOffset();
      return this.updateLogo();
    };

    Onboard.prototype.setOffset = function() {
      return this.bodyScroll.css('margin-left', (this.windowWidth * this.currentPage) * -1);
    };

    Onboard.prototype.updateLogo = function() {
      switch (this.currentPage) {
        case 1:
          this.trackPage('step1');
          this.logo.addClass('part2');
          this.fadeDragArrow();
          this.renderTopics();
          return clearInterval(this.bounceTimer);
        case 2:
          this.trackPage('step2');
          return this.logo.removeClass('part2').addClass('part3');
        case 3:
          this.trackPage('step3');
          this.logo.removeClass('part3').addClass('part4');
          return this.renderCompletePage();
      }
    };

    Onboard.prototype.fadeDragArrow = function() {
      return $('.dragarrow').addClass('hidden');
    };

    Onboard.prototype.selectItem = function(event) {
      var additems, target;
      target = $(event.currentTarget);
      target.toggleClass('checked');
      additems = $('#additems');
      if (!additems.find('.checked').length) {
        additems.find('.continue').removeClass('visible');
        return this.cover = null;
      } else {
        additems.find('.continue').addClass('visible');
        if (this.cover === null) {
          return this.cover = target.data('uid');
        }
      }
    };

    Onboard.prototype.selectTopic = function(event) {
      var target;
      if (event != null) {
        event.preventDefault();
      }
      target = $(event.currentTarget);
      this.topic = target.data('topic');
      this.findTopicScreens();
      return this.slide();
    };

    Onboard.prototype.findTopicScreens = function() {
      var topic, _i, _len, _ref2;
      _ref2 = myd.onboarding_topics;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        topic = _ref2[_i];
        if (topic.title === this.topic) {
          this.topicData = topic;
          this.topicScreens = topic.screens.slice(0, 12);
          this.renderScreens();
          return;
        }
      }
    };

    Onboard.prototype.processSelected = function(event) {
      var additems, cover, item, newCollection, screenData, selected, self, _i, _len;
      self = this;
      if (event != null) {
        event.preventDefault();
      }
      additems = $('#additems');
      screenData = this.findCover(this.cover);
      if (screenData.item.type === 'fact') {
        screenData.item.thumbnail_url = null;
        this.cover = this.topicData.cover_asset.uid;
      }
      if (screenData.item.thumbnail_url === null) {
        additems = $('#additems');
        selected = additems.find('.checked');
        for (_i = 0, _len = selected.length; _i < _len; _i++) {
          item = selected[_i];
          screenData = this.findCover($(item).data('uid'));
          if (screenData.item.thumbnail_url !== null && screenData.item.type !== 'fact') {
            this.cover = screenData.item.uid;
            break;
          }
        }
      }
      cover = this.cover;
      this.mainAsset = screenData;
      if (!additems.find('.checked').length) {
        return false;
      }
      newCollection = {
        title: 'My First Collage',
        screens: [],
        cover_asset: {
          uid: cover
        }
      };
      selected = additems.find('.checked');
      selected.each(function() {
        return newCollection.screens.push({
          item: {
            uid: $(this).data('uid')
          }
        });
      });
      $.post(myd.urls.bookmarks, JSON.stringify({
        entity_url: this.topicData.topic_url,
        bookmarked: true
      }));
      return $.post(myd.urls.create_collection, JSON.stringify(newCollection)).done(function(data) {
        $.post(myd.urls.bookmarks, JSON.stringify({
          entity_url: data.url,
          bookmarked: true
        }));
        return self.slide();
      });
    };

    Onboard.prototype.findCover = function(uid) {
      var screen, screenData, _i, _len, _ref2;
      screenData = {};
      _ref2 = this.topicData.screens;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        screen = _ref2[_i];
        if (uid === screen.item.uid) {
          screenData = screen;
          return screenData;
        }
      }
    };

    Onboard.prototype.renderTopics = function() {
      var topic_html, topics;
      topics = $('#topics');
      topic_html = Mustache.render($('#topic_grid_template').html(), {
        items: myd.onboarding_topics.slice(0, 8)
      });
      topics.find('.grid').html(topic_html);
      return topics.find('.item').one('click', $.proxy(this.selectTopic, this));
    };

    Onboard.prototype.renderScreens = function() {
      var screen, screens, screens_html, _i, _len, _ref2;
      _ref2 = this.topicScreens;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        screen = _ref2[_i];
        if (screen.item.type === 'fact') {
          screen.item.text = window.markdown.toHTML(screen.item.text);
        }
      }
      screens = $('#additems');
      screens_html = Mustache.render($('#item_grid_template').html(), {
        items: this.topicScreens
      });
      screens.find('.grid').html(screens_html);
      screens.find('.grid .item').click($.proxy(this.selectItem, this));
      return screens.find('.continue').click($.proxy(this.processSelected, this));
    };

    Onboard.prototype.renderCompletePage = function() {
      var finish_html, finished, screenData,
        _this = this;
      screenData = this.mainAsset;
      if (screenData.item.type === 'fact') {
        screenData.item.image_150_url = this.topicData.cover_asset.thumbnail_url;
      }
      finished = $('#finished');
      finish_html = Mustache.render($('#complete_template').html(), {
        items: screenData
      });
      finished.find('.screen').html(finish_html);
      finished.find('.screen, .continue, #finished .screen a').click(function() {
        var likes;
        likes = global.myd.urls.my_bookmarks.replace('api/', 'papyrus/p/api/').replace('/assets', '');
        document.location = likes + '#first';
        return false;
      });
      return setTimeout((function() {
        return finished.find('.screen').addClass('animated tada');
      }), 800);
    };

    Onboard.prototype.trackPage = function(page) {
      var _ref2, _ref3;
      document.location.hash = page;
      if ((_ref2 = window.omnicollagio) != null) {
        _ref2.pageName = document.title + ' - ' + page;
      }
      if ((_ref3 = window.omnicollagio) != null) {
        _ref3.t();
      }
      return window._gaq.push(['_trackPageview', document.location]);
    };

    return Onboard;

  })();

  global.myd.Onboard = new Onboard();

}).call(this);
