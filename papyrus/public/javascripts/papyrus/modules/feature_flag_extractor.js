(function() {
  var getQueryParameters, splitParam;

  global.myd || (global.myd = {});

  splitParam = function(param) {
    var result, tmp;
    result = {};
    tmp = param.split("=");
    result[tmp[0]] = unescape(tmp[1]);
    return result;
  };

  getQueryParameters = function() {
    var param, params, _i, _len, _results;
    if (window.location.search) {
      params = window.location.search.slice(1).split("&");
      _results = [];
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        _results.push(splitParam(param));
      }
      return _results;
    }
  };

  global.myd.ResetFeatureFlags = function() {
    var flag, _i, _len, _ref;
    global.myd.feature = {};
    _ref = _.filter(getQueryParameters(), function(param) {
      return !!param.ff;
    });
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      flag = _ref[_i];
      if (flag.ff === "publish") {
        document.cookie = "publish=true;path=/";
      }
      global.myd.feature[flag.ff] = true;
    }
    if (document.domain === "system-integration.collagio.com") {
      return global.myd.feature["testing"] = true;
    }
  };

  if (typeof window !== "undefined" && window !== null) {
    global.myd.ResetFeatureFlags();
  }

}).call(this);
