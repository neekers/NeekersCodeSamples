(function() {
  var AddFactView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddFactView = (function(_super) {

    __extends(AddFactView, _super);

    function AddFactView() {
      return AddFactView.__super__.constructor.apply(this, arguments);
    }

    AddFactView.prototype.tagName = "div";

    AddFactView.prototype.className = "screen-item add-asset fact-type cf";

    AddFactView.prototype.collection = myd.ItemsCollection;

    AddFactView.prototype.events = {
      'click .close-add-item': 'clickedClose',
      'click .add-btn': 'addItem'
    };

    AddFactView.prototype.initialize = function(params) {
      var _this = this;
      this.containerTarget = params.container;
      this.index = params.index;
      this.bind("finishEdit", function() {
        return _this.clickedClose();
      });
      this.bind("cancelEdit", function() {
        return _this.clickedClose();
      });
      return this.render();
    };

    AddFactView.prototype.render = function() {
      var _this = this;
      this.template = $("#add_fact_item_template").html();
      this.$el.append(Mustache.render(this.template, {
        index: this.index
      }));
      this.$el.insertAfter(this.containerTarget);
      this.editBar = $('.edit');
      myd.Placeholder().refresh(this.$el);
      return this.$el.show("blind", 1000, function() {
        var editor;
        return editor = myd.renderTextEditor("new-text-" + _this.index);
      });
    };

    AddFactView.prototype.addItem = function() {
      var contentHTML, editor, item, text, title;
      myd.Placeholder().clean(this.$el);
      title = this.$el.find('.fact_title').text();
      editor = tinyMCE.get("new-text-" + this.index);
      contentHTML = $("<div>").html(editor.getContent())[0];
      text = markdown.serialize(contentHTML);
      if (!title.length && !text.length) {
        this.clickedClose();
        return;
      }
      item = new myd.ItemModel({
        asset_type: "fact",
        title: title,
        text: text,
        index: this.index,
        type: 'fact'
      });
      this.trigger("addItem", item);
      return this.clickedClose();
    };

    AddFactView.prototype.clickedClose = function() {
      var _this = this;
      this.$el.hide("blind", 1000, function() {
        return _this.close();
      });
      return false;
    };

    AddFactView.prototype.onClose = function() {
      var _ref1;
      return (_ref1 = tinyMCE.get("new-text-" + this.index)) != null ? _ref1.remove() : void 0;
    };

    return AddFactView;

  })(Backbone.View);

  global.myd.AddFactView = AddFactView;

}).call(this);
