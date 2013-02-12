(function() {
  var routesModule, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  routesModule = {
    getRoutesFromRelativePath: function(pathname) {
      var pathnameWithLeadingSlash;
      if (pathname.substr(0, 1) === '/') {
        pathnameWithLeadingSlash = pathname;
      } else {
        pathnameWithLeadingSlash = '/' + pathname;
      }
      return {
        pathname: pathnameWithLeadingSlash,
        getPapyrusPath: function(screenId) {
          if (screenId != null) {
            return "/c" + pathnameWithLeadingSlash + "/screens/" + (encodeURIComponent(screenId));
          } else {
            return "/c" + pathnameWithLeadingSlash;
          }
        }
      };
    },
    getRoutesFromUrl: function(url, alwaysRefresh) {
      var pathname;
      pathname = new myd.Uri(url).getPathname();
      return {
        pathname: pathname,
        getPapyrusPath: function(screenId) {
          if (screenId != null) {
            return "/c" + pathname + "/screens/" + (encodeURIComponent(screenId));
          } else {
            return "/c" + pathname;
          }
        }
      };
    }
  };

  global.myd.routesModule = routesModule;

}).call(this);
