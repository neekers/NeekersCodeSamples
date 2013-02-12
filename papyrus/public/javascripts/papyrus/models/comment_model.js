(function() {
  var CommentModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  CommentModel = (function(_super) {

    __extends(CommentModel, _super);

    function CommentModel() {
      return CommentModel.__super__.constructor.apply(this, arguments);
    }

    CommentModel.prototype.idAttribute = "uid";

    CommentModel.prototype.defaults = {
      text: "This is a comment",
      created_timestamp: new Date(),
      deleted: false,
      truncated: false
    };

    CommentModel.prototype.initialize = function(params) {
      this.set("created_timestamp", new Date(this.get("created_timestamp") * 1000));
      return this;
    };

    return CommentModel;

  })(Backbone.Model);

  global.myd.CommentModel = CommentModel;

}).call(this);
