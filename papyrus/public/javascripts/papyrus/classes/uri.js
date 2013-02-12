(function() {
  var Uri, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  Uri = (function() {

    function Uri(url) {
      var queryString;
      this.parser = document.createElement('a');
      this.parser.href = url;
      queryString = this.parser.search.slice(1);
      this.queryItems = this.buildQueryItems(queryString);
    }

    Uri.prototype.toString = function() {
      return this.getProtocol() + "//" + this.getHost() + this.getPathname() + this.getQuery() + this.getHash();
    };

    Uri.prototype.buildQueryItems = function(queryString) {
      return _.chain(queryString.split('&')).map(function(keyValue) {
        return keyValue.split('=');
      }).map(function(_arg) {
        var key, value;
        key = _arg[0], value = _arg[1];
        return {
          key: decodeURIComponent(key).toLowerCase(),
          value: decodeURIComponent(value)
        };
      }).value();
    };

    Uri.prototype.get = function(key) {
      return _.find(this.queryItems, function(item) {
        return item.key === key.toLowerCase();
      });
    };

    Uri.prototype.set = function(key, value) {
      var item;
      item = this.get(key);
      if (item != null) {
        return item.value = value;
      } else {
        return this.queryItems.push({
          key: key,
          value: value
        });
      }
    };

    Uri.prototype.getQuery = function() {
      var keyValues;
      keyValues = _.map(this.queryItems, function(item) {
        return "" + (encodeURIComponent(item.key)) + "=" + (encodeURIComponent(item.value));
      });
      return "?" + keyValues.join("&");
    };

    Uri.prototype.getProtocol = function() {
      return this.parser.protocol;
    };

    Uri.prototype.getHost = function() {
      return this.parser.host;
    };

    Uri.prototype.getHostname = function() {
      return this.parser.hostname;
    };

    Uri.prototype.getPort = function() {
      return this.parser.port;
    };

    Uri.prototype.getPathname = function() {
      var pathname;
      pathname = this.parser.pathname;
      if (pathname.charAt(0) !== "/") {
        return "/" + pathname;
      } else {
        return pathname;
      }
    };

    Uri.prototype.getHash = function() {
      return this.parser.hash;
    };

    return Uri;

  })();

  global.myd.Uri = Uri;

}).call(this);
