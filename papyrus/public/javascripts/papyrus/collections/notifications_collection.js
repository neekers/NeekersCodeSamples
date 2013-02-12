(function() {
  var NotificationsCollection, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  NotificationsCollection = Backbone.Collection.extend({
    model: myd.NotificationModel,
    initialize: function(params) {
      this.fetchUrl = myd.urls.notifications;
      return this;
    },
    fetch: function() {
      var _this = this;
      return myd.serviceModule.get({
        url: this.fetchUrl,
        success: function(response) {
          return _this.reset(response);
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    },
    markAllRead: function() {
      var _this = this;
      return myd.serviceModule.post({
        url: this.fetchUrl,
        success: function(response) {
          return _.each(_this.models, function(notification) {
            return notification.set("read", true);
          });
        }
      });
    }
  });

  global.myd.NotificationsCollection = NotificationsCollection;

}).call(this);
