(function() {
  var CollageHeaderView, routesModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  routesModule = myd.routesModule;

  CollageHeaderView = (function(_super) {

    __extends(CollageHeaderView, _super);

    function CollageHeaderView() {
      return CollageHeaderView.__super__.constructor.apply(this, arguments);
    }

    CollageHeaderView.prototype.tagName = "div";

    CollageHeaderView.prototype.className = "front-matter";

    CollageHeaderView.prototype.model = myd.FrontMatterTileModel;

    CollageHeaderView.prototype.events = {
      'click .author-url': 'clickedUserLink',
      'click .topic': 'clickedTopic',
      'click #edit-background': 'clickedEditBackground',
      'click .collection-reuse': 'clickedReuse'
    };

    CollageHeaderView.prototype.clickedTopicsButton = function() {
      return Router.navigateToTopicsTab();
    };

    CollageHeaderView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection = params.collection;
      this.isEditing = params.isEditing;
      this.currentUserModel = params.currentUserModel;
      this.model.bind("change:collected", this.refreshLike, this);
      this.model.bind("change:screens_count", this.refreshElementsCount, this);
      this.model.bind("change:cover_asset", this.refreshCover, this);
      this.model.bind("change:view_count", this.refreshViewCount, this);
      this.render();
      return this;
    };

    CollageHeaderView.prototype.render = function() {
      var creationDate, currentDate, renderedContent, template, templateObject, total_comment_count, updatedDate, view_count;
      if (this.options.type === "mystream") {
        return;
      }
      template = $("#front_matter_template_" + this.options.type).html();
      if (!template) {
        return;
      }
      templateObject = this.model.toJSON();
      total_comment_count = (templateObject.total_comment_count != null) > 0 ? templateObject.total_comment_count : "0";
      templateObject.total_comment_count = total_comment_count > 999 ? total_comment_count + "k" : total_comment_count;
      templateObject.comment_label = total_comment_count !== 1 ? "Comments" : "Comment";
      view_count = (templateObject.view_count != null) > 0 ? templateObject.view_count : "0";
      templateObject.view_count = view_count > 999 ? view_count + "k" : view_count;
      templateObject.view_label = view_count !== 1 ? "Views" : "View";
      currentDate = new Date();
      creationDate = new Date();
      updatedDate = new Date();
      creationDate.setTime(templateObject.created_timestamp * 1000);
      updatedDate.setTime(templateObject.modified_timestamp * 1000);
      templateObject.createdAgo = global.myd.timeDifference(currentDate, creationDate);
      templateObject.updatedAgo = global.myd.timeDifference(currentDate, updatedDate);
      switch (this.options.type) {
        case 'search':
          templateObject = myd.pluralizeIfNeeded(templateObject, 'result_quantity', 'Element');
          break;
        case 'collection':
          templateObject = myd.pluralizeIfNeeded(templateObject, 'screens_count', 'Item');
          break;
        case 'newest':
          templateObject = myd.pluralizeIfNeeded(templateObject, 'screen_count', 'Collection');
          break;
        case 'profile':
          templateObject.currentUser = this.currentUserModel.toJSON();
          templateObject.currentUser = myd.pluralizeIfNeeded(templateObject.currentUser, 'collection_count', "Collage");
          templateObject = myd.pluralizeIfNeeded(templateObject, 'screens_count', "Collage");
      }
      templateObject = myd.pluralizeIfNeeded(templateObject, 'collected_count', 'Time');
      if ((templateObject.cover_asset != null) && templateObject.cover_asset.type === "video" && (templateObject.cover_asset.youtube_id != null)) {
        templateObject.cover_asset.asset_url = "http://img.youtube.com/vi/" + templateObject.cover_asset.youtube_id + "/0.jpg";
      }
      if (templateObject.cover_asset === null) {
        templateObject.cover_asset = {};
        templateObject.cover_asset.asset_url = "/images/default_new_collection.png";
      }
      if (myd.feature.testing && (templateObject.cover_asset != null)) {
        templateObject.cover_asset.asset_url = "/images/default_new_collection.png";
      }
      renderedContent = Mustache.render(template, templateObject);
      this.containerEl.prepend(renderedContent);
      this.setElement($("#collage-header .header-content"));
      this.likeButtonView = new myd.LikeButtonView({
        model: this.collection.frontMatter,
        el: this.$el.find(".like-container")
      });
      this.itemCount = this.$el.find(".item-count");
      this.viewCount = this.$el.find(".collage-header-view-count");
      this.viewCountLabel = this.$el.find(".collage-header-view-label");
      if (this.options.type === 'collection') {
        this.blurHeader();
      }
      if (this.isEditing) {
        this.startEditMode();
      }
      this.refreshFollowingUser();
      return this;
    };

    CollageHeaderView.prototype.refreshFollowingUser = function() {
      var current_user_path, following_el, userid, _ref1, _ref2;
      following_el = $(".follow-user");
      current_user_path = myd.urls.current_user;
      userid = current_user_path.substring(current_user_path.lastIndexOf("/") + 1, current_user_path.length);
      if (window.location.pathname.indexOf(userid) > 0) {
        return following_el.hide();
      } else {
        if (((_ref1 = this.collection.collection) != null ? _ref1.owner.collected : void 0) === true || ((_ref2 = this.currentUser) != null ? _ref2.get("collected") : void 0)) {
          following_el.find(".text").html("FOLLOWING USER");
          return following_el.addClass("followed-user-btn").removeClass("following-user-btn");
        } else {
          following_el.find(".text").html("FOLLOW USER");
          return following_el.removeClass("followed-user-btn").addClass("following-user-btn");
        }
      }
    };

    CollageHeaderView.prototype.refreshElementsCount = function() {
      return this.itemCount.html(this.model.get("screens_count") + " " + myd.pluralizeIfNeededText(this.model.get("screens_count"), "Element"));
    };

    CollageHeaderView.prototype.refreshViewCount = function() {
      var view_count, view_count_label;
      view_count = this.model.get("view_count");
      view_count = view_count > 999 ? view_count + "k" : view_count;
      this.viewCount.text(view_count);
      view_count = this.model.get("view_count");
      view_count_label = view_count !== 1 ? "Views" : "View";
      return this.viewCountLabel.text(view_count_label);
    };

    CollageHeaderView.prototype.refreshCover = function() {
      if (this.model.get("cover_asset").type === "video" && (this.model.get("cover_asset").youtube_id != null)) {
        this.model.get('cover_asset').asset_url = myd.getVideoUrl(this.model.get("cover_asset").youtube_id);
      }
      $("#collage-header").css("background-image", "url(" + (this.model.get('cover_asset').asset_url) + ")");
      return this.blurHeader();
    };

    CollageHeaderView.prototype.blurHeader = function() {
      var image, img, _ref1,
        _this = this;
      $("#collage-header").find('canvas').remove();
      $(".page-header").find('canvas').remove();
      image = (_ref1 = this.model.get('cover_asset')) != null ? _ref1.asset_url : void 0;
      if (!image) {
        return;
      }
      img = new Image();
      img.onload = function() {
        Pixastic.process(img, "blurfast", {
          amount: .4
        }, function(el) {
          var height, maxHeight, maxWidth, newHeight, newWidth, offsetX, offsetY, ratio, width;
          $("#collage-header").prepend(el);
          _this.blurredBackground = $(el);
          height = _this.blurredBackground.height();
          width = _this.blurredBackground.width();
          maxHeight = $("#collage-header").height() + $(".head-wrap").height();
          maxWidth = $(window).width();
          ratio = 1;
          if (width / height >= maxWidth / maxHeight) {
            ratio = maxHeight / height;
            newHeight = maxHeight;
            newWidth = width * ratio;
            offsetX = -1 * Math.abs((width - maxWidth) / 2);
            offsetY = 0;
          } else {
            ratio = maxWidth / width;
            newWidth = maxWidth;
            newHeight = height * ratio;
            offsetX = 0;
            offsetY = -1 * Math.abs((height - maxHeight) / 2);
          }
          _this.blurredBackground.css({
            display: 'block',
            position: 'fixed',
            width: newWidth,
            height: newHeight,
            top: offsetY,
            left: offsetX
          });
          _this.resizeBackground();
          return $(window).bind('resize', _.throttle($.proxy(_this.resizeBackground, _this), 20));
        });
        return Pixastic.process(img, "blurfast", {
          amount: .4
        }, function(el) {
          var height, maxHeight, maxWidth, newHeight, newWidth, offsetX, offsetY, ratio, width;
          $(".page-header .canvas-wrap").prepend(el);
          _this.blurredBackgroundNavBar = $(el);
          height = _this.blurredBackgroundNavBar.height();
          width = _this.blurredBackgroundNavBar.width();
          maxHeight = $("#collage-header").height() + $(".head-wrap").height();
          maxWidth = $(window).width();
          ratio = 1;
          if (width / height >= maxWidth / maxHeight) {
            ratio = maxHeight / height;
            newHeight = maxHeight;
            newWidth = width * ratio;
            offsetX = -1 * Math.abs((width - maxWidth) / 2);
            offsetY = 0;
          } else {
            ratio = maxWidth / width;
            newWidth = maxWidth;
            newHeight = height * ratio;
            offsetX = 0;
            offsetY = -1 * Math.abs((height - maxHeight) / 2);
          }
          _this.blurredBackgroundNavBar.css({
            display: 'block',
            position: 'absolute',
            width: newWidth,
            height: newHeight,
            top: offsetY,
            left: offsetX
          });
          _this.resizeBackgroundNav();
          return $(window).bind('resize', _.throttle($.proxy(_this.resizeBackgroundNav, _this), 20));
        });
      };
      document.body.appendChild(img);
      return img.src = image;
    };

    CollageHeaderView.prototype.resizeBackground = function() {
      var height, maxHeight, maxWidth, newHeight, newWidth, offsetX, offsetY, ratio, width;
      height = this.blurredBackground.height();
      width = this.blurredBackground.width();
      maxHeight = $("#collage-header").height() + $(".head-wrap").height();
      maxWidth = $(window).width();
      ratio = 1;
      if (width / height >= maxWidth / maxHeight) {
        ratio = maxHeight / height;
        newHeight = maxHeight;
        newWidth = width * ratio;
        offsetX = -1 * Math.abs((width - maxWidth) / 2);
        offsetY = 0;
      } else {
        ratio = maxWidth / width;
        newWidth = maxWidth;
        newHeight = height * ratio;
        offsetX = 0;
        offsetY = -1 * Math.abs((height - maxHeight) / 2);
      }
      return this.blurredBackground.css({
        width: newWidth,
        height: newHeight,
        top: offsetY,
        left: offsetX
      });
    };

    CollageHeaderView.prototype.resizeBackgroundNav = function() {
      var height, maxHeight, maxWidth, newHeight, newWidth, offsetX, offsetY, ratio, width;
      height = this.blurredBackgroundNavBar.height();
      width = this.blurredBackgroundNavBar.width();
      maxHeight = $("#collage-header").height() + $(".head-wrap").height();
      maxWidth = $(window).width();
      ratio = 1;
      if (width / height >= maxWidth / maxHeight) {
        ratio = maxHeight / height;
        newHeight = maxHeight;
        newWidth = width * ratio;
        offsetX = -1 * Math.abs((width - maxWidth) / 2);
        offsetY = 0;
      } else {
        ratio = maxWidth / width;
        newWidth = maxWidth;
        newHeight = height * ratio;
        offsetX = 0;
        offsetY = -1 * Math.abs((height - maxHeight) / 2);
      }
      return this.blurredBackgroundNavBar.css({
        width: newWidth,
        height: newHeight,
        top: offsetY,
        left: offsetX
      });
    };

    CollageHeaderView.prototype.clickedUserLink = function() {
      if (this.isEditing) {
        return false;
      }
      Router.navigateToProfileTab({
        userPath: new global.myd.Uri(this.model.get('owner').entity_url).getPathname(),
        tab: 'collections'
      });
      return false;
    };

    CollageHeaderView.prototype.clickedTopic = function() {
      var uid;
      if (this.isEditing) {
        return false;
      }
      uid = this.model.get("topic_url").substring(this.model.get("topic_url").lastIndexOf("/") + 1);
      Router.navigate("/topic/" + uid, {
        trigger: true
      });
      return false;
    };

    CollageHeaderView.prototype.clickedEditBackground = function() {
      this.trigger("editBackground");
      return false;
    };

    CollageHeaderView.prototype.clickedReuse = function() {
      this.reuseItemView = new myd.ReuseItemView({
        model: this.collection
      });
      return false;
    };

    CollageHeaderView.prototype.startEditMode = function() {
      this.isEditing = true;
      this.$el.find("#edit-collection").hide();
      this.$el.find("#edit-background").show();
      $(".logo").hide();
      this.$el.find("h1, .description").attr("contenteditable", true);
      return myd.Placeholder().refresh(this.$el);
    };

    CollageHeaderView.prototype.leaveEditMode = function() {
      this.isEditing = false;
      this.$el.find("#edit-collection").show();
      this.$el.find("#edit-background").hide();
      return $(".logo").show();
    };

    CollageHeaderView.prototype.onClose = function() {
      var _ref1, _ref2, _ref3;
      $(window).unbind('resize.background');
      if ((_ref1 = this.blurredBackground) != null) {
        _ref1.remove();
      }
      if ((_ref2 = this.blurredBackgroundNavBar) != null) {
        _ref2.remove();
      }
      return (_ref3 = this.likeButtonView) != null ? _ref3.close() : void 0;
    };

    return CollageHeaderView;

  })(Backbone.View);

  global.myd.CollageHeaderView = CollageHeaderView;

}).call(this);
