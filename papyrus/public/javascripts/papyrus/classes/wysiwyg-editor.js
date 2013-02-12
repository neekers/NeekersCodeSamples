(function() {
  var wysiwygEditor, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  wysiwygEditor = (function(_super) {

    __extends(wysiwygEditor, _super);

    function wysiwygEditor() {
      return wysiwygEditor.__super__.constructor.apply(this, arguments);
    }

    wysiwygEditor.prototype.initialize = function(params) {
      return this.render(params);
    };

    wysiwygEditor.prototype.render = function(params) {
      var _ref1,
        _this = this;
      return this.$el.wymeditor({
        logoHtml: '',
        skinPath: params.skin != null ? "" : "/papyrus/skins/wymeditor/myd/",
        skin: (_ref1 = params.skin) != null ? _ref1 : "compact",
        toolsItems: [
          {
            'name': 'Bold',
            'title': 'Strong',
            'css': 'wym_tools_strong'
          }, {
            'name': 'Italic',
            'title': 'Emphasis',
            'css': 'wym_tools_emphasis'
          }, {
            'name': 'InsertOrderedList',
            'title': 'Ordered_List',
            'css': 'wym_tools_ordered_list'
          }, {
            'name': 'InsertUnorderedList',
            'title': 'Unordered_List',
            'css': 'wym_tools_unordered_list'
          }, {
            'name': 'CreateLink',
            'title': 'Link',
            'css': 'wym_tools_link'
          }
        ],
        containersHtml: "",
        classesHtml: "",
        postInit: function(_wym) {
          _this.wym = _wym;
          return _this.lazy_init();
        },
        basePath: "/javascripts/lib/wymeditor/src/wymeditor/",
        iframeBasePath: "/papyrus/skins/wymeditor/iframe/default/"
      });
    };

    wysiwygEditor.prototype.lazy_init = function() {
      if ((this.html != null) && (this.wym != null)) {
        return this.wym.html(this.html);
      }
    };

    wysiwygEditor.prototype.markdown = function(new_val) {
      if (arguments.length) {
        this.html = markdown.toHTML(new_val != null ? new_val : "");
        return this.lazy_init();
      } else {
        return global.markdown.serialize($("<div>" + (this.wym.html()) + "</div>")[0]);
      }
    };

    return wysiwygEditor;

  })(Backbone.View);

  global.myd.wysiwygEditor = wysiwygEditor;

}).call(this);
