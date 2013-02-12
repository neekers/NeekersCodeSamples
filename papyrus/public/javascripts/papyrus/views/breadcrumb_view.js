(function() {
  var BreadcrumbView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  BreadcrumbView = (function(_super) {

    __extends(BreadcrumbView, _super);

    function BreadcrumbView() {
      return BreadcrumbView.__super__.constructor.apply(this, arguments);
    }

    BreadcrumbView.prototype.tagName = "li";

    BreadcrumbView.prototype.model = myd.BreadcrumbModel;

    BreadcrumbView.prototype.events = {
      "click a": "goBack"
    };

    BreadcrumbView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      return this.render();
    };

    BreadcrumbView.prototype.render = function() {
      var rendered_view_html;
      rendered_view_html = Mustache.render($("#breadcrumb_template").html(), this.model.toJSON());
      this.containerEl.append(rendered_view_html);
      return this.setElement($("li:last-child", this.containerEl));
    };

    BreadcrumbView.prototype.goBack = function() {
      this.trigger("goBack", this.model);
      return false;
    };

    return BreadcrumbView;

  })(Backbone.View);

  global.myd.BreadcrumbView = BreadcrumbView;

}).call(this);
