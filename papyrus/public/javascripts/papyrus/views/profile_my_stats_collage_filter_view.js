(function() {
  var ProfileMyStatsCollageFilterView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ProfileMyStatsCollageFilterView = (function(_super) {

    __extends(ProfileMyStatsCollageFilterView, _super);

    function ProfileMyStatsCollageFilterView() {
      return ProfileMyStatsCollageFilterView.__super__.constructor.apply(this, arguments);
    }

    ProfileMyStatsCollageFilterView.prototype.collection = myd.GridCollection;

    ProfileMyStatsCollageFilterView.prototype.bindToCollection = {
      "reset": "render"
    };

    ProfileMyStatsCollageFilterView.prototype.events = {
      'click .collage-view-options .selected-collage-filter': 'clickedCollageFilterDropdown',
      'click .collage-view-options .options li': 'clickedCollageFilterDropdownItem'
    };

    ProfileMyStatsCollageFilterView.prototype.initialize = function(params) {
      this.lastCollageFilterOption = null;
      this.user = params.user;
      this.containerEl = params.container;
      this.collection = new myd.GridCollection();
      this.screenViews = [];
      this.tileViewCreator = params.tileViewCreator;
      params.context = "profile";
      params.tab = "my_stats";
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
      this.requestDefaultFilter();
      return new global.myd.ImageCenter(this.$el.find('.asset'));
    };

    ProfileMyStatsCollageFilterView.prototype.requestDefaultFilter = function() {
      return this.fetchByFilter("views");
    };

    ProfileMyStatsCollageFilterView.prototype.clickedCollageFilterDropdown = function() {
      var collageViewOptions;
      collageViewOptions = this.$el.find(".collage-view-options");
      collageViewOptions.toggleClass('open');
      return collageViewOptions.find('.options').toggle('blind', 150);
    };

    ProfileMyStatsCollageFilterView.prototype.clickedCollageFilterDropdownItem = function(event) {
      var collageViewOptions, filter, target;
      target = $(event.target);
      filter = target.attr('filter');
      collageViewOptions = this.$el.find(".collage-view-options");
      collageViewOptions.find('.selected-collage-filter').text(target.text()).attr('filter', filter);
      this.clickedCollageFilterDropdown();
      return this.fetchByFilter(filter);
    };

    ProfileMyStatsCollageFilterView.prototype.fetchByFilter = function(filter) {
      var filterUrl;
      filterUrl = {
        "views": this.user.get('top_collages_by_views'),
        "likes": this.user.get('top_collages_by_likes'),
        "comments": this.user.get('top_collages_by_comments'),
        "reuses": this.user.get('top_collages_by_reuses')
      }[filter];
      return this.collection.fetchByUrl(filterUrl);
    };

    ProfileMyStatsCollageFilterView.prototype.render = function() {
      var rendered_view_html, screens,
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
            likes: "Like"
          }[this.tab]
        });
        this.$el.append(this.frontMatterView.el);
        this.frontMatterView.bind("refresh", function() {
          return _this.collection.fetch();
        });
        $('#profile-header').append(this.navigationView.el);
        this.navigationView.delegateEvents();
      }
      if (this.containerEl.find('#collage-filter-container').length < 1) {
        this.containerEl.prepend(Mustache.render($("#profile_my_stats_collage_filter_template").html()));
      }
      this.setElement($("#collage-filter-container"));
      this.collageList = this.$el.find(".collage-list");
      this.collageList.empty();
      screens = [];
      screens = this.collection.models;
      rendered_view_html = screens.map(function(tile) {
        var view;
        view = _this.tileViewCreator(tile);
        view.model.set("showActions");
        view.render(_this.streamView);
        return view.el;
      });
      this.collageList.append(rendered_view_html);
      this.$el.find(".collage-list li").addClass("screen subFeatured my-stats-collage");
      this.checkScreenSize();
      return new global.myd.ImageCenter(this.$el.find('.asset'));
    };

    ProfileMyStatsCollageFilterView.prototype.checkScreenSize = function() {
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

    ProfileMyStatsCollageFilterView.prototype.selectedScreen = function(args) {
      return myd.common.selectedScreen(args);
    };

    ProfileMyStatsCollageFilterView.prototype.onClose = function() {
      return _.each(this.screenViews, function(screen) {
        screen.unbind("selected", this.selectedScreen, this);
        return screen.close();
      });
    };

    return ProfileMyStatsCollageFilterView;

  })(Backbone.View);

  global.myd.ProfileMyStatsCollageFilterView = ProfileMyStatsCollageFilterView;

}).call(this);
