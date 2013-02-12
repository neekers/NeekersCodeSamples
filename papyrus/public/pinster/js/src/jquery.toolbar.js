/**
 * For extracting styles in each element, wherever they come from.
 * 
 * @author Rob
 */
(function($) {

	var box = null;

	$.fn.open = function(opts) {
		box = jQuery("<div id='toolbar' />").css(opts).appendTo("body");
	};

	$.fn.close = function() {
	};

	$.fn.update = function() {

	};

})(jQuery);
