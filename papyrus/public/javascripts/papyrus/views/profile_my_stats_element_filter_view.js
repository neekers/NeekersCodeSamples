(function() {
  var ProfileMyStatsElementFilterView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ProfileMyStatsElementFilterView = (function(_super) {

    __extends(ProfileMyStatsElementFilterView, _super);

    function ProfileMyStatsElementFilterView() {
      return ProfileMyStatsElementFilterView.__super__.constructor.apply(this, arguments);
    }

    ProfileMyStatsElementFilterView.prototype.collection = myd.GridCollection;

    ProfileMyStatsElementFilterView.prototype.bindToCollection = {
      "reset": "render"
    };

    ProfileMyStatsElementFilterView.prototype.events = {
      'click .element-view-options .selected-element-filter': 'clickedElementFilterDropdown',
      'click .element-view-options .options li': 'clickedElementFilterDropdownItem'
    };

    ProfileMyStatsElementFilterView.prototype.initialize = function(params) {
      this.lastElementFilterOption = null;
      this.user = params.user;
      this.containerEl = params.container;
      this.collection = new myd.GridCollection();
      this.screenViews = [];
      params.context = "profile";
      params.tab = "my_stats";
      this.navigationView = params.navigationView;
      this.params = params;
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
      return this.requestDefaultFilter();
    };

    ProfileMyStatsElementFilterView.prototype.requestDefaultFilter = function() {
      return this.fetchByFilter("views");
    };

    ProfileMyStatsElementFilterView.prototype.clickedElementFilterDropdown = function() {
      var elementViewOptions;
      elementViewOptions = this.$el.find(".element-view-options");
      elementViewOptions.toggleClass('open');
      return elementViewOptions.find('.options').toggle('blind', 150);
    };

    ProfileMyStatsElementFilterView.prototype.clickedElementFilterDropdownItem = function(event) {
      var elementViewOptions, filter, target;
      target = $(event.target);
      filter = target.attr('filter');
      elementViewOptions = this.$el.find(".element-view-options");
      elementViewOptions.find('.selected-element-filter').text(target.text()).attr('filter', filter);
      this.clickedElementFilterDropdown();
      return this.fetchByFilter(filter);
    };

    ProfileMyStatsElementFilterView.prototype.fetchByFilter = function(filter) {
      var filterUrl;
      filterUrl = {
        "views": this.user.get('top_assets_by_views'),
        "likes": this.user.get('top_assets_by_likes'),
        "comments": this.user.get('top_assets_by_comments'),
        "reuses": this.user.get('top_assets_by_reuses')
      }[filter];
      return this.collection.fetchByUrl(filterUrl);
    };

    ProfileMyStatsElementFilterView.prototype.render = function() {
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
      if (this.containerEl.find('#element-filter-container').length < 1) {
        this.containerEl.append(Mustache.render($("#profile_my_stats_element_filter_template").html()));
      }
      this.setElement($("#element-filter-container"));
      this.elementList = this.$el.find(".element-list");
      this.elementList.empty();
      screens = [];
      screens = this.collection.models;
      rendered_view_html = screens.map(function(tile) {
        var view;
        view = _this.tileViewCreator(tile);
        view.model.set("showActions");
        view.render(_this.streamView);
        return view.el;
      });
      this.elementList.append(rendered_view_html);
      this.$el.find(".element-list li").addClass("screen subFeatured my-stats-element");
      this.checkScreenSize();
      new global.myd.ImageCenter(this.$el.find('.asset'));
      return this.collageFollowingView = new myd.ProfileFollowingView(this.params);
    };

    ProfileMyStatsElementFilterView.prototype.checkScreenSize = function() {
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

    ProfileMyStatsElementFilterView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    ProfileMyStatsElementFilterView.prototype.selectedScreen = function(args) {
      return myd.common.selectedScreen(args);
    };

    ProfileMyStatsElementFilterView.prototype.onClose = function() {
      return _.each(this.screenViews, function(screen) {
        screen.unbind("selected", this.selectedScreen, this);
        return screen.close();
      });
    };

    return ProfileMyStatsElementFilterView;

  })(Backbone.View);

  global.myd.ProfileMyStatsElementFilterView = ProfileMyStatsElementFilterView;

}).call(this);
