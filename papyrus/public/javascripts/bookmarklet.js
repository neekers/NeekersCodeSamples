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

  if (global.myd.bookmarklet.bootstrap) {
    return;
  }

  global.myd.bookmarklet.bootstrap = function() {
    var BASE_URL, bringUpUI, insertScriptIntoPage, loaded, nextTurn, script, _i, _len, _ref3, _results;
    BASE_URL = window.TapTapAwesome.BASE_URL.replace(/\/$/, "");
    global.myd.bookmarklet.scriptsToAdd = [
      {
        id: "tta-underscore",
        src: "" + BASE_URL + "/javascripts/lib/underscore.1.3.1.js"
      }, {
        id: "tta-backbone",
        src: "" + BASE_URL + "/javascripts/lib/backbone.0.9.2.js"
      }, {
        id: "tta-handlebars",
        src: "" + BASE_URL + "/javascripts/lib/handlebars-1.0.0.beta.6.js"
      }, {
        id: "tta-assetFinder",
        src: "" + BASE_URL + "/javascripts/assetFinder.js?" + (Date.now())
      }, {
        id: "tta-bookmarklet-view",
        src: "" + BASE_URL + "/javascripts/bookmarklet.view.js?" + (Date.now())
      }, {
        id: "tta-bookmarklet-controller",
        src: "" + BASE_URL + "/javascripts/bookmarklet.controller.js?" + (Date.now())
      }, {
        id: "tta-jquery",
        src: "" + BASE_URL + "/javascripts/lib/jquery-1.8.2.js"
      }
    ];
    loaded = 0;
    insertScriptIntoPage = function(scriptId, scriptPath) {
      var ip, se;
      se = document.createElement('script');
      se.id = scriptId;
      se.type = 'text/javascript';
      se.src = scriptPath;
      se.onload = function() {
        if (++loaded === global.myd.bookmarklet.scriptsToAdd.length) {
          return nextTurn();
        }
      };
      ip = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0];
      return ip.appendChild(se);
    };
    bringUpUI = function($, Handlebars, Backbone, underscore) {
      var controller, url;
      controller = global.myd.bookmarklet.controller({
        view: global.myd.bookmarklet.view($, Handlebars, Backbone, underscore),
        assetFinder: global.myd.assetFinder($)
      });
      url = BASE_URL + '/bookmarklet/grab_content_ui.html';
      return $.get(url).success(function(data) {
        return controller.displayDrawer(data);
      });
    };
    nextTurn = function() {
      var ourBone, ourQuery, ourScore;
      ourQuery = jQuery.noConflict('deep');
      ourScore = _.noConflict();
      ourBone = Backbone.noConflict();
      ourBone.setDomLibrary(ourQuery);
      return bringUpUI(ourQuery, Handlebars, ourBone, ourScore);
    };
    _ref3 = global.myd.bookmarklet.scriptsToAdd;
    _results = [];
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      script = _ref3[_i];
      _results.push(insertScriptIntoPage(script.id, script.src));
    }
    return _results;
  };

  global.myd.bookmarklet.bootstrap();

}).call(this);
