/**
 * For extracting styles in each element, wherever they come from.
 * 
 * @author Rob
 */
(function($) {

	$.fn.getInlineStyles = function(source) {
		var dom = $(source).get(0);
		var style;
		var dest = {};
		if (window.getComputedStyle) {
			var camelize = function(a, b) {
				return b.toUpperCase();
			};
			style = window.getComputedStyle(dom, null);
			for ( var i = 0, l = style.length; i < l; i++) {
				var prop = style[i];
				var camel = prop.replace(/\-([a-z])/g, camelize);
				var val = style.getPropertyValue(prop);
				dest[camel] = val;
			}
			;
			return dest;
		}
		;
		if (style = dom.currentStyle) {
			for ( var prop in style) {
				dest[prop] = style[prop];
			}
			;
			return dest;
		}
		;
		if (style = dom.style) {
			for ( var prop in style) {
				if (typeof style[prop] != 'function') {
					dest[prop] = style[prop];
				}
				;
			}
			;
		}
		;
		return dest;
	};

	$.fn.copyCSS = function(source) {
		return this.css($.fn.getInlineStyles(source));
	};

	$.fn.inlineAllStyles = function() {
		if (this.has("class")) {
			console.log("inlining styles on: " + this.html() + " of class: " + $(this).attr("class"));
			var computedStyles = $.fn.getInlineStyles(this);
			$(this).css(computedStyles);
			$(this).removeAttr("class");
		}
		console.log("html after inlining: " + $(this).html());
	};
	
	$.fn.getAllInlineStyles = function() {
		var styles = {};
		if (this.has("class")){
			var cssclass = this.attr("class");
			alert("found css class: " + cssclass);
//			if (typeof styles[cssclass]===undefined){
				console.log("found class: " + cssclass);
				styles[cssclass] = $.fn.getInlineStyles(this);
//			}
		}
		return styles;
	};

	.fn.elementHtml = function(s) {
		return $("<p>").append(this.eq(0).clone().css($.fn.getInlineStyles(this))).html();
	};

})(jQuery);
