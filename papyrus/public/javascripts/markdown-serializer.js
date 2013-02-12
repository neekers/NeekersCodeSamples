(function() {
  var ensure, indent, inline_element, long_line, wrap, _ref, _ref1, _serialize;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.markdown) == null) {
    global.markdown = {};
  }

  inline_element = function(el) {
    return el && el.nodeType === 1 && {
      a: 1,
      b: 1,
      i: 1,
      em: 1,
      strong: 1
    }[el.nodeName.toLowerCase()];
  };

  wrap = function(before, text, after, force) {
    if (force == null) {
      force = false;
    }
    if (!text.match(/\n/)) {
      return before + text + after;
    }
    return _.map(text.split("\n"), function(line) {
      if (line.length || force) {
        return before + line + after;
      }
      return line;
    }).join("\n");
  };

  long_line = "                                                                                                ";

  indent = function(text, indent) {
    return wrap(long_line.substr(0, indent * 4), text, "");
  };

  ensure = function(text, newlines) {
    if (!text.match("" + newlines + "$")) {
      return text.replace(/\n*$/, newlines);
    }
    return text;
  };

  _serialize = function(el, list_indent) {
    var content, h, _ref2, _ref3, _ref4, _ref5;
    if (list_indent == null) {
      list_indent = 0;
    }
    if (el.nodeType === 1) {
      content = function(indent) {
        return _.map(el.childNodes, function(child) {
          return _serialize(child, indent != null ? indent : list_indent);
        }).join("").replace(/\n{3,}/g, "\n\n");
      };
      switch (el.nodeName.toLowerCase()) {
        case "div":
        case "span":
          return content();
        case "p":
          return ensure(content(), "\n\n");
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          h = "######".substr(0, el.nodeName.toLowerCase().substr(1, 1));
          return ensure(wrap(h + " ", content(), " " + h), "\n\n");
        case "hr":
          return "-------------------------\n\n";
        case "br":
          return "\n\n";
        case "ul":
        case "ol":
          return ensure("\n" + indent(content(list_indent + 1), !!list_indent), list_indent > 0 ? "\n" : "\n\n");
        case "li":
          if (el.parentNode.nodeName.toLowerCase() === "ul") {
            return ensure("*   " + (content()), "\n");
          } else {
            return ensure("1.  " + (content()), "\n");
          }
          break;
        case "em":
        case "i":
          return wrap("_", content(), "_");
        case "strong":
        case "b":
          return wrap("**", content(), "**");
        case "code":
          return wrap("`", content(), "`");
        case "pre":
          if (((_ref2 = el.children[0]) != null ? _ref2.nodeName.toLowerCase() : void 0) === "code") {
            el = el.children[0];
          }
          return ensure(indent(content(), 1), "\n\n");
        case "a":
          return wrap("[", content(), "](" + el.href + ")");
        case "blockquote":
          return wrap("> ", content().replace(/\n+$/, ""), "", true) + "\n\n";
        default:
          return console.log("We don't handle <" + el.nodeName + ">... yet\n");
      }
    } else if (el.nodeType === 3) {
      if (((_ref3 = el.parentNode) != null ? _ref3.nodeName.toLowerCase() : void 0) === "pre" || ((_ref4 = el.parentNode) != null ? (_ref5 = _ref4.parentNode) != null ? _ref5.nodeName.toLowerCase() : void 0 : void 0) === "pre") {
        return el.textContent;
      }
      if (el.textContent.match(/^\s+$/) && (!el.previousSibling || inline_element(el.previousSibling)) && inline_element(el.nextSibling)) {
        return " ";
      }
      if (el.textContent.match(/^\s*$/)) {
        return "";
      }
      return el.textContent.replace(/\n/g, " ").replace(/([\*_])/g, "\\$1").replace(/^([-+>])/g, "\\$1").replace(/^(\d+)\./g, "$1\\.");
    } else {
      return console.log("We don't handle nodeType <" + el.nodeType + ">\n");
    }
  };

  global.markdown.serialize = function(el) {
    return _serialize(el).replace(/^\n+/, "").replace(/\n{2,}$/, "\n");
  };

}).call(this);
