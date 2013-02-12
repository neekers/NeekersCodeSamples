(function() {
  var serviceModule, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  serviceModule = {
    get: function(options) {
      var request;
      return request = $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: "text/json",
        data: options.data,
        url: window.location.href.indexOf("https://") > -1 ? options.url.replace("http://", "https://") : options.url.replace('https://', 'http://'),
        success: options.success,
        error: options.error
      });
    },
    post: function(options) {
      var request;
      return request = $.ajax({
        type: "POST",
        dataType: 'json',
        contentType: "text/json",
        url: window.location.href.indexOf("https://") > -1 ? options.url.replace("http://", "https://") : options.url.replace('https://', 'http://'),
        data: JSON.stringify(options.data),
        success: options.success,
        error: options.error
      });
    },
    "delete": function(options) {
      var request;
      return request = $.ajax({
        type: "DELETE",
        dataType: 'json',
        contentType: "text/json",
        url: window.location.href.indexOf("https://") > -1 ? options.url.replace("http://", "https://") : options.url.replace('https://', 'http://'),
        data: JSON.stringify(options.data),
        success: options.success,
        error: options.error
      });
    }
  };

  global.myd.serviceModule = serviceModule;

}).call(this);
