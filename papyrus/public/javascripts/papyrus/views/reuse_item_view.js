(function() {
  var ReuseItemView, renderVideoEmbed, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderVideoEmbed = global.myd.renderVideoEmbed;

  ReuseItemView = (function(_super) {

    __extends(ReuseItemView, _super);

    function ReuseItemView() {
      return ReuseItemView.__super__.constructor.apply(this, arguments);
    }

    ReuseItemView.prototype.model = myd.ScreenModel;

    ReuseItemView.prototype.events = {
      "click .cancel-btn": "close",
      "click .reuse-btn": "clickedReuseItem",
      "click .screen-item": "clickFail",
      'click .selected-collage': 'clickedDropdown',
      'click .options li': 'clickedDropdownItem'
    };

    ReuseItemView.prototype.initialize = function(params) {
      this.selectedCollectionUrl = null;
      this.getUserCollections();
      return this.render();
    };

    ReuseItemView.prototype.render = function() {
      var caption, collageScreen, creator, screensModels, template, templateObj,
        _this = this;
      template = $("#reuse_item_template").html();
      if (template === null) {
        return false;
      }
      $("div#content").append("<div id='reuse'>");
      this.setElement($("#reuse"));
      this.overlayView = new myd.OverlayView();
      caption = this.model.get("caption");
      creator = this.model.collection.frontMatter != null ? this.model.collection.frontMatter.get("owner") : this.model.frontMatter.get("owner");
      if (this.model.models != null) {
        collageScreen = new myd.ScreenModel(this.model.frontMatter.toJSON());
        screensModels = [];
        _.each(this.model.models, function(screen) {
          var item, screenObj, _ref1;
          if (screen.get("item").get("uid") !== ((_ref1 = _this.model.frontMatter.get("cover_asset")) != null ? _ref1.uid : void 0)) {
            item = screen.get("item");
            screenObj = screen.toJSON();
            screenObj.item = item.toJSON();
            return screensModels.push(screenObj);
          }
        });
        templateObj = collageScreen.toJSON();
        templateObj.item.set("type", "collection");
        templateObj.item.set("cover_asset", this.model.frontMatter.get("cover_asset"));
        templateObj.item.set("screens", screensModels);
        templateObj.item.set("screens_count", this.model.frontMatter.get("screens_count"));
        templateObj.item.set("created_timestamp", this.model.frontMatter.get("created_timestamp"));
        this.$el.html(Mustache.render(template, templateObj));
        this.$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"));
        myd.renderAssetFragment(collageScreen, this.context, this.$el);
        this.$el.find(".screen-item").addClass("wide");
        $("#reuse-asset-caption").remove();
        $(".reuse-item-form-wrapper").height("440px");
      } else if (typeof this.model.get("item").get("screens") === "undefined") {
        templateObj = this.model.toJSON();
        if ((caption != null) && caption.length > 0) {
          templateObj.quotedCaption = "" + creator.first_name + " " + creator.last_name + ": " + caption;
        }
        templateObj.owner = null;
        delete templateObj.caption;
        templateObj.item.screens_count = null;
        templateObj.item.collected_count = null;
        this.$el.html(Mustache.render(template, templateObj));
        this.$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"));
      } else {
        templateObj = this.model.toJSON();
        if ((caption != null) && caption.length > 0) {
          templateObj.quotedCaption = "" + creator.first_name + " " + creator.last_name + ": " + caption;
        }
        templateObj.caption = null;
        this.$el.html(Mustache.render(template, this.model));
        this.$el.find(".screen").html(myd.renderScreen(templateObj, "reuse"));
        myd.renderAssetFragment(this.model, this.context, this.$el);
        this.$el.find('.screen-item').addClass('wide');
      }
      if (typeof this.$el.find('.asset .image').attr('src') === "undefined") {
        this.$el.find('.asset .image').attr('src', this.$el.find('.asset .image').data('src-745'));
      }
      if ($.browser.msie) {
        global.myd.Placeholder().refresh(this.$el);
      }
      if (this.model.get("item") != null) {
        if (this.model.get("item").get("type") === "feed") {
          this.assetRSSView = new global.myd.AssetRSSView({
            model: this.model.get("item"),
            container: this.$el.find(".screen"),
            removeEvents: true
          });
        } else if (this.model.get("item").get("type") === 'video' && (this.model.get('item').get("youtube_id") != null)) {
          renderVideoEmbed(this.model, this.$el);
        }
        if (this.model.get("item").get("type") === "feed" || this.model.get("item").get("type") === "collection" || this.model.get("item").get("type") === "fact") {
          $("#reuse-asset-caption").remove();
          $(".reuse-item-form-wrapper").height("440px");
        }
      }
      this.dropdown = this.$el.find(".dropdown-container .options");
      return new global.myd.ImageCenter(this.$el.find('.asset'));
    };

    ReuseItemView.prototype.clickFail = function() {
      return false;
    };

    ReuseItemView.prototype.clickedReuseItem = function() {
      var asset, url,
        _this = this;
      url = this.selectedCollectionUrl;
      if (!(url != null)) {
        this.$el.find("#collection-error-message").text("Please select a collage").show();
        return false;
      }
      asset = {};
      asset.entity_url = this.model.get("item") != null ? this.model.get("item").get("entity_url") : this.model.collection.entity_url;
      asset.caption = this.$el.find("#reuse-asset-caption").val();
      return myd.serviceModule.post({
        url: url,
        data: [asset],
        success: function(response) {
          return _this.close();
        },
        error: function(response) {
          _this.$el.find("#collection-error-message").text(response.responseText).show();
          return _this.trigger("errorReset");
        }
      });
    };

    ReuseItemView.prototype.getUserCollections = function() {
      var _this = this;
      return myd.serviceModule.get({
        url: myd.urls.my_collection_list,
        success: function(response) {
          return _.each(response, function(collection) {
            var option;
            collection.title = collection.title.length > 50 ? collection.title.substr(0, 49) + " ..." : collection.title;
            option = $("<li>").data({
              "value": collection.uid
            }).text(collection.title);
            jQuery.data(option[0], 'edit_items_url', collection.edit_items_url);
            return _this.dropdown.append(option);
          });
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    };

    ReuseItemView.prototype.clickedDropdown = function() {
      this.$el.find("#collection-error-message").hide();
      this.$el.find('.dropdown-container').toggleClass('open');
      return this.$el.find('.options').toggle('blind', 150);
    };

    ReuseItemView.prototype.clickedDropdownItem = function(event) {
      var target;
      target = $(event.target);
      this.selectedCollectionUrl = target.data('edit_items_url');
      this.$el.find('.selected-collage').text(target.text());
      this.$el.find(".reuse-btn").removeClass("inactive");
      return this.clickedDropdown();
    };

    ReuseItemView.prototype.onClose = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.assetRSSView) != null) {
        _ref1.close();
      }
      return (_ref2 = this.overlayView) != null ? _ref2.close() : void 0;
    };

    return ReuseItemView;

  })(Backbone.View);

  global.myd.ReuseItemView = ReuseItemView;

}).call(this);
