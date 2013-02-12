(function() {
  var BreadcrumbModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  BreadcrumbModel = (function(_super) {

    __extends(BreadcrumbModel, _super);

    function BreadcrumbModel() {
      return BreadcrumbModel.__super__.constructor.apply(this, arguments);
    }

    BreadcrumbModel.prototype.defaults = {
      url: "papyrus",
      name: "Collagio"
    };

    BreadcrumbModel.prototype.initialize = function(params) {
      this.set("name", this.get("name").replace(" - Collagio", ""));
      return this;
    };

    return BreadcrumbModel;

  })(Backbone.Model);

  global.myd.BreadcrumbModel = BreadcrumbModel;

}).call(this);
