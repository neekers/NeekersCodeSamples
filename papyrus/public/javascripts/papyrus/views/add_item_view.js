(function() {
  var AddItemView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddItemView = (function(_super) {

    __extends(AddItemView, _super);

    function AddItemView() {
      return AddItemView.__super__.constructor.apply(this, arguments);
    }

    AddItemView.prototype.tagName = "li";

    AddItemView.prototype.className = "item";

    AddItemView.prototype.model = myd.ItemModel;

    AddItemView.prototype.events = {
      "click a": "clickedItem"
    };

    AddItemView.prototype.initialize = function(params) {
      this.addType = params.addType;
      return this.render();
    };

    AddItemView.prototype.render = function() {
      var coverImage1024, coverImage150, coverImage2048, coverImage300, coverImage745, coverImageThumb, placeholder, thumbnail;
      placeholder = "/images/placeholder-logo.jpg";
      thumbnail = this.model.get("image_300_url") || placeholder;
      coverImageThumb = this.model.get("preview_image_url") || placeholder;
      coverImage150 = this.model.get("image_150_url") || placeholder;
      coverImage300 = this.model.get("image_300_url") || placeholder;
      coverImage745 = this.model.get("image_745_url") || placeholder;
      coverImage1024 = this.model.get("image_1024_url") || placeholder;
      coverImage2048 = this.model.get("image_2048_url") || placeholder;
      if (this.model.get("type").toLowerCase() === "collection") {
        if (this.addType === "cover") {
          thumbnail = this.model.get("cover_asset").image_745_url || placeholder;
          this.$el.append("<a href='#' title='Click to add " + (this.model.get("type")) + "' style='background-image: url(" + thumbnail + ")' /></a>");
        } else {
          this.$el.html(myd.renderScreen(this.model.toJSON(), "addcollage")).addClass('screen');
          myd.renderAssetFragmentFromItem(this.model, null, "addcollage", this.$el);
        }
      } else if (this.model.get("type") === "video" || this.model.get("type") === "VideoAsset") {
        this.$el.append("<a href='#' class='video-thumb' title='Click to add " + (this.model.get("type")) + "' style='background-image: url(/images/play.png), url(" + thumbnail + ")' /></a>");
      } else if (this.model.get("type") === "FeedAsset" || this.model.get("type") === "feed") {
        this.$el.append("<a href='#' title='Click to add " + (this.model.get("type")) + "' ><span class='icon rss'><img src='/images/icon-rss-large.png'  alt='rss icon'/></span>" + (this.model.get("title")) + "</a>");
      } else {
        this.$el.append("<a href='#' title='Click to add " + (this.model.get("type")) + "' style='background-image: url(" + thumbnail + ")' /></a>");
      }
      this.$el.addClass('no-hover');
      return this.$el.find('.asset .image').attr('src', coverImage745);
    };

    AddItemView.prototype.clickedItem = function() {
      if (this.addType === "cover" && this.model.get("type") === "collection") {
        this.trigger("addItem", new Backbone.Model(this.model.get("cover_asset")));
      } else {
        this.trigger("addItem", this.model);
      }
      return false;
    };

    return AddItemView;

  })(Backbone.View);

  global.myd.AddItemView = AddItemView;

}).call(this);
