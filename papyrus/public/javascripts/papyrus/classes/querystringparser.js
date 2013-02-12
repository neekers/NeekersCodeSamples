(function() {
  var QueryStringParser, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  QueryStringParser = (function() {

    function QueryStringParser(queryString) {
      this.queryItems = this.buildQueryItems(queryString);
    }

    QueryStringParser.prototype.buildQueryItems = function(queryString) {
      return _.chain(queryString.split('&')).map(function(keyValue) {
        return keyValue.split('=');
      }).map(function(_arg) {
        var key, value;
        key = _arg[0], value = _arg[1];
        return {
          key: key.toLowerCase(),
          value: value
        };
      }).value();
    };

    QueryStringParser.prototype.get = function(key) {
      return _.find(this.queryItems, function(item) {
        return item.key === key.toLowerCase();
      });
    };

    QueryStringParser.prototype.getQuery = function() {
      var keyValues;
      keyValues = _.map(this.queryItems, function(item) {
        return "" + (encodeURIComponent(item.key)) + "=" + (encodeURIComponent(item.value));
      });
      return "?" + keyValues.join("&");
    };

    return QueryStringParser;

  })();

  global.myd.QueryStringParser = QueryStringParser;

}).call(this);
