(function() {
  var ProfileFollowingView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ProfileFollowingView = (function(_super) {

    __extends(ProfileFollowingView, _super);

    function ProfileFollowingView() {
      return ProfileFollowingView.__super__.constructor.apply(this, arguments);
    }

    ProfileFollowingView.prototype.collection = myd.GridCollection;

    ProfileFollowingView.prototype.bindToCollection = {
      "reset": "render"
    };

    ProfileFollowingView.prototype.initialize = function(params) {
      var follow;
      this.lastElementFilterOption = null;
      this.user = params.user;
      this.containerEl = params.container;
      this.collection = new myd.GridCollection();
      this.screenViews = [];
      params.context = "profile";
      this.params = params;
      this.navigationView = params.navigationView;
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
      follow = false;
      if ((params.followed != null)) {
        follow = true;
      }
      return this.requestDefaultFilter(follow);
    };

    ProfileFollowingView.prototype.requestDefaultFilter = function(follow) {
      return this.fetchByFilter("views", follow);
    };

    ProfileFollowingView.prototype.fetchByFilter = function(filter, follow) {
      var filterUrl, url;
      url = follow ? this.user.get('followed_users') : this.user.get('users_following_me');
      filterUrl = {
        "views": url
      }[filter];
      this.collection.fetchByUrl(filterUrl);
      return $(".following-list").empty();
    };

    ProfileFollowingView.prototype.render = function() {
      var NumFollowingYou, following_count, following_people_text, rendered_view_html, screens,
        _this = this;
      $("#page-title").text("Collagio Profile My Stats - " + (this.collection.frontMatter.get("owner").first_name) + " " + (this.collection.frontMatter.get("owner").last_name));
      document.title = "" + ($('#page-title').text());
      if ($('#profile-header').length < 1) {
        this.frontMatterView = new global.myd.CollageHeaderView({
          container: $('#my-profile'),
          model: this.collection.frontMatter,
          collection: this.collection,
          currentUserModel: this.user,
          type: "profile",
          collection_count_text: {
            topics: "Topic",
            items: "Item",
            collections: "Collection",
            likes: ""
          }[this.params.tab]
        });
        this.$el.append(this.frontMatterView.el);
        this.frontMatterView.bind("refresh", function() {
          return _this.collection.fetch();
        });
        $('#profile-header').append(this.navigationView.el);
        this.navigationView.delegateEvents();
      }
      if (this.containerEl.find('#people-following-container').length < 1 && this.params.tab === "my_stats") {
        if (this.collection.models.length !== 1) {
          NumFollowingYou = this.collection.models.length + " People Follow Me";
        } else {
          NumFollowingYou = this.collection.models.length + " Person Follows Me";
        }
        this.containerEl.append(Mustache.render($("#profile_following_template").html(), {
          NumFollowingYou: NumFollowingYou
        }));
      }
      this.setElement($(".profile-content"));
      this.elementList = this.$el.find(".following-list");
      screens = [];
      screens = this.collection.models;
      rendered_view_html = screens.map(function(tile) {
        var imgUrl, item, view;
        item = tile.get('item');
        imgUrl = item.get("image_url");
        if (!imgUrl.indexOf("twitter.com") > 0) {
          imgUrl = imgUrl + "?type=large";
        }
        item.set("image_url", imgUrl);
        tile.set('item', item);
        view = _this.tileViewCreator(tile);
        view.render(_this.streamView);
        return view.el;
      });
      this.elementList.append(rendered_view_html);
      following_people_text = this.collection.collection.screens_count !== 1 ? " People" : " Person";
      following_count = "Following " + this.collection.collection.screens_count + following_people_text;
      $(".following-count").html(following_count);
      $(".following-list .like-container").hide();
      this.checkScreenSize();
      return new global.myd.ImageCenter(this.$el.find('.asset'));
    };

    ProfileFollowingView.prototype.checkScreenSize = function() {
      new mediaQuery({
        media: 'screen and (max-width: 639px)',
        entry: function() {
          var current, screen, screensList, _i, _len, _results;
          $('.element-list .screen').removeClass('featured subFeatured item');
          $('.element-list .screen').addClass('subFeatured');
          screensList = $('.element-list .screen');
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
          $('.element-list .screen').removeClass('featured subFeatured');
          $('.element-list .screen').addClass('item');
          screensList = $('.element-list .screen');
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
          $('.element-list .screen').removeClass('featured subFeatured');
          $('.element-list .screen').addClass('item');
          screensList = $('.element-list .screen');
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
          $('.element-list .screen').removeClass('featured subFeatured');
          $('.element-list .screen').addClass('item');
          screensList = $('.element-list .screen');
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
          $('.element-list .screen').removeClass('featured  item');
          $('.element-list .screen').addClass('subFeatured');
          screensList = $('.element-list .screen');
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

    ProfileFollowingView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    ProfileFollowingView.prototype.selectedScreen = function(args) {
      return myd.common.selectedScreen(args);
    };

    ProfileFollowingView.prototype.onClose = function() {
      return _.each(this.screenViews, function(screen) {
        screen.unbind("selected", this.selectedScreen, this);
        return screen.close();
      });
    };

    return ProfileFollowingView;

  })(Backbone.View);

  global.myd.ProfileFollowingView = ProfileFollowingView;

}).call(this);
