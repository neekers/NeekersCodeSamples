(function() {
  var TurntableCollageView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  TurntableCollageView = (function(_super) {

    __extends(TurntableCollageView, _super);

    function TurntableCollageView() {
      return TurntableCollageView.__super__.constructor.apply(this, arguments);
    }

    TurntableCollageView.prototype.tagName = "li";

    TurntableCollageView.prototype.className = "item";

    TurntableCollageView.prototype.model = myd.ScreenModel;

    TurntableCollageView.prototype.events = {
      "click .collage": "clickedCollage"
    };

    TurntableCollageView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      return this.render();
    };

    TurntableCollageView.prototype.render = function() {
      var html, itemObj;
      itemObj = this.model.get("item").toJSON();
      html = $('<li class="item"/>').append(myd.renderScreen(itemObj));
      this.containerEl.append(html);
      return this.setElement("#" + this.containerEl[0].id + " li:last-child");
      /*
          if @model.get("item").get("type") == "feed"
            @assetRSSView = new global.myd.AssetRSSView( model: @model.get("item"), container: @$el.find(".feed.asset"), removeEvents: true )
          else if @model.get("item").get("type") == "collection"
            @collectionAuthorView = new global.myd.CollectionAuthorView( model: @model, el: @$el.find(".collection_tile_meta"))
      */

    };

    TurntableCollageView.prototype.clickedCollage = function() {
      var routes, url;
      if (this.model.get("item").get("type") === "collection") {
        url = this.model.get('item').get("entity_url");
        routes = myd.routesModule.getRoutesFromUrl(url);
        Router.navigate(routes.getPapyrusPath(), {
          trigger: true
        });
      }
      return false;
    };

    TurntableCollageView.prototype.renderScreens = function() {
      var randomCollection, screensBox,
        _this = this;
      randomCollection = this.model.get("item").get("screens");
      if (randomCollection != null) {
        randomCollection = randomCollection.slice(0, 6);
        this.$el.find(".record-screens").remove();
        this.$el.find(".collage").append("<ul class='record-screens'></ul>");
        screensBox = this.$el.find(".record-screens").addClass("layout-" + randomCollection.length);
        return _.each(randomCollection, function(screen) {
          return screensBox.append("<li>").find("li:last-child").append(myd.renderTurntableScreen(screen));
        });
      }
    };

    return TurntableCollageView;

  })(Backbone.View);

  global.myd.TurntableCollageView = TurntableCollageView;

}).call(this);
