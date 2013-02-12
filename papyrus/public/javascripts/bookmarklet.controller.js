(function() {
  var _base, _ref, _ref1, _ref2;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  if ((_ref2 = (_base = global.myd).bookmarklet) == null) {
    _base.bookmarklet = {};
  }

  global.myd.bookmarklet.controller = function(params) {
    var assetFinder, displayDrawer, view;
    view = params.view;
    assetFinder = params.assetFinder;
    displayDrawer = function(data) {
      var assets, nakedAssets;
      view.createBookmarkletContainerIfNotPresent(data);
      assets = assetFinder.findAssets(view.rootDocument);
      nakedAssets = view.nakedifyAssetsFrom(assets);
      view.addAssetsToContainer(nakedAssets);
      return view.removeSpinner();
    };
    view.onCloseDrawer(function() {
      view.removeDrawerFromDom();
      view.removeScripts(global.myd.bookmarklet.scriptsToAdd);
      return view.removeMyDFromGlobalNS();
    });
    return {
      displayDrawer: displayDrawer
    };
  };

}).call(this);
