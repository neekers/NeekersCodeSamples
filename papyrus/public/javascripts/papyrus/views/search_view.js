(function() {
  var SearchBaseView, SearchView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  SearchBaseView = (function(_super) {

    __extends(SearchBaseView, _super);

    function SearchBaseView() {
      return SearchBaseView.__super__.constructor.apply(this, arguments);
    }

    SearchBaseView.prototype.collection = myd.GridCollection;

    SearchBaseView.prototype.showFrontMatter = true;

    SearchBaseView.prototype.bindToCollection = {
      'errorReset': "renderError",
      'reset': "reset"
    };

    SearchBaseView.prototype.initialize = function(params) {
      this.context = params.context;
      this.inline = params.inline;
      this.clearHistory = params.clearHistory || false;
      this.filter = params.filter;
      this.appView = params.appView;
      this.screenViews = [];
      this.tileViewCreator = params.tileViewCreator || function(tileModel) {
        var assetView, entity_url;
        entity_url = tileModel.get("entity_url");
        assetView = new myd.ScreenView({
          model: tileModel,
          context: params.context,
          inline: params.inline,
          tab: params.tab
        });
        assetView.bind('selected', this.selectedAsset, this);
        this.screenViews.push(assetView);
        return assetView;
      };
      this.collection = params.collection;
      return this.collection.filter = this.filter;
    };

    SearchBaseView.prototype.reset = function(event) {
      var _this = this;
      this.$el.find("ol").empty();
      if (this.showFrontMatter && this.frontMatterView !== null) {
        this.frontMatterView.unbind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.close();
      }
      return this.render();
    };

    SearchBaseView.prototype.render = function() {
      var _this = this;
      if (this.showFrontMatter) {
        this.frontMatterView = new global.myd.CollageHeaderView({
          container: this.$el,
          model: this.collection.frontMatter,
          collection: this.collection,
          isEditing: false,
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
      }
      $(".page-header").removeClass("collection");
      this.renderCollectionTiles();
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
      return this.$el.show();
    };

    SearchBaseView.prototype.renderCollectionTiles = function() {
      var rendered_view_html,
        _this = this;
      rendered_view_html = this.collection.map(function(tile) {
        var view;
        view = _this.tileViewCreator(tile);
        view.render(_this.streamView);
        return view.el;
      });
      if (this.$el.find('article').length) {
        return this.$el.find('article').html(rendered_view_html);
      } else {
        return this.$el.find('ol').html(rendered_view_html);
      }
    };

    SearchBaseView.prototype.display = function() {
      this.$el.show();
      return this.collection.fetch();
    };

    SearchBaseView.prototype.selectedAsset = function(screen) {
      return myd.common.selectedScreen(screen);
    };

    SearchBaseView.prototype.renderError = function() {
      return this.$el.html("There was an error processing your request.");
    };

    SearchBaseView.prototype.onClose = function() {
      var _this = this;
      _.each(this.screenViews, function(screenView) {
        screenView.unbind('selected', this.selectedAsset, this);
        screenView.unbind('addItem', this.callAddItem, this);
        screenView.unbind('addNewItem', this.callAddNewItem, this);
        screenView.unbind('delete', this.deleteScreen, this);
        return screenView.close();
      });
      if (this.reuseItemView != null) {
        this.reuseItemView.close();
      }
      if (this.frontMatterView != null) {
        this.frontMatterView.unbind("refresh", function() {
          return _this.collection.fetch();
        });
        this.frontMatterView.unbind("editBackground", this.launchEditBackground, this);
        this.frontMatterView.close();
      }
      if (this.itemLightboxView != null) {
        return this.itemLightboxView.close();
      }
    };

    return SearchBaseView;

  })(Backbone.View);

  /*
  
    SUBCLASSES
  */


  SearchView = (function(_super) {

    __extends(SearchView, _super);

    function SearchView() {
      return SearchView.__super__.constructor.apply(this, arguments);
    }

    SearchView.prototype.el = "#search";

    SearchView.prototype.searchViews = [];

    SearchView.prototype.initialize = function(params) {
      $("#content").html('<div id="search" class="body"><div class="searchResults"></div></div>');
      this.setElement($("#search"));
      this.context = params.context = "search";
      this.inline = params.inline = false;
      this.searchTerm = params.searchTerm || "";
      this.exploreNavigationView = new global.myd.ExploreNavigationView({
        context: this.context,
        container: this.$el,
        model: this.collection.frontMatter,
        collection: this.collection,
        searchTerm: this.searchTerm
      });
      this.exploreNavigationView.searchInput.bind("keyup", _.debounce($.proxy(this.doSearch, this), 250));
      this.exploreNavigationView.searchInput.focus();
      return SearchView.__super__.initialize.call(this, params);
    };

    SearchView.prototype.render = function() {
      $("#page-title").text("Search for '" + this.searchTerm);
      document.title = "" + ($('#page-title').text()) + " - Collagio";
      $(".page-header").removeClass("collection");
      this.renderPeopleResults();
      return this.renderCollectionResults();
    };

    SearchView.prototype.display = function() {
      if (this.searchTerm.length) {
        return this.collection.fetchInternalSearchResults(this.searchTerm);
      }
    };

    SearchView.prototype.reset = function(params) {
      this.$el.find(".searchResults").empty();
      if (this.collection.models.length === 0) {
        this.$el.find('.searchResults').prepend("<div class='collectionResults'><h2 class='result-count'>No Items Found</h2>");
      }
      return this.render();
    };

    SearchView.prototype.renderPeopleResults = function() {
      var currentViewHTML, people, peopleContainer, peopleContainerOL, peoplePlural,
        _this = this;
      people = _.filter(this.collection.models, function(screen) {
        return screen.get("item").get("type") === 'user';
      }).slice(0, 6);
      if (!people.length) {
        return;
      }
      currentViewHTML = this.$el.find('.searchResults').append('<div class="peopleResults"><ol class="collage-list cf"></ol></div><div class="border"></div>');
      peopleContainer = currentViewHTML.find(".peopleResults");
      peopleContainerOL = peopleContainer.find('ol');
      peoplePlural = people.length === 1 ? 'Person' : 'People';
      peopleContainer.prepend("<h2 class='result-count'>" + people.length + " " + peoplePlural + "</h2>");
      return _.map(people, function(item) {
        var view;
        view = new myd.ScreenView({
          model: item,
          context: _this.context,
          inline: _this.inline,
          searchItem: true
        });
        view.render();
        view.bind("selected", _this.selectedAsset, _this);
        _this.searchViews.push(view);
        return peopleContainerOL.append(view.$el);
      });
    };

    SearchView.prototype.renderCollectionResults = function(data) {
      var collectionContainer, collectionContainerOL, collectionPlural, collections, current, currentViewHTML, screen, screensList, _i, _len,
        _this = this;
      collections = _.filter(this.collection.models, function(screen) {
        return screen.get("item").get("type") === 'collection';
      });
      if (!collections.length) {
        return;
      }
      currentViewHTML = this.$el.find('.searchResults').append('<div class="collectionResults"><ol class="collage-list cf"></ol></div>');
      collectionContainer = currentViewHTML.find(".collectionResults");
      collectionContainerOL = collectionContainer.find('ol');
      collectionPlural = collections.length === 1 ? 'Collage' : 'Collages';
      collectionContainer.prepend("<h2 class='result-count'>" + collections.length + " " + collectionPlural + "</h2>");
      _.map(collections, function(item) {
        var view;
        view = new myd.ScreenView({
          model: item,
          context: _this.context,
          inline: _this.inline,
          searchItem: true
        });
        view.render();
        view.bind("selected", _this.selectedAsset, _this);
        _this.searchViews.push(view);
        return collectionContainerOL.append(view.$el.addClass('screen subFeatured'));
      });
      screensList = $('.collage-list .screen');
      for (_i = 0, _len = screensList.length; _i < _len; _i++) {
        screen = screensList[_i];
        current = $(screen).find('.asset .frame .image');
        current.attr('src', current.data('src-745'));
      }
      return new global.myd.ImageCenter($('.asset'));
    };

    SearchView.prototype.doSearch = function(event) {
      var target;
      target = $(event.target);
      this.searchTerm = target.val().trim();
      if (this.searchTerm.length) {
        Router.navigate("search/" + this.searchTerm);
        return this.display();
      }
    };

    return SearchView;

  })(SearchBaseView);

  global.myd.SearchBaseView = SearchBaseView;

  global.myd.SearchView = SearchView;

}).call(this);
