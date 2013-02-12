(function() {
  var _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  $(document).ready(function() {
    var app_view, msieBrowser, msieVersion, rendered_view_html;
    msieBrowser = $.browser.msie;
    msieVersion = $.browser.version;
    if (msieBrowser && msieVersion < 9) {
      this.template = $("#unsupported_browser").html();
      rendered_view_html = Mustache.render(this.template);
      $('body').html(rendered_view_html);
    }
    Backbone.View.prototype.close = function() {
      this.remove();
      this.unbind();
      if (this.onClose != null) {
        return this.onClose();
      }
    };
    app_view = app_view != null ? app_view : new myd.AppView();
    return Backbone.history.start({
      pushState: true,
      root: "/papyrus/"
    });
  });

}).call(this);
