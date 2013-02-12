(function() {
  var CollageView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  CollageView = (function(_super) {

    __extends(CollageView, _super);

    function CollageView() {
      return CollageView.__super__.constructor.apply(this, arguments);
    }

    CollageView.prototype.el = "#collections";

    CollageView.prototype.collection = myd.GridCollection;

    CollageView.prototype.events = {
      'click div > .fb-share': 'shareCollection',
      'click #back-to-top': 'clickedBackToTop',
      'click .colleciton-reuse': 'clickedReuse',
      'click .collection-fb-share': 'clickedShare',
      'click .publish span:first': 'clickedPublish',
      'click .publish span:last': 'clickedUnPublish'
    };

    CollageView.prototype.bindToCollection = {
      'errorReset': "renderError",
      'reset': "reset",
      'add': "addNewScreen",
      'reordered': "reorderedReset",
      'deleteScreen': "deleteScreen",
      'remove': "reindexCollection"
    };

    CollageView.prototype.initialize = function(params) {
      var _this = this;
      this.window = $(window);
      $("#content").html(Mustache.render($("#full_stacked_view_template").html()));
      this.setElement($("div#collections"));
      $("body").bind('keyup', function(event) {
        return _this.screenKeyNav(event);
      });
      this.frontMatterView = null;
      this.weAreInEditingMode = false;
      this.context = "collections";
      this.clearHistory = params.clearHistory || false;
      this.startInEditMode = false;
      this.editBar = $('.edit');
      this.editCollectionButton = $('#edit-collection');
      this.activeScreenIndex = 0;
      this.screenViews = [];
      this.tileViewCreator = params.tileViewCreator || function(tileModel) {
        var assetView, entity_url;
        entity_url = tileModel.get("entity_url");
        assetView = new myd.ScreenView({
          model: tileModel,
          context: "collections",
          inline: true,
          isEditing: _this.weAreInEditingMode
        });
        assetView.bind('selected', _this.selectedAsset, _this);
        assetView.bind('addItem', _this.callAddItem, _this);
        assetView.bind('addNewItem', _this.callAddNewItem, _this);
        assetView.bind('delete', _this.deleteScreen, _this);
        assetView.bind('active', _this.activeScreen, _this);
        _this.screenViews.push(assetView);
        return assetView;
      };
      this.collection = params.collection;
      if (document.cookie.indexOf("publish") > 0) {
        return global.myd.feature["publish"] = true;
      }
    };

    CollageView.prototype.display = function(mydCollection, assetUID) {
      this.showCommentsForScreen = assetUID;
      return this.collection.fetch(mydCollection);
    };

    CollageView.prototype.reset = function() {
      var _this = this;
      this.closeScreens();
      $("#content").html(Mustache.render($("#full_stacked_view_template").html()));
      this.setElement($("div#collections"));
      this.editBar.find('.cancel-edit-btn, .done-edit-btn, .reorder-btn').unbind('click');
      if (this.$el.find("article").length === 0) {
        this.$el.find("ol").empty();
      }
      if (this.frontMatterView !== null) {
        this.frontMatterView.unbind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.unbind("editBackground", this.launchEditBackground, this);
        this.frontMatterView.close();
      }
      return this.render();
    };

    CollageView.prototype.reorderedReset = function() {
      this.closeScreens();
      this.renderCollectionTiles();
      return myd.Placeholder().refresh(this.$el);
    };

    CollageView.prototype.render = function(params) {
      var counter, index, itemEl, self, _ref1, _ref2,
        _this = this;
      $("#page-title").text(this.collection.frontMatter.get("title"));
      document.title = "" + ($('#page-title').text()) + " - Collagio";
      omnicollagio.pageName = "topic > " + this.collection.frontMatter.get('topic_title') + ": collage detail: " + this.collection.frontMatter.get('uid');
      omnicollagio.eVar15 = "D=pageName";
      if ((_ref1 = omnicollagio.events) != null ? _ref1.length : void 0) {
        omnicollagio.events += ",event8";
      } else {
        omnicollagio.events = "event8";
      }
      omnicollagio.prop7 = this.collection.frontMatter.get("topic_title");
      $(".page-header").addClass("collection");
      this.editBar.find('.cancel-edit-btn').click(function() {
        return _this.cancelEdit();
      });
      this.editBar.find('.done-edit-btn').click(function() {
        return _this.finishEdit();
      });
      this.editBar.find('.reorder-btn').click(function() {
        return _this.launchReorder();
      });
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
      this.renderCollectionTiles();
      if (this.showCommentsForScreen) {
        counter = 0;
        index = 0;
        _.each(this.collection.models, function(screen) {
          if (screen.get("uid") === _this.showCommentsForScreen) {
            index = counter;
            _this.activeScreenIndex = index + 1;
            _this.screenViews[index].activateScreen();
            _this.screenViews[index].$el.find("aside.comments").addClass("show");
            return;
          }
          return ++counter;
        });
        itemEl = $("a[name='screen-" + (index + 1) + "']");
        if (itemEl.length) {
          $("body, html").delay(3000).animate({
            'scrollTop': itemEl.offset().top - 80
          }, 500, "easeOutCirc");
        }
        this.showCommentsForScreen = null;
      }
      $(window).bind('scroll', _.throttle($.proxy(this.checkScroll, this), 500));
      if (this.collection.models.length === 0) {
        this.checkScroll();
      }
      if (this.collection.frontMatter.get("editable")) {
        myd.initTextEditor();
      }
      if ((_ref2 = this.screenViews[0]) != null) {
        _ref2.fetchComments();
      }
      if (this.collection.frontMatter.get("editable")) {
        this.editCollectionButton.show();
        self = this;
        this.editCollectionButton.click(function(event) {
          event.preventDefault();
          return self.enterEditingMode();
        });
      } else {
        this.editCollectionButton.hide();
      }
      if (this.startInEditMode) {
        this.enterEditingMode();
      }
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
      return this.incrementViewCount();
    };

    CollageView.prototype.incrementViewCount = function() {
      var incrementViewCountUrl,
        _this = this;
      incrementViewCountUrl = this.collection.collection.increment_view_count;
      return myd.serviceModule.post({
        url: incrementViewCountUrl,
        data: [],
        success: function(response) {
          return _this.onIncrementViewCountSuccess(response);
        },
        error: function(response) {}
      });
    };

    CollageView.prototype.onIncrementViewCountSuccess = function(response) {
      return this.frontMatterView.model.set('view_count', response.view_count);
    };

    CollageView.prototype.screenKeyNav = function(event) {
      var itemEl, _ref1, _ref2, _ref3, _ref4;
      if (event.target.tagName.toLowerCase() === "input" || event.target.tagName.toLowerCase() === "textarea" || $(event.target).attr("contenteditable")) {
        return false;
      }
      if (event.keyCode === 74) {
        itemEl = $("a[name='screen-" + (this.activeScreenIndex + 1) + "']");
        if (itemEl) {
          this.activeScreenIndex++;
        }
      } else if (event.keyCode === 75) {
        itemEl = $("a[name='screen-" + (this.activeScreenIndex - 1) + "']");
        if (itemEl) {
          this.activeScreenIndex--;
        }
      } else if (!this.weAreInEditingMode && event.keyCode === 82) {
        if ((_ref1 = this.screenViews[this.activeScreenIndex - 1]) != null) {
          _ref1.clickedReuse();
        }
        return false;
      } else if (!this.weAreInEditingMode && event.keyCode === 72) {
        if ((_ref2 = this.screenViews[this.activeScreenIndex - 1]) != null) {
          _ref2.likeButtonView.clickedLike();
        }
        return false;
      } else if (!this.weAreInEditingMode && event.keyCode === 83) {
        if ((_ref3 = this.screenViews[this.activeScreenIndex - 1]) != null) {
          _ref3.clickedFBShare();
        }
        return false;
      } else if (!this.weAreInEditingMode && event.keyCode === 67) {
        if ((_ref4 = this.screenViews[this.activeScreenIndex - 1]) != null) {
          _ref4.leaveCommentView.textInput.focus();
        }
        return false;
      }
      if (itemEl != null ? itemEl.length : void 0) {
        $("body, html").animate({
          'scrollTop': itemEl.offset().top - 100
        }, 500, "easeOutCirc");
      }
      return false;
    };

    CollageView.prototype.addNewScreen = function(screenModel, collection, options) {
      var entity_url, screenView;
      entity_url = screenModel.get("entity_url");
      screenModel.set("index", options.index, {
        silent: true
      });
      screenView = new myd.ScreenView({
        model: screenModel,
        context: "collections",
        inline: true,
        isEditing: true
      });
      screenView.bind('selected', this.selectedAsset, this);
      screenView.bind('addItem', this.callAddItem, this);
      screenView.bind('addNewItem', this.callAddNewItem, this);
      screenView.bind('delete', this.deleteScreen, this);
      screenView.bind('active', this.activeScreen, this);
      screenView.render();
      if (options.index > 0) {
        this.$el.find("article section:eq(" + (options.index - 1) + ")").after(screenView.el);
      } else {
        this.$el.find("article > div").after(screenView.el);
      }
      this.screenViews.splice(options.index, 0, screenView);
      myd.Placeholder().refresh(this.$el);
      return this.reindexCollection();
    };

    CollageView.prototype.deleteScreen = function(screen) {
      var oldCount;
      this.collection.remove(screen, {
        silent: true
      });
      oldCount = this.frontMatterView.model.get("screens_count");
      this.frontMatterView.model.set("screens_count", --oldCount);
      return this.reindexCollection();
    };

    CollageView.prototype.reindexCollection = function() {
      return _.each(this.collection.models, function(screenModel, index, collection) {
        screenModel.set("prevIndex", index);
        screenModel.set("nextIndex", index + 2);
        return screenModel.set("index", index + 1);
      });
    };

    CollageView.prototype.checkScroll = function() {
      var docViewBottom, docViewTop, middle, screenEls,
        _this = this;
      docViewTop = this.window.scrollTop();
      docViewBottom = docViewTop + this.window.height();
      middle = this.window.scrollTop() + (this.window.height() / 2);
      screenEls = this.$el.find(".screen-item");
      _.all(this.screenViews, function(screenView) {
        var currentIndex, elemBottom, elemTop, screenEl, screenV, _i, _len, _ref1, _ref2;
        screenEl = screenView.$el;
        elemTop = screenEl.offset().top;
        elemBottom = elemTop + screenEl.height();
        if (elemTop <= middle && elemTop > docViewTop && elemTop < docViewBottom) {
          _ref1 = _this.screenViews;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            screenV = _ref1[_i];
            screenV.deactivateScreen();
          }
          screenView.activateScreen();
          currentIndex = _.indexOf(_this.screenViews, screenView);
          _this.activeScreenIndex = currentIndex + 1;
          if ((_ref2 = _this.screenViews[currentIndex + 1]) != null) {
            _ref2.fetchComments();
          }
          return false;
        }
        return true;
      });
      if ((this.collection.models.length === 0 || this.activeScreenIndex >= this.collection.models.length - 3) && typeof this.recommendedCollagesView === "undefined") {
        this.recommendedCollagesView = new myd.RecommendedCollagesView({
          container: $("#content"),
          topic: this.collection.frontMatter.get("topic_title"),
          currentCollectionUID: this.collection.frontMatter.id
        });
      }
      if (this.context === "collections") {
        if (docViewTop > 360) {
          return $("#back-to-top").slideDown();
        } else {
          return $("#back-to-top").slideUp();
        }
      }
    };

    CollageView.prototype.enterEditingMode = function() {
      var publishDiv, screen, _i, _len, _ref1;
      this.weAreInEditingMode = true;
      $('body').addClass('editing');
      this.frontMatterView.startEditMode();
      this.addFullScreenAddBar();
      _ref1 = this.screenViews;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        screen = _ref1[_i];
        screen.startEditing();
      }
      myd.Placeholder().refresh(this.$el);
      this.startInEditMode = false;
      $('.comments a').bind('click', function() {
        return false;
      });
      if (myd.feature["publish"]) {
        publishDiv = this.$el.find(".publish");
        publishDiv.show();
        if (this.collection.frontMatter.attributes.published) {
          publishDiv.find("span:first").addClass("publish-on").removeClass("publish-off");
          publishDiv.find("span:last").addClass("publish-off").removeClass("publish-on");
        } else {
          publishDiv.find("span:first").addClass("publish-off").removeClass("publish-on");
          publishDiv.find("span:last").addClass("publish-on").removeClass("publish-off");
        }
      }
      return false;
    };

    CollageView.prototype.clickedPublish = function() {
      var publishDiv;
      publishDiv = this.$el.find(".publish");
      publishDiv.find("span:first").addClass("publish-on").removeClass("publish-off");
      return publishDiv.find("span:last").addClass("publish-off").removeClass("publish-on");
    };

    CollageView.prototype.clickedUnPublish = function() {
      var publishDiv;
      publishDiv = this.$el.find(".publish");
      publishDiv.find("span:first").addClass("publish-off").removeClass("publish-on");
      return publishDiv.find("span:last").addClass("publish-on").removeClass("publish-off");
    };

    CollageView.prototype.cancelEdit = function() {
      this.screenViews.map(function(screen) {
        return screen.trigger("cancelEdit");
      });
      if ($("#content article").length > 0) {
        this.closeScreens();
        $("#content").html(Mustache.render($("#full_stacked_view_template").html()));
      }
      this.trigger("cancelEdit");
      this.leaveEditingMode();
      this.collection.cancelEditing();
      return false;
    };

    CollageView.prototype.finishEdit = function(params) {
      var isPublishSelected, publishDiv, screen, textValue, _i, _len, _ref1,
        _this = this;
      if (params == null) {
        params = {
          callBack: null
        };
      }
      this.screenViews.map(function(screen) {
        return screen.trigger("finishEdit");
      });
      if (myd.feature["publish"]) {
        publishDiv = this.$el.find(".publish");
        if (publishDiv.is(":visible")) {
          isPublishSelected = publishDiv.find("span:first").hasClass("publish-on") ? true : false;
          this.collection.frontMatter.set("published", isPublishSelected, {
            silent: true
          });
          publishDiv.hide();
        }
      }
      textValue = this.$el.find("h1.title").first().text().trim();
      this.$el.find("h1.title").first().removeClass("error-message-collage-title");
      if (textValue.toLowerCase() !== "please enter a title...") {
        this.collection.frontMatter.set("title", textValue, {
          silent: true
        });
      } else {
        return;
      }
      if (this.$el.find(".description").first().text().trim() !== "Enter description") {
        this.collection.frontMatter.set("description", this.$el.find(".description").first().text().trim(), {
          silent: true
        });
      } else {
        this.$el.find(".description").first().text('');
        this.collection.frontMatter.set("description", '', {
          silent: true
        });
      }
      this.$el.find("h1, .description").attr("contenteditable", false);
      _ref1 = this.screenViews;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        screen = _ref1[_i];
        screen.stopEditing();
      }
      this.trigger("finishEdit");
      this.leaveEditingMode(params.silent);
      this.syncEdit({
        callBack: params.callBack
      });
      this.collection.saveCurrentStateAsOriginal();
      return false;
    };

    CollageView.prototype.leaveEditingMode = function() {
      var _this = this;
      this.weAreInEditingMode = false;
      $('body').removeClass('editing');
      if (this.frontMatterView != null) {
        this.frontMatterView.leaveEditMode();
      }
      if (this.addBarView != null) {
        this.bind("finishEdit", function() {
          return _this.addBarView.trigger("finishEdit");
        });
        this.bind("cancelEdit", function() {
          return _this.addBarView.trigger("cancelEdit");
        });
        this.addBarView.close();
      }
      return $('.comments a').unbind('click');
    };

    CollageView.prototype.renderCollectionTiles = function() {
      var indexer, rendered_view_html,
        _this = this;
      indexer = 1;
      rendered_view_html = this.collection.map(function(tile) {
        var view;
        tile.set("index", indexer, {
          silent: true
        });
        tile.set("nextIndex", indexer + 1, {
          silent: true
        });
        tile.set("prevIndex", indexer - 1, {
          silent: true
        });
        view = _this.tileViewCreator(tile);
        view.render();
        indexer++;
        return view.el;
      });
      if (this.$el.find('article').length) {
        this.$el.find('article').html(rendered_view_html);
      } else {
        this.$el.find('ol').html(rendered_view_html);
      }
      if (this.weAreInEditingMode) {
        return this.addFullScreenAddBar();
      }
    };

    CollageView.prototype.addFullScreenAddBar = function() {
      var _this = this;
      this.$el.find('article > div > .add-bar').parent().remove();
      this.addBarView = new myd.AddBarView({
        model: this.collection.frontMatter,
        index: 0,
        first_time: this.startInEditMode
      });
      this.$el.find('article').prepend(this.addBarView.render());
      this.bind("finishEdit", function() {
        return _this.addBarView.trigger("finishEdit");
      });
      this.bind("cancelEdit", function() {
        return _this.addBarView.trigger("cancelEdit");
      });
      this.addBarView.bind("addItem", function(item) {
        return _this.callAddItem(item);
      });
      return this.addBarView.bind("addNewItem", function(item) {
        return _this.callAddNewItem(item);
      });
    };

    CollageView.prototype.syncEdit = function(params) {
      if (params == null) {
        params = {
          callBack: null
        };
      }
      if (params.callBack === null) {
        return this.collection.sync(this.leaveEditingMode);
      } else {
        return this.collection.sync(params.callBack);
      }
    };

    CollageView.prototype.launchReorder = function() {
      var screen, _i, _len, _ref1;
      myd.Placeholder().clean(this.$el);
      _ref1 = this.screenViews;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        screen = _ref1[_i];
        screen.saveModelChanges();
      }
      this.reorderView = new myd.ReorderCollectionView({
        collection: this.collection
      });
      return false;
    };

    CollageView.prototype.clickedBackToTop = function() {
      $("body, html").animate({
        'scrollTop': 0
      }, 500);
      return false;
    };

    CollageView.prototype.callSetCover = function(item) {
      this.collection.setCoverImage(item);
      this.newPhotoVideoView.close();
      this.overlayView.close();
      return this.collection.frontMatter.set("cover_asset", item.toJSON());
    };

    CollageView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    CollageView.prototype.submitAssetEdit = function(asset) {
      return this.collection.sync_api(asset);
    };

    CollageView.prototype.renderError = function() {
      return this.$el.html("There was an error processing your request.");
    };

    CollageView.prototype.callAddItem = function(params) {
      var index;
      index = params.item.get('index');
      if (params.item.get("search_origin") != null) {
        params.item.set("asset_type", params.item.get("type") === "ImageAsset" ? "image" : "video");
        this.collection.addNewItem(params.item, index);
      } else {
        this.collection.addItemToCollection(params.item, index);
      }
      return false;
    };

    CollageView.prototype.callAddNewItem = function(params) {
      var index;
      index = params.item.get('index');
      this.collection.addNewItem(params.item, Number(index));
      return false;
    };

    CollageView.prototype.shareCollection = function() {
      var description, thumbnail, title, url;
      title = this.collection.frontMatter.get("title");
      thumbnail = this.collection.frontMatter.get("cover_asset").thumbnail_url;
      description = this.collection.frontMatter.get("description");
      url = window.location.href.replace("local.collagio.com:9292", "test.collagio.com");
      if (typeof FB !== "undefined" && FB !== null) {
        FB.ui({
          method: 'feed',
          message: '',
          name: title,
          caption: '',
          description: description,
          link: url,
          picture: thumbnail,
          display: 'popup',
          actions: [
            {
              name: 'Check Out Collagio',
              link: 'http://www.collagio.com/'
            }
          ],
          user_message_prompt: 'Share your thoughts about Collagio'
        }, function(response) {
          if (response && response.post_id) {

          } else {

          }
        });
      }
      return false;
    };

    CollageView.prototype.clickedReuse = function() {
      this.reuseItemView = new myd.ReuseItemView({
        model: this.collection
      });
      return false;
    };

    CollageView.prototype.clickedShare = function() {
      var description, thumbnail, title, url, _ref1;
      title = this.collection.frontMatter.get("title");
      thumbnail = (_ref1 = this.collection.frontMatter.get("cover_asset")) != null ? _ref1.thumbnail_url : void 0;
      description = this.collection.frontMatter.get("description");
      url = window.location.href.replace("local.collagio.com:9292", "test.collagio.com");
      if (typeof FB !== "undefined" && FB !== null) {
        FB.ui({
          method: 'feed',
          message: '',
          name: title,
          caption: '',
          description: description,
          link: url,
          picture: thumbnail,
          display: 'popup',
          actions: [
            {
              name: 'Check Out Collagio',
              link: 'http://www.collagio.com/'
            }
          ],
          user_message_prompt: 'Share your thoughts about Collagio'
        }, function(response) {
          if (response && response.post_id) {

          } else {

          }
        });
        return false;
      }
    };

    CollageView.prototype.callAddItemToCollection = function(item) {
      this.trigger("addItem", {
        view: this,
        item: item
      });
      return false;
    };

    CollageView.prototype.launchEditBackground = function() {
      var items,
        _this = this;
      items = [];
      _.each(this.collection.models, function(screen) {
        if (screen.get("item").get("type") === "image" || screen.get("item").get("type") === "video" || screen.get("item").get("type") === "collection") {
          if (screen.get("item").get("type") === "video" && (screen.get("item").get("youtube_id") != null)) {
            screen.get("item").set("image_300_url", myd.getVideoUrl(screen.get("item").get("youtube_id")));
          }
          return items.push(screen.get("item"));
        }
      });
      this.overlayView = new myd.OverlayView();
      this.newPhotoVideoView = new myd.AddPhotoVideoView({
        container: $("body"),
        addType: "cover",
        collectionItems: items
      });
      this.newPhotoVideoView.bind("addItem", this.callAddItemToCollection, this);
      this.newPhotoVideoView.bind("setCover", this.callSetCover, this);
      return this.newPhotoVideoView.bind("cancel", function() {
        return _this.overlayView.close();
      });
    };

    CollageView.prototype.closeScreens = function() {
      _.each(this.screenViews, function(screenView) {
        screenView.unbind('selected', this.selectedAsset, this);
        screenView.unbind('addItem', this.callAddItem, this);
        screenView.unbind('addNewItem', this.callAddNewItem, this);
        screenView.unbind('delete', this.deleteScreen, this);
        return screenView.close();
      });
      return this.screenViews = [];
    };

    CollageView.prototype.onClose = function() {
      var _ref1, _ref2, _ref3,
        _this = this;
      $.removeCookie("add_image_search");
      $("body").unbind('keyup');
      if ((_ref1 = this.recommendedCollagesView) != null) {
        _ref1.close();
      }
      if (this.addBarView != null) {
        this.bind("finishEdit", function() {
          return _this.addBarView.trigger("finishEdit");
        });
        this.bind("cancelEdit", function() {
          return _this.addBarView.trigger("cancelEdit");
        });
        this.addBarView.close();
      }
      this.closeScreens();
      if ((_ref2 = this.reuseItemView) != null) {
        _ref2.close();
      }
      if (this.frontMatterView != null) {
        this.frontMatterView.unbind("refresh");
        this.frontMatterView.unbind("editBackground", this.launchEditBackground, this);
        this.frontMatterView.close();
      }
      if ((_ref3 = this.reorderView) != null) {
        _ref3.close();
      }
      this.editCollectionButton.hide();
      return this.leaveEditingMode();
    };

    return CollageView;

  })(Backbone.View);

  global.myd.CollageView = CollageView;

}).call(this);
