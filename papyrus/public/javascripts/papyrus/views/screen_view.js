(function() {
  var ScreenView, renderVideoEmbed, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderVideoEmbed = global.myd.renderVideoEmbed;

  ScreenView = (function(_super) {

    __extends(ScreenView, _super);

    function ScreenView() {
      return ScreenView.__super__.constructor.apply(this, arguments);
    }

    ScreenView.prototype.model = myd.ScreenModel;

    ScreenView.prototype.events = {
      'click .asset-wrapper, .screen-app-link, .svg_play': 'selected',
      'click .screen-reuse': 'clickedReuse',
      'click .screen-fb-share': 'clickedFBShare',
      'click .more-info': 'clickedMoreInfo',
      'click .origin_source_url': 'clickedSource',
      'click .screen-delete': 'clickedDelete'
    };

    ScreenView.prototype.initialize = function(params) {
      var _this = this;
      this.context = params.context;
      this.renderInline = params.inline;
      this.showComments = this.context === "collections";
      this.tab = params.tab;
      this.searchItem = params.searchItem;
      this.isEditing = params.isEditing || false;
      this.model.get("item").bind("change:metaData", this.toggleMetaDataView, this);
      this.bind("finishEdit", function() {
        var _ref1;
        return (_ref1 = _this.addBarView) != null ? _ref1.trigger("finishEdit") : void 0;
      });
      this.bind("cancelEdit", function() {
        var _ref1;
        return (_ref1 = _this.addBarView) != null ? _ref1.trigger("cancelEdit") : void 0;
      });
      return this;
    };

    ScreenView.prototype.render = function() {
      var newRoot, screenOptions,
        _this = this;
      newRoot = "";
      if (this.renderInline) {
        newRoot = $("<section></section>");
      } else {
        newRoot = $("<li></li>");
      }
      this.setElement(newRoot);
      screenOptions = this.getScreenOptions();
      if (this.model.get("item").get("screens") != null) {
        this.$el.html(myd.renderScreen(this.model.toJSON(), this.context, screenOptions, this.tab));
        myd.renderAssetFragment(this.model, this.context, this.$el);
        if (this.renderinline) {
          this.$el.addClass("screen");
        }
      } else {
        this.$el.html(myd.renderScreen(this.model.toJSON(), this.context, screenOptions, this.tab));
      }
      if (screenOptions.showScreenNavigation) {
        this.screenNavView = new myd.ScreenNavView({
          model: this.model,
          el: this.$el.find(".screen-nav")
        });
      }
      if (this.renderInline && this.model.get("editable")) {
        this.addBarView = new myd.AddBarView({
          model: this.model,
          index: this.model.get('index')
        });
        this.addBarView.bind("addNewItem", function(item) {
          return _this.trigger("addNewItem", item);
        });
        this.addBarView.bind("addItem", function(item) {
          return _this.trigger("addItem", item);
        });
        this.$el.append(this.addBarView.render());
      }
      if (this.model.get("item").get("type") === "feed") {
        this.assetRSSView = new global.myd.AssetRSSView({
          model: this.model.get("item"),
          container: this.$el,
          removeEvents: this.context !== "collections",
          context: this.context
        });
      } else if (this.model.get("item").get("type") === "collection") {
        this.collectionAuthorView = new global.myd.CollectionAuthorView({
          model: this.model,
          el: this.$el.find(".collection_tile_meta")
        });
      }
      this.likeButtonView = new myd.LikeButtonView({
        model: this.model,
        el: this.$el.find(".like-container")
      });
      this.likeContainer = this.$el.find(".like-container");
      this.caption = this.$el.find(".caption-text");
      this.headline = this.$el.find("h2").first();
      this.factText = this.$el.find(".screen-text");
      this.deleteIcon = this.$el.find(".screen-delete");
      this.reuseIcon = this.$el.find(".screen-reuse");
      this.shareIcon = this.$el.find(".screen-fb-share");
      if (this.context === "profile" && (this.tab === "collections" || this.tab === "items") && this.model.get("editable") && myd.feature.deletecollections) {
        this.deleteIcon.css("display", "");
      }
      if (this.showComments) {
        this.$el.find(".screen-item").append("<aside class='comments'>");
        this.commenteAside = this.$el.find("aside.comments");
        this.commentsCollection = new myd.CommentsCollection({
          comments_url: this.model.get("comments_url")
        });
        this.screenCommentsListView = new myd.ScreenCommentsListView({
          container: this.$el.find("aside.comments"),
          item: this.model,
          collection: this.commentsCollection
        });
        this.screenCommentsListView.bind("rendered", function() {
          if (this.editMode) {
            $(this.leaveCommentView.el).hide();
            return $(this.screenCommentsListView.el).hide();
          }
        }, this);
        this.leaveCommentView = new myd.LeaveCommentView({
          container: this.$el.find("aside.comments"),
          item: this.model,
          collection: this.commentsCollection
        });
      }
      if (this.isEditing) {
        this.startEditing();
      }
      this.$el.find(".asset img").on("load", function() {
        return _this.$el.find(".image-wrapper").css({
          "opacity": 1
        });
      });
      return this.initCaptionFields();
    };

    ScreenView.prototype.initCaptionFields = function() {
      var CAPTION_MAX_HEIGHT, CAPTION_MIN_HEIGHT, lineHeight, lines, text, textAreaHeight;
      CAPTION_MAX_HEIGHT = 300;
      CAPTION_MIN_HEIGHT = 35;
      text = this.caption.val();
      lines = text != null ? text.match(new RegExp("\n\r?", "g")) : void 0;
      lineHeight = 18;
      textAreaHeight = 0;
      if ((lines != null ? lines.length : void 0) != null) {
        textAreaHeight = (lines.length + 1) * lineHeight;
        if (textAreaHeight > CAPTION_MAX_HEIGHT) {
          textAreaHeight = CAPTION_MAX_HEIGHT;
        }
      } else {
        textAreaHeight = CAPTION_MIN_HEIGHT;
      }
      this.caption.height(textAreaHeight + "px");
      if (this.isEditing) {
        return this.enableCaptionField(true);
      } else {
        return this.enableCaptionField(false);
      }
    };

    ScreenView.prototype.enableCaptionField = function(enable) {
      if (!enable) {
        this.$el.find(".caption-wrapper").removeClass("active");
        return this.caption.attr("disabled", "disabled");
      } else {
        this.$el.find(".caption-wrapper").addClass("active");
        return this.caption.removeAttr("disabled");
      }
    };

    ScreenView.prototype.getScreenOptions = function() {
      var screenOptions;
      screenOptions = {};
      if (this.context === "profile") {
        screenOptions.showActions = true;
        screenOptions.showLikeButton = true;
        screenOptions.showReuseButton = true;
        if (this.tab === "collections" || this.tab === "items") {
          screenOptions.showDeleteButton = true;
        }
      } else if (this.context === "newest" || this.context === "likes" || this.context === "topic" || this.context === "following" || this.context === "modified" || this.context === "commented" || this.context === "views" || this.context === "reuses") {
        screenOptions.showLikeButton = true;
        screenOptions.showReuseButton = true;
        screenOptions.showActions = true;
      } else if (this.context === "collections") {
        screenOptions.showActions = true;
        screenOptions.showReuseButton = true;
        screenOptions.showLikeButton = true;
        screenOptions.showFacebookShareButton = true;
        screenOptions.showDeleteButton = true;
        screenOptions.showScreenNavigation = true;
      }
      return screenOptions;
    };

    ScreenView.prototype.selected = function(event) {
      var origin;
      origin = $(event.target);
      if (origin.is("iframe")) {
        return false;
      }
      if (origin.is("input")) {
        return true;
      }
      if ((this.model.get("item").get("type") === "fact" && this.isEditing) || (this.model.get("item").get("type") === "fact" && this.context === "collections" && !origin.is("a"))) {
        return false;
      }
      if (origin.hasClass("caption-text")) {
        return false;
      }
      if (this.context === "collections" && this.model.get("item").get("type") === "fact" && origin.is("a")) {
        this.sourceWindow = window.open(origin.attr("href"));
        return false;
      } else if ((origin.hasClass("caption") || origin.hasClass("caption-text")) && this.isEditing) {
        return false;
      }
      if (this.context === "collections" && this.model.get("item").get("type") !== "collection" && this.model.get("item").get("type") !== "video" && this.model.get("item").get("type") !== "fact" && !this.isEditing) {
        this.clickedSource();
      } else if (this.context === "collections" && this.model.get("item").get("type") === "video" && (origin.is('svg') || origin.is('img')) && !this.isEditing) {
        this.clickedPlayVideo();
      } else {
        if (!this.isEditing) {
          this.trigger('selected', this.model);
        }
      }
      return false;
    };

    ScreenView.prototype.toggleMetaDataView = function() {
      return this.metaDataView = new global.myd.AssetMetaDataView({
        model: this.model.get("item"),
        container: this.$el.find(".below-asset")
      });
    };

    ScreenView.prototype.clickedMoreInfo = function(event) {
      var isShown, target;
      target = $(event.currentTarget);
      if (typeof this.metaDataView === "undefined" || this.metaDataView === null) {
        this.model.get("item").fetchMetaData();
      } else {
        isShown = this.metaDataView.toggle();
      }
      return false;
    };

    ScreenView.prototype.clickedReuse = function() {
      this.reuseItemView = new myd.ReuseItemView({
        model: this.model
      });
      return false;
    };

    ScreenView.prototype.clickedPlayVideo = function() {
      renderVideoEmbed(this.model, this.$el, 600);
      return false;
    };

    ScreenView.prototype.clickedFBShare = function() {
      var caption, collectionUID, description, frontMatterTitle, thumbnail, title, typeName, url;
      frontMatterTitle = this.model.collection.frontMatter.get("title") || ("" + (this.model.collection.frontMatter.get("owner").first_name) + " " + (this.model.collection.frontMatter.get("owner").last_name));
      typeName = myd.capFirstLetter(this.model.get('item').get("type"));
      if (this.model.get("item").get("type") === "feed") {
        typeName = "" + (this.model.get("item").get("title")) + " Feed";
      } else if (this.model.get("item").get("type") === "fact") {
        typeName = "Text";
      } else if (this.model.get("item").get("type") === "collection") {
        typeName = "" + (this.model.get("item").get("title")) + " Collage";
      }
      title = "" + typeName + " from " + frontMatterTitle;
      thumbnail = this.model.get("item").get("asset_url") || this.model.get("item").get("cover_asset").thumbnail_url;
      if (this.model.get("item").get("type") === "video" && (this.model.get("item").get("youtube_id") != null)) {
        thumbnail = myd.getVideoUrl(this.model.get("item").get("youtube_id"));
      }
      description = this.model.get("item").get("description") || this.$el.find(".screen-text").text().trim() || null;
      caption = this.model.get("caption") || null;
      collectionUID = this.model.collection.frontMatter.get("uid");
      url = "http://" + document.domain + "/papyrus/c/api/collections/" + collectionUID + "/screens/" + (this.model.get('uid'));
      if (this.model.get("item").get("type") === "fact" || this.model.get("item").get("type") === "feed") {
        thumbnail = this.model.collection.frontMatter.get("cover_asset") != null ? this.model.collection.frontMatter.get("cover_asset").thumbnail_url : "http://www.collagio.com/images/default_new_collection.png";
      }
      if (thumbnail.indexOf("//") === 0) {
        thumbnail = thumbnail.replace("//", "https://");
      }
      /*
          console.log "title - #{title}"
          console.log "thumbnail - #{thumbnail}"
          console.log "description - #{description}"
          console.log "caption - #{caption}"
          console.log "url - #{url}"
      */

      if (typeof FB !== "undefined" && FB !== null) {
        FB.ui({
          method: 'feed',
          message: '',
          name: title,
          caption: caption,
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

    ScreenView.prototype.clickedSource = function() {
      var sourceUrl;
      sourceUrl = this.model.get("item").get("source_page_url") != null ? this.model.get("item").get("source_page_url") : this.model.get("item").get("asset_url");
      if ((sourceUrl != null ? sourceUrl.indexOf("http://") : void 0) === 0 || (sourceUrl != null ? sourceUrl.indexOf("https://") : void 0) === 0) {
        this.sourceWindow = window.open(sourceUrl);
      }
      return false;
    };

    ScreenView.prototype.clickedDelete = function() {
      var _this = this;
      if (this.context === "collections") {
        this.trigger("delete", this.model);
        this.$el.hide("blind", 1000, function() {
          return _this.close();
        });
      } else if (this.context === "profile") {
        if (confirm("Are you sure you want to delete this? There is no undo.")) {
          this.model.trigger("deleteScreen", this.model);
        }
      }
      return false;
    };

    ScreenView.prototype.fetchComments = function() {
      if ((this.commentsCollection != null) && !this.commentsCollection.fetched) {
        return this.commentsCollection.fetch();
      }
    };

    ScreenView.prototype.activateScreen = function() {
      this.commenteAside.css("opacity", 1);
      if ((this.commentsCollection != null) && !this.commentsCollection.fetched) {
        return this.commentsCollection.fetch();
      }
    };

    ScreenView.prototype.deactivateScreen = function() {
      return this.commenteAside.css("opacity", 0.2);
    };

    ScreenView.prototype.startEditing = function() {
      var editor, factWrapper, formattedText,
        _this = this;
      this.isEditing = true;
      this.deleteIcon.show();
      this.reuseIcon.hide();
      this.shareIcon.hide();
      this.likeContainer.hide();
      if (this.model.get("item").get("editable")) {
        if ((this.model.get("item").get("type") === "image" || this.model.get("item").get("type") === "video") && (this.model.get("caption") != null) && this.model.get("caption").length === 0) {
          this.$el.find(".caption").html("<div class='caption-wrapper'><textarea class='caption-text' placeholder='Enter a caption'></textarea></div>");
          this.caption = this.$el.find(".caption-text");
        }
        if (this.model.get("item").get("type") === "fact") {
          factWrapper = this.$el.find('.fact-wrapper');
          if (!factWrapper.find('h2').length) {
            factWrapper.prepend("<h2 placeholder='Enter Headline'>" + (this.model.get('item').get('title')) + "</h2>");
          }
          this.headline = this.$el.find("h2").first();
          this.headline.attr("contenteditable", true);
          factWrapper = this.$el.find('.fact-wrapper');
          if (!this.factText.length) {
            factWrapper.append("<div class='screen-text'>" + (this.model.get('item').get('text')) + "</div>");
            this.factText = factWrapper.find('screen-text');
          }
          formattedText = markdown.toHTML(this.model.get('item').get('text') || "");
          this.factText.html("<textarea rows='4' cols='50' class='text-editor' id='fact-" + (this.model.get("item").get("uid")) + "'>" + formattedText + "</textarea>");
          editor = tinyMCE.get("fact-" + (this.model.get('item').get('uid')));
          window.setTimeout(function() {
            if (typeof editor === "undefined") {
              return myd.renderTextEditor("fact-" + (_this.model.get('item').get('uid')));
            } else {
              return editor.render();
            }
          }, 500);
        }
        this.enableCaptionField(true);
        return this.caption.keyup(function(e) {
          var _results;
          if ($(this).outerHeight() < 466) {
            _results = [];
            while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
              _results.push($(this).height($(this).height() + 1));
            }
            return _results;
          }
        });
      }
    };

    ScreenView.prototype.stopEditing = function() {
      var captionText, foo, _ref1;
      this.deleteIcon.hide();
      this.reuseIcon.show();
      this.shareIcon.show();
      this.likeContainer.show();
      this.headline.attr("contenteditable", false);
      captionText = this.caption.val();
      if (((captionText != null ? captionText.length : void 0) != null) === 0) {
        this.caption.remove();
      }
      this.enableCaptionField(false);
      this.saveModelChanges();
      if (this.factText.length && this.model.get("item").get("type") === "fact") {
        this.factText.attr("contenteditable", false);
        this.factText.html(markdown.toHTML(this.model.get('item').get('text')));
      }
      try {
        if ((_ref1 = tinyMCE.get("fact-" + (this.model.get('item').get('uid')))) != null) {
          _ref1.remove();
        }
      } catch (error) {
        foo = error;
      }
      return this.isEditing = false;
    };

    ScreenView.prototype.saveModelChanges = function() {
      var contentHTML, editor, markdownContent;
      if ((this.model.get("item").get("type") === "image" || this.model.get("item").get("type") === "video") && this.model.get("caption") !== this.caption.val()) {
        this.model.set("caption", this.caption.val(), {
          silent: true
        });
      }
      if (this.model.get("item").get("type") === "fact") {
        if (this.model.get("item").get("title") !== this.headline.text().trim()) {
          this.model.get("item").set("title", this.headline.text().trim(), {
            silent: true
          });
        }
        editor = tinyMCE.get("fact-" + (this.model.get('item').get('uid')));
        if (editor != null) {
          contentHTML = $("<div>").html(editor.getContent())[0];
          markdownContent = markdown.serialize(contentHTML);
          if (this.model.get("item").get("text") !== markdownContent) {
            return this.model.get("item").set("text", markdownContent, {
              silent: true
            });
          }
        }
      }
    };

    ScreenView.prototype.onClose = function() {
      var foo, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
        _this = this;
      try {
        if ((_ref1 = tinyMCE.get("fact-" + (this.model.get('item').get('uid')))) != null) {
          _ref1.remove();
        }
      } catch (error) {
        foo = error;
      }
      this.model.get("item").unbind("change:metaData", this.toggleMetaDataView, this);
      this.unbind("finishEdit", function() {
        var _ref2;
        return (_ref2 = _this.addBarView) != null ? _ref2.trigger("finishEdit") : void 0;
      });
      this.unbind("cancelEdit", function() {
        var _ref2;
        return (_ref2 = _this.addBarView) != null ? _ref2.trigger("cancelEdit") : void 0;
      });
      if (this.addBarView != null) {
        this.addBarView.unbind("addNewItem", function(item) {
          return _this.trigger("addNewItem", item);
        });
        this.addBarView.unbind("addItem", function(item) {
          return _this.trigger("addItem", item);
        });
        this.addBarView.close();
      }
      if ((_ref2 = this.assetRSSView) != null) {
        _ref2.close();
      }
      if ((_ref3 = this.reuseItemView) != null) {
        _ref3.close();
      }
      if ((_ref4 = this.metaDataView) != null) {
        _ref4.close();
      }
      if ((_ref5 = this.likeButtonView) != null) {
        _ref5.close();
      }
      if ((_ref6 = this.leaveCommentView) != null) {
        _ref6.close();
      }
      if ((_ref7 = this.screenCommentsListView) != null) {
        _ref7.close();
      }
      return (_ref8 = this.screenNavView) != null ? _ref8.close() : void 0;
    };

    return ScreenView;

  })(Backbone.View);

  global.myd.ScreenView = ScreenView;

}).call(this);
