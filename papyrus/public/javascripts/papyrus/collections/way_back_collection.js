(function() {
  var WayBackCollection, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  WayBackCollection = Backbone.Collection.extend({
    model: myd.BreadcrumbModel,
    overflow: [],
    initialize: function() {
      return this;
    },
    add: function(model, options) {
      var lastCrumb;
      lastCrumb = _.first(this.models);
      if ((lastCrumb != null) && model.get("name") === lastCrumb.get("name") && model.get("url") === lastCrumb.get("url")) {
        return;
      }
      if (this.models.length > 5) {
        this.overflow.push(this.pop());
      }
      return Backbone.Collection.prototype.add.call(this, model, options);
    },
    rollBackHistory: function(crumbClicked) {
      var goBack, index, num, _i, _j;
      index = this.indexOf(crumbClicked);
      for (num = _i = 0; 0 <= index ? _i <= index : _i >= index; num = 0 <= index ? ++_i : --_i) {
        this.shift();
      }
      this.reset(this.models);
      goBack = 4 - index;
      for (num = _j = 1; 1 <= goBack ? _j <= goBack : _j >= goBack; num = 1 <= goBack ? ++_j : --_j) {
        this.addOverflow(num);
      }
      return Router.navigate(crumbClicked.get("url"), {
        trigger: true
      });
    },
    addOverflow: function() {
      var overflowItem;
      overflowItem = this.overflow.pop();
      if (overflowItem != null) {
        return this.add(overflowItem, {
          silent: true
        });
      }
    }
  });

  global.myd.WayBackCollection = WayBackCollection;

}).call(this);
