(function() {
  var WayBackView, renderAsset, serviceModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderAsset = global.myd.renderAsset;

  serviceModule = myd.serviceModule;

  WayBackView = (function(_super) {

    __extends(WayBackView, _super);

    function WayBackView() {
      return WayBackView.__super__.constructor.apply(this, arguments);
    }

    WayBackView.prototype.tagName = "div";

    WayBackView.prototype.className = "wayback";

    WayBackView.prototype.collection = myd.WayBackCollection;

    WayBackView.prototype.turntableViews = [];

    WayBackView.prototype.initialize = function(params) {
      this.containerEl = params.container;
      this.collection.bind('add', this.render, this);
      return this.collection.bind('reset', this.render, this);
    };

    WayBackView.prototype.render = function() {
      var renderTemplate, rendered_view_html,
        _this = this;
      $("#wayback").remove();
      if (this.collection.models.length < 2) {
        $("#content").removeClass("wayback");
        return;
      }
      $("#content").addClass("wayback");
      renderTemplate = {
        collection: {
          models: this.collection.toJSON()
        }
      };
      rendered_view_html = Mustache.render($("#way_back_template").html(), renderTemplate);
      $(rendered_view_html).insertAfter("body > header");
      this.setElement($("#wayback", this.containerEl));
      return _.each(this.collection.models, function(crumb) {
        var crumbView;
        crumbView = new myd.BreadcrumbView({
          model: crumb,
          container: _this.$el.find("ol")
        });
        crumbView.bind("goBack", function(crumbClicked) {
          return _this.collection.rollBackHistory(crumbClicked);
        });
        return _this.turntableViews.push(crumbView);
      });
    };

    WayBackView.prototype.onClose = function() {
      return _.each(this.views, function(crumb) {
        crumbView.unbind("goBack", this.rollBackHistory, this);
        return crumb.close();
      });
    };

    return WayBackView;

  })(Backbone.View);

  global.myd.WayBackView = WayBackView;

}).call(this);
