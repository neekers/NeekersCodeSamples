(function() {
  var HeaderView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  HeaderView = (function(_super) {

    __extends(HeaderView, _super);

    function HeaderView() {
      return HeaderView.__super__.constructor.apply(this, arguments);
    }

    HeaderView.prototype.el = 'header.pageHeader';

    HeaderView.prototype.events = function() {
      return {
        'click .my-profile': 'clickedMyProfile',
        'click .view-my-collages': 'clickedViewMyProfileCollages',
        'click .view-my-stats': 'clickedViewMyProfileStats',
        'click .view-my-bookmarks': 'clickedViewMyProfileLikes',
        'click .view-my-liked-topics': 'clickedViewMyProfileLikedTopics',
        'click .view-my-items': 'clickedViewMyProfileItems',
        'click .view-bookmarklet': 'clickedViewBookmarklet',
        'click .create-btn': 'clickedCreate'
      };
    };

    HeaderView.prototype.initialize = function(appView) {
      this.appView = appView;
      return this.render();
    };

    HeaderView.prototype.render = function() {
      $("body").prepend(Mustache.render($("#header_template").html(), {
        current_user_image_url: global.myd.current_user_image_url,
        first_name: global.myd.current_user_fname,
        last_name: global.myd.current_user_lname
      }));
      this.setElement($(".page-header"));
      this.myProfile = this.$el.find(".login-container");
      return this.myProfile.hover(function() {
        return $(this).addClass('open');
      }, function() {
        return $(this).removeClass('open');
      });
    };

    HeaderView.prototype.clickedMyProfile = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('my_stats');
      return false;
    };

    HeaderView.prototype.clickedViewMyProfileCollages = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('collections');
      return false;
    };

    HeaderView.prototype.clickedViewMyProfileStats = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('my_stats');
      return false;
    };

    HeaderView.prototype.clickedViewMyProfileLikes = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('likes');
      return false;
    };

    HeaderView.prototype.clickedViewMyProfileLikedTopics = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('topics');
      return false;
    };

    HeaderView.prototype.clickedViewMyProfileItems = function() {
      this.myProfile.removeClass("open");
      Router.navigateToProfileTabForCurrentUser('items');
      return false;
    };

    HeaderView.prototype.clickedViewBookmarklet = function() {
      this.myProfile.removeClass("open");
      Router.navigate("bookmarklet", {
        trigger: true
      });
      return false;
    };

    HeaderView.prototype.clickedCreate = function() {
      var _this = this;
      this.overlayView = new myd.OverlayView();
      this.add_collection_view = new myd.AddCollectionTileView({
        model: new myd.AddCollectionTileModel({
          topics: myd.topics
        }),
        getForm: function() {
          return $('.add-collection-form');
        },
        getFormWrapper: function() {
          return $('.add-collection-form-wrapper');
        },
        overlay: this.overlayView,
        serviceModule: myd.serviceModule,
        createCollectionUrl: myd.urls.create_collection
      });
      this.add_collection_view.bind("refresh", function() {
        return _this.trigger("refresh");
      });
      this.add_collection_view.render();
      this.overlayView.$el.append(this.add_collection_view.$el);
      return false;
    };

    HeaderView.prototype.onClose = function() {
      return this.overlayView.close();
    };

    return HeaderView;

  })(Backbone.View);

  global.myd.HeaderView = HeaderView;

}).call(this);
