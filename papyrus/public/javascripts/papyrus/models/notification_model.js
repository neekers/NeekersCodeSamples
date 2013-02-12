(function() {
  var NotificationModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  NotificationModel = (function(_super) {

    __extends(NotificationModel, _super);

    function NotificationModel() {
      return NotificationModel.__super__.constructor.apply(this, arguments);
    }

    NotificationModel.prototype.defaults = {
      type: "comment",
      source_user_name: "Eric Novins",
      text: "This is a comment",
      created_timestamp: new Date(),
      read: false
    };

    NotificationModel.prototype.initialize = function(params) {
      return this;
    };

    return NotificationModel;

  })(Backbone.Model);

  global.myd.NotificationModel = NotificationModel;

}).call(this);
