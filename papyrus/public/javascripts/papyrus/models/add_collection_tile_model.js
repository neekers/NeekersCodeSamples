(function() {
  var AddCollectionTileModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddCollectionTileModel = (function(_super) {

    __extends(AddCollectionTileModel, _super);

    function AddCollectionTileModel() {
      return AddCollectionTileModel.__super__.constructor.apply(this, arguments);
    }

    AddCollectionTileModel.prototype.type = "add_collection";

    AddCollectionTileModel.prototype.defaults = {
      title: "Give me title"
    };

    return AddCollectionTileModel;

  })(Backbone.Model);

  global.myd.AddCollectionTileModel = AddCollectionTileModel;

}).call(this);
