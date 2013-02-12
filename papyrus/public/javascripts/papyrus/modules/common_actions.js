(function() {
  var selectedScreen, _base, _ref, _ref1;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  if ((_ref1 = (_base = global.myd).common) == null) {
    _base.common = {};
  }

  selectedScreen = function(screen) {
    var routes, url;
    if (screen.get("item").get("type") === "collection" && screen.get("item").get("is_topic")) {
      return Router.navigate("topic/" + (screen.get("item").get("uid")), {
        trigger: true
      });
    } else if (screen.get("item").get("type") === "collection") {
      url = screen.get('item').get("entity_url");
      routes = myd.routesModule.getRoutesFromUrl(url);
      return Router.navigate(routes.getPapyrusPath(), {
        trigger: true
      });
    } else if (screen.get("item").get("type") === "user") {
      url = screen.get('item').get("entity_url");
      return Router.navigateToProfileTab({
        userPath: new global.myd.Uri(url).getPathname(),
        tab: 'collections'
      });
    } else if (screen.get("item").get("type") !== "collection") {
      return this.itemLightboxView = new myd.ItemLightboxView({
        model: screen
      });
    }
  };

  global.myd.common.selectedScreen = selectedScreen;

}).call(this);
