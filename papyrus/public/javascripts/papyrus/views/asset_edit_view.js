(function() {
  var AssetEditView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AssetEditView = (function(_super) {

    __extends(AssetEditView, _super);

    function AssetEditView() {
      return AssetEditView.__super__.constructor.apply(this, arguments);
    }

    AssetEditView.prototype.model = myd.ScreenModel;

    AssetEditView.prototype.events = {
      'click .submit_edit_text': 'clickedSubmitEditText',
      'click .cancel_edit_text': 'clickedCancelText'
    };

    AssetEditView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      return this.render();
    };

    AssetEditView.prototype.render = function() {
      var rendered_view_html;
      rendered_view_html = Mustache.render($("#asset_edit_view_template").html(), this.model.toJSON());
      this.containerEl.append(rendered_view_html);
      this.setElement($(".edit_controls", this.containerEl));
      this.containerEl.find(".caption").hide();
      this.containerEl.find(".editable_btn").hide();
      if (this.model.get('item').get("type") === "fact" && this.model.get("item").get("owned")) {
        this.$el.find(".fact-editor").show();
      }
      if (this.model.get('item').get('title').length) {
        this.$el.find('.screen_header_input').val(this.model.get('item').get('title'));
      }
      this.containerEl.parentsUntil(".fullscreen-overlay").parent()[0].scrollTop = 2000;
      if (this.model.get("item").get("type") === "fact") {
        this.factEditor = new myd.wysiwygEditor({
          el: this.$el.find(".screen_text_input")
        });
        return this.factEditor.markdown(this.model.get("item").get("text"));
      }
    };

    AssetEditView.prototype.clickedSubmitEditText = function() {
      var asset;
      if ((this.factEditor != null) && this.model.get("item").get("type") === "fact" && this.factEditor.markdown().length === 0) {
        return false;
      }
      this.$el.find(".saving_text").show();
      this.$el.find(".submit_edit_text, .cancel_edit_text").hide();
      asset = this.model.toJSON();
      asset.caption = this.$el.find("#asset-caption").val().trim();
      asset.title = this.$el.find(".screen_header_input").val();
      if (this.factEditor != null) {
        asset.text = this.factEditor.markdown();
      }
      if (this.model.get("item").get("type") === "fact") {
        if (asset.caption === this.model.get("caption") && asset.title === this.model.get("item").get("title") && asset.text === this.model.get("item").get("text")) {
          this.clickedCancelText();
          return false;
        }
      } else {
        if (asset.caption === this.model.get("caption")) {
          this.clickedCancelText();
          return false;
        }
      }
      this.trigger("assetEdited", asset);
      return false;
    };

    AssetEditView.prototype.clickedCancelText = function() {
      if (this.factEditor != null) {
        this.factEditor.close();
      }
      this.containerEl.parentsUntil(".fullscreen-overlay").parent()[0].scrollTop = 0;
      this.containerEl.find(".caption").show();
      this.containerEl.find(".editable_btn").show();
      this.trigger("closeMe");
      this.close();
      return false;
    };

    return AssetEditView;

  })(Backbone.View);

  global.myd.AssetEditView = AssetEditView;

}).call(this);
