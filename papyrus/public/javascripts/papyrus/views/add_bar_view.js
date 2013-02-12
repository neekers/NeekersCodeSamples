(function() {
  var AddBarView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddBarView = (function(_super) {

    __extends(AddBarView, _super);

    function AddBarView() {
      return AddBarView.__super__.constructor.apply(this, arguments);
    }

    AddBarView.prototype.model = myd.ScreenModel;

    AddBarView.prototype.events = {
      'click .add-bar a': 'clickedAddBarButton',
      'click .add-fact': 'clickAddText',
      'click .add-photo': 'clickAddPhoto',
      'click .add-video': 'clickAddVideo',
      'click .add-collage': 'clickAddCollage',
      'click .add-rss': 'clickAddFeed'
    };

    AddBarView.prototype.bindToModel = {
      "change:index": "updateIndex"
    };

    AddBarView.prototype.showFrontMatter = true;

    AddBarView.prototype.prevScreenId = null;

    AddBarView.prototype.initialize = function(params) {
      this.index = params.index;
      return this.firstTime = params.first_time;
      /*
          @bind "finishEdit", =>
            @close()
      
          @bind "cancelEdit", =>
            @close()
      */

    };

    AddBarView.prototype.reset = function() {
      return this.render();
    };

    AddBarView.prototype.render = function() {
      this.$el.html(Mustache.render($("#add_bar_view_template").html(), {
        first_time: this.firstTime
      }));
      if (this.firstTime) {
        this.$el.find(".add-bar").addClass("add-bar-show");
      }
      return this.$el;
    };

    AddBarView.prototype.updateIndex = function() {
      return this.index = this.model.get("index");
    };

    AddBarView.prototype.clickAddText = function(event) {
      var target,
        _this = this;
      target = $(event.target).parents('.add-bar');
      this.newFactAsset = new myd.AddFactView({
        container: target,
        index: this.index
      });
      this.bind("finishEdit", function() {
        return _this.newFactAsset.trigger("finishEdit");
      });
      this.bind("cancelEdit", function() {
        return _this.newFactAsset.trigger("cancelEdit");
      });
      return this.newFactAsset.bind("addItem", this.callAddNewItem, this);
    };

    AddBarView.prototype.clickAddPhoto = function(event) {
      return this.addPhotoVideo(event, "image");
    };

    AddBarView.prototype.callAddItemToCollection = function(item) {
      this.trigger("addItem", {
        view: this,
        item: item
      });
      return false;
    };

    AddBarView.prototype.callAddNewItem = function(item) {
      this.trigger("addNewItem", {
        view: this,
        item: item
      });
      return false;
    };

    AddBarView.prototype.clickAddVideo = function(event) {
      return this.addPhotoVideo(event, "video");
    };

    AddBarView.prototype.addPhotoVideo = function(event, addType) {
      var target;
      target = $(event.target).parents('.add-bar');
      this.newPhotoVideoView = new myd.AddPhotoVideoView({
        container: target,
        addType: addType,
        addItemUrl: this.model.get("add_new_item_url"),
        index: this.index
      });
      this.newPhotoVideoView.bind("addItem", this.callAddItemToCollection, this);
      return this.newPhotoVideoView.bind("addNewItem", this.callAddNewItem, this);
    };

    AddBarView.prototype.clickAddCollage = function(event) {
      return this.addPhotoVideo(event, "collage");
    };

    AddBarView.prototype.clickAddFeed = function(event) {
      var target;
      target = $(event.target).parents('.add-bar');
      this.newFeedAsset = new myd.AddFeedView({
        container: target,
        index: this.index
      });
      return this.newFeedAsset.bind("addItem", this.callAddNewItem, this);
    };

    AddBarView.prototype.clickedAddBarButton = function() {
      $("body, html").animate({
        'scrollTop': this.$el.find(".add-bar").offset().top - 80
      }, 750, "easeOutBack");
      this.$el.find(".add-bar").removeClass("add-bar-show");
      this.$el.find('.first-edit-callout').remove();
      return false;
    };

    AddBarView.prototype.onClose = function() {
      if (this.newFactAsset != null) {
        this.newFactAsset.unbind("addItem");
        this.newFactAsset.close();
      }
      if (this.newPhotoVideoView != null) {
        this.newPhotoVideoView.unbind("addItem");
        this.newPhotoVideoView.close();
      }
      if (this.newFeedAsset != null) {
        this.newFeedAsset.unbind("addItem");
        this.newFeedAsset.close();
      }
      return this.unbind("finishEdit");
    };

    return AddBarView;

  })(Backbone.View);

  global.myd.AddBarView = AddBarView;

}).call(this);
