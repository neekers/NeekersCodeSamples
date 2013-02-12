(function ($) {
    var rorigin = /^(?:([\w\+\.\-]+):)?\/\/([^\/?#:]*)(?::(\d+))?/;
    $.origin = function(url) { // This function is equivalent to anchor.origin in Chrome
        url = $("<a>").attr('href', url)[0].href; // Normalize the protocol in an IE9 safe way
        var m = rorigin.exec(url);
        if (m) return m[0]; else throw("bad url: " + url);
    };
})(jQuery);

(function($) {

    var toolbar = null;
    var shutdown = null;

    var globals = {
        lightbox : null,
        extractor: null,
        serverDomain : "",
        pinsterRoot: "",
        logoImageUrl : "{serverDomain}/images/pinster-toolbar-logo.png",
        scissorsImageUrl : "{serverDomain}/images/icon-scissor.png",
        scissorsImageUrlLarge: "{serverDomain}/images/pinster-scissors-lrg.png",
        closePinsterUrl : "{serverDomain}/images/pinster-toolbar-close.png",
        rssImageUrl: "{serverDomain}/images/pinning-rss.png",
        body: null
    }


    function openLightbox (element) {
        if (globals.lightbox !== null) return;

        var extractedObj = globals.extractor.extract(element);
        if (extractedObj.items.length > 0)
            globals.lightbox = new collagio.PinsterLightbox({
                pinsterRoot: globals.pinsterRoot,
                serverDomain: globals.serverDomain,
                extracted: extractedObj,
                rssFeeds: globals.rssFeeds,
                onClose: closeLightbox

            });
        else{
            closeLightbox();
        }
    }

    function closeLightbox (params) {
        if (typeof params === "undefined") params = {};
                    

        globals.extractor.setDisableRollover(false);
        $("body").removeClass("noscroll");
        $("body").width(globals.body.bodyWidth).css({margin: globals.body.bodyMargin, position: globals.body.bodyPosition, overflow: globals.body.bodyOverflow});

        var lightbox = globals.lightbox; globals.lightbox = null;
        $('#pinster-lightbox').addClass("pinster-animated-fast pinster-bounce-out");
        $('#pinster-clearout').animate({opacity:0}, 750, function () {
            lightbox.getEl().remove();
            if (typeof params.shutdown !== "undefined") shutdown();
        });
        return false;
    }

    function grabRssFeed(){
        if (globals.rssFeeds.length){
            openLightbox(globals.rssFeeds[0].href)
        }
        else{ //RSS Feed Page. ONLY works in Chrome
            openLightbox(window.location.href);
        }
        return false;
    }

    function renderToolbar(){
        toolbar = $(
            "<div id='pinster-toolbar' class='pinster-removable pinster-animated pinster-bounce-in-down'>"
                +   "<a id='pinster-collagio-logo' title='Go to Collagio' href='#'><img src='"+globals.logoImageUrl+"' /></a>"
                +   "<a id='pinster-select-site' title='Grab Entire Page' href='#'><img src='"+globals.scissorsImageUrl+"' /></a>"
                +   "<a id='pinster-select-rss' style='display: none;' title='Grab RSS Feed' href='#'><img src='"+globals.rssImageUrl+"' /></a>"
                +   "<a id='pinster-close-button' title='Close +Collagio' href='#'><img src='"+globals.closePinsterUrl+"' /></a>"
                +   "<div id='pinster-progress' style='display: none;'><span>&nbsp;</span></div>"
                + "</div>"
        );
        //Are there any rss feeds on this page?
        globals.rssFeeds = $("link[type='application/rss+xml']");
        if (window.location.href.indexOf(".xml") > -1 || globals.rssFeeds.length > 0){
            toolbar.find("#pinster-select-rss").css("display", "table-cell");
        }
        toolbar.appendTo("body");
        toolbar.mouseenter(function() {
            globals.extractor.setDisableRollover(true);
        });
        toolbar.mouseleave(function() {
            if (document.body.style.cursor === 'wait') return false;
            globals.extractor.setDisableRollover(false);
        });
        $("#pinster-select-rss").click(grabRssFeed);
        if (($.browser.msie && $.browser.msie && parseInt($.browser.version, 10) >= "10") || typeof($.browser.msie) === "undefined"){
            $("#pinster-select-site").mouseenter(function(){
                if ($("#pinster-site-block").length > 0) return;

                $("body").append("<div id='pinster-site-block' class='pinster-removable'><div id='pinster-site-message'><div id='pinster-block-inner'>"
                    + "Grab entire page"
                    + "</div></div></div>");
            });

            $("#pinster-select-site").mouseleave(function(){
                $("#pinster-site-block").remove();
            });
            $("#pinster-select-site").click($.proxy(globals.extractor.grabEntirePage, globals.extractor));

        }
        else{
            $("#pinster-select-site").hide();
        }
        $("#pinster-close-button").click(function() {
            shutdown();
            return false;
        });
        $("#pinster-collagio-logo").attr("href", globals.serverDomain);
    }

    // CONSTRUCTOR
    $.fn.pinster = function(serverDomain, pinsterRoot, bookmarkletVersion) {
        if (typeof omnicollagio !== "undefined"){
            omnicollagio.tl(this, 'o', document.title);
        }

        for (key in globals)
            if (typeof globals[key] == "string")
                globals[key] = globals[key].replace("{serverDomain}",serverDomain).replace("{pinsterRoot}", pinsterRoot);

        globals.body = {
            bodyWidth: $("body").width(),
            bodyMargin: $("body").css("margin"),
            bodyPosition: $("body").css("position"),
            bodyOverflow: $("body").css("overflow")
        };

        globals.serverDomain = serverDomain;
        globals.pinsterRoot = pinsterRoot;
        globals.extractor = new collagio.PinsterExtractor({ pinsterRoot: pinsterRoot,
                                                            serverDomain: serverDomain,
                                                            onExtracted: openLightbox,
                                                            body: globals.body
        });

        renderToolbar();

        shutdown = function() {
            $(document).unbind('.pinster');
            globals.extractor.setDisableRollover(true);
            document.body.style.cursor = 'default';

            $("body").unbind('.pinster').removeClass("noscroll").width(globals.body.bodyWidth).css({margin: globals.body.bodyMargin, position: globals.body.bodyPosition, overflow: globals.body.bodyOverflow});

            $('#pinster-toolbar').addClass("pinster-animated pinster-bounce-out-up");
            $('#pinster-toolbar').animate({opacity:0},500,function () {
                $(".pinster-removable").remove();
                $(".pinster-resource").remove();
            });
            $('#pinster-highlight').animate({opacity:0},200);

            if (navigator.userAgent.match(/Windows NT/i))
                $('iframe[data-pinster-original-url]').each(function () {
                    this.src = this.getAttribute('data-pinster-original-url');
                    this.removeAttribute('data-pinster-original-url');
                });
        };

        // WINDOWS ONLY CODE
        if (navigator.userAgent.match(/Windows NT/i)) { // flash on windows is not transparent by default and cannot be highlighted or clicked on

            // wrap=>unwrap = a way of restarting the flash object
            if ($.browser.mozilla){
                $("embed[wmode=window], embed:not([wmode])").attr("wmode", "opaque").redrawVideo();
            }

            $("object:has(param[name=wmode][value=window]), object:not(:has(> param[name=wmode]))").each(function() {
                this.outerHTML = this.outerHTML.replace(/<(?:[^">]+|(["']).*?\1)*>/g, '$&<param name="wmode" value="opaque"/>');
            });

            $('iframe').each(function() {
                var item = globals.extractor.extract($(this));
                if (item && (!this.src.match(/\bwmode=opaque\b/i) || this.src.match(/youtube\.googleapis\.com\//)/*doesn't respect wmode*/)) {
                    this.setAttribute('data-pinster-original-url', this.src);
                    this.src = item.asset_url + "?wmode=opaque";
                }
            });
        }

        $(document).bind('keyup.pinster', function(e) {
            if (e.keyCode == 27/*ESC*/) {
                globals.lightbox ? closeLightbox() : shutdown();
                e.preventDefault();
            }
        });

        document.body.style.cursor = 'default';
    };

})(jQuery);