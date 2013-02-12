(function() {
  var NotificationItemView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  NotificationItemView = (function(_super) {

    __extends(NotificationItemView, _super);

    function NotificationItemView() {
      return NotificationItemView.__super__.constructor.apply(this, arguments);
    }

    NotificationItemView.prototype.model = myd.NotificationModel;

    NotificationItemView.prototype.tagName = "li";

    NotificationItemView.prototype.events = {
      "click .view-link": "clickedView"
    };

    NotificationItemView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      return this.render();
    };

    NotificationItemView.prototype.render = function() {
      var rendered_view_html, routes, templateObj;
      templateObj = this.model.toJSON();
      if (templateObj.text.length > 100) {
        templateObj.text = templateObj.text.substring(0, 99);
      }
      templateObj.created_timestamp = new Date(templateObj.created_timestamp * 1000);
      routes = myd.routesModule.getRoutesFromUrl(templateObj.collection_url);
      templateObj.collection_url = routes.getPapyrusPath();
      templateObj.actionText = {
        comment: "added a comment to your collage"
      }[templateObj.type];
      rendered_view_html = Mustache.render($("#notifications_list_item_template").html(), templateObj);
      this.containerEl.append(rendered_view_html);
      this.setElement($("#notifications-list li:last-child"));
      return this.$el.find("time").relativeTime();
    };

    NotificationItemView.prototype.clickedView = function() {
      var routes;
      routes = myd.routesModule.getRoutesFromUrl(this.model.get("collection_url"));
      Router.navigate(routes.getPapyrusPath() + "/screens/" + this.model.get("screen_uid"), {
        trigger: true
      });
      return this.trigger("clickedView");
    };

    return NotificationItemView;

  })(Backbone.View);

  global.myd.NotificationItemView = NotificationItemView;

}).call(this);
