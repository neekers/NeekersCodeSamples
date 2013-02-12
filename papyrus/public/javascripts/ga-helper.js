(function() {
  var GAHelper, _ref, _ref1;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  GAHelper = (function() {

    function GAHelper() {
      var campaignCode;
      campaignCode = this.getParameterByName("utm_campaign");
      if (campaignCode) {
        _gaq.push(['_setCustomVar', 1, 'Member Type', campaignCode, 1]);
      }
    }

    GAHelper.prototype.getParameterByName = function(name) {
      var regex, regexS, results;
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      regexS = "[\\?&]" + name + "=([^&#]*)";
      regex = new RegExp(regexS);
      results = regex.exec(window.location.search);
      if (results === null) {
        return "";
      } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
      }
    };

    return GAHelper;

  })();

  global.myd.GAHelper = GAHelper;

  new global.myd.GAHelper();

}).call(this);
