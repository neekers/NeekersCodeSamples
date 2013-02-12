(function() {
  var NotificationsListView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  NotificationsListView = (function(_super) {

    __extends(NotificationsListView, _super);

    function NotificationsListView() {
      return NotificationsListView.__super__.constructor.apply(this, arguments);
    }

    NotificationsListView.prototype.collection = myd.NotificationsCollection;

    NotificationsListView.prototype.notificationViews = [];

    NotificationsListView.prototype.events = {
      "click": "fallThrough"
    };

    NotificationsListView.prototype.initialize = function(params) {
      var _this = this;
      this.containerEl = params.container;
      $("body").on("click", function() {
        return _this.toggleList({
          close: true,
          propagate: true
        });
      });
      this.collection = new myd.NotificationsCollection();
      return this.collection.bind("reset", this.render, this);
    };

    NotificationsListView.prototype.refresh = function() {
      return this.collection.fetch();
    };

    NotificationsListView.prototype.render = function() {
      var unread,
        _this = this;
      if ($("#notifications").length === 0) {
        $("nav .create-btn").after('<span id="count-wrapper"><a href="#" id="notifications-count" class="zero"></a></span>');
        this.countEl = $("#notifications-count");
        this.countEl.bind("click", function() {
          return _this.toggleList();
        });
        $("nav").append(Mustache.render($("#notifications_list_template").html()));
        this.setElement($("#notifications"));
      } else {
        this.$el.find("ol#notifications-list").empty();
      }
      unread = this.collection.where({
        read: false
      });
      this.setCount(unread.length);
      this.notificationsOL = this.$el.find("ol#notifications-list");
      if (this.collection.models.length > 0) {
        _.each(this.collection.models, function(note) {
          var notification;
          notification = new myd.NotificationItemView({
            model: note,
            container: _this.notificationsOL
          });
          notification.bind("clickedView", _this.closeList, _this);
          return _this.notificationViews.push(notification);
        });
        this.notificationsOL.show();
      } else {
        $("#no-notifications-message").show();
        this.notificationsOL.hide();
      }
      return $(".notification-date").relativeTime();
    };

    NotificationsListView.prototype.setCount = function(count) {
      count = count > -1 ? count : this.collection.length;
      this.countEl.html(count);
      return this.countEl.toggleClass("zero", count === 0);
    };

    NotificationsListView.prototype.closeList = function() {
      return this.toggleList({
        close: true
      });
    };

    NotificationsListView.prototype.toggleList = function(params) {
      if ((this.$el != null) && (params != null) && (params.close != null)) {
        this.closeDropOut();
        if (params.propagate) {
          return true;
        }
        return false;
      }
      if ((this.$el != null) && this.$el.css("display") === "none") {
        this.collection.markAllRead();
        this.$el.show();
      } else {
        this.closeDropOut();
      }
      return false;
    };

    NotificationsListView.prototype.closeDropOut = function() {
      if (this.countEl != null) {
        this.$el.slideUp(500);
        this.setCount(0);
        return this.collection.reset(this.collection.models);
      }
    };

    NotificationsListView.prototype.fallThrough = function() {
      return false;
    };

    NotificationsListView.prototype.onClose = function() {
      $("body").off("click");
      return _.each(this.notificationViews, function(view) {
        view.unbind("clickedView", this.closeList, this);
        return view.close();
      });
    };

    return NotificationsListView;

  })(Backbone.View);

  global.myd.NotificationsListView = NotificationsListView;

}).call(this);
