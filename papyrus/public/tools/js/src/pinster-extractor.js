(function ($) {

    if (typeof collagio === "undefined"){
        collagio = {}
    }

    collagio.PinsterExtractor = Class.extend({
        VideoSiteNotSupported: "Video from this site not supported",

        options: {},
        last: null,
        highlight: null,
        selectedElement: null,
        disableRollover: false,

        urls: {
            arrowImageUrl : "{serverDomain}/images/pinning-web-arrow.png"
        },

        getHighlight: function(){
            return this.highlight;
        },
        setHighlight: function(value){
            this.highlight = value;
        },
        getSelectedElement: function(){
            return this.selectedElement;
        },
        setSelectedElement: function(value){
            this.selectedElement = value;
        },
        getDisableRollover: function(){
          return this.disableRollover;
        },
        setDisableRollover: function(value){
            if (value) this.getHighlight().toggle(!value);

            this.disableRollover = value;
        },
        getOptions: function(){
            return this.options;
        },
        setOptions: function(value){
            this.options = value;
        },

        init: function(options){

            for (key in this.urls)
                if (typeof this.urls[key] == "string")
                    this.urls[key] = this.urls[key].replace("{serverDomain}",options.serverDomain).replace("{pinsterRoot}", options.pinsterRoot);

            if (typeof options === "undefined"){
                options = {
                    onExtracted: null,
                    body: null,
                    pinsterRoot: "http://local.collagio.com:9292"
                }
            }
            this.setOptions(options);

            this.setHighlight($("<div id='pinster-highlight' class='pinster-removable' />").css({
                display : "none",
                position : "absolute"
            }).appendTo("body"));

            $(document).bind('click.pinster', $.proxy(this.onClick, this));

            this.last = +new Date;
            $("body").bind('mousemove.pinster', $.proxy(this.highlightMove, this));
        },

        highlightMove: function(e) {
            if ((this.getDisableRollover()))
                return;

            var lastTarget = this.getSelectedElement();
            var offset, el = e.target;
            var now = +new Date;
            if (now - this.last < 25)
                return;
            this.last = now;
            if (el === document.body) {
                this.getHighlight().hide();
                this.setSelectedElement(null);
                return;
            } else if (el.id === "pinster-highlight") {
                this.getHighlight().hide();
                el = document.elementFromPoint(e.clientX, e.clientY);
                this.setSelectedElement(el);
            }
            this.getHighlight().show();

            if (el === lastTarget)
                return;
            this.setSelectedElement(el);
            el = $(el);
            offset = el.offset();

            var extractableObj = this.extractable(el);
            this.getHighlight().toggleClass("extractable", !!extractableObj.extractable);
            var toolTip = $("#pinster-tooltip");
            if (!extractableObj.extractable){
                if (toolTip.length === 0){
                    $("<div id='pinster-tooltip'><div id='pinster-tooltip-notch'></div><div id='pinster-tooltip-content'>").appendTo("body");
                    toolTip = $("#pinster-tooltip");
                }
                toolTip
                    .css({
                        position: "absolute",
                        top: offset.top - 60,
                        left: offset.left + (el.outerWidth()/2)
                    })
                    .show()
                    .find("#pinster-tooltip-content").text(extractableObj.message);
                toolTip.css({
                    left: (offset.left + (el.outerWidth()/2)) - toolTip.outerWidth()/2
                });
            }
            else{
                toolTip.hide();
            }

            this.getHighlight().css({
                width : el.outerWidth() - 1,
                height : el.outerHeight() - 1,
                left : offset.left,
                top : offset.top
            });
        },

        onClick: function() {
            var el = $(this.getSelectedElement());

            if (this.getDisableRollover() || !this.getSelectedElement() || !this.extractable(el).extractable)
                return;

            // Fire event top open lightbox
            if (typeof this.getOptions().onExtracted !== "undefined"){
                this.setDisableRollover(true);
                this.getOptions().onExtracted(el);
            }

            return false;
        },

        grabEntirePage: function(){
            document.body.style.cursor = 'wait';

            this.setDisableRollover(true);

            $("#pinster-toolbar > a").hide();
            $("#pinster-progress").show();

            $("body").addClass("noscroll").append("<div id='pinster-site-block' class='pinster-removable'>");

            //Have to load the image so that html2canvas can convert it to base64 for drawing
            $("body").prepend("<div class='pinster-temp pinster-removable' style='visibility: hidden;'><img src='"+ this.urls.arrowImageUrl +"' /></div>");

            //Let's hide the images we're not using in the screen shot
            $("*").each(function(index, el){
                var target = $(el);
                var top = target.offset().top;
                if (target.is("img") && top > 1000){
                    target.attr("old_src", target.attr("src")).attr("src", "");
                }
            });

            html2canvas( [ document.body ], {
                //logging: true,
                useOverflow: true,
                timeout: 30000,
                proxy: "//plus.collagio.com/",
                onpreloaded: function(){
                    $("#pinster-site-block, #pinster-clearout").remove();
                    //Hide all of our stuff to not be in the shot
                    $(".pinster-resource, .pinster-removable").hide();

                    //Make a nice overlay for the screenshot
                    $("body").width("1024").css({margin: "0 auto", position: "relative", overflow: "hidden"});
                    $("body").append("<div id='pinster-overlay-container' class='pinster-removable pinster-temp'><div id='pinster-site-overlay'><div id='pinster-site-arrow'></div></div></div>");
                    $("#pinster-site-overlay").append("<div id='pinster-site-info'><div id='pinster-site-inner'> "
                        + "<div id='pinster-site-title'>"+document.title+"</div>"
                        + "<div id='pinster-site-domain'>"+document.domain.replace("www.","")+"</div></div>");
                },
                onrendered:$.proxy(this.processCanvas, this)
            });
            return false;
        },

        processCanvas: function( canvas ) {
            //console.log("sshot");
            $("*").each(function(index, el){
                var target = $(el);
                if (target.attr("old_src")){
                    target.attr("src", target.attr("old_src"));
                }
            });

            $("body").width(this.getOptions().body.bodyWidth)
                .css({margin: this.getOptions().body.bodyMargin,
                    position: this.getOptions().body.bodyPosition,
                    overflow: this.getOptions().body.bodyOverflow});

            $("#pinster-toolbar > a").show();
            $("#pinster-progress").hide();
            $(".pinster-temp").remove();
            $("#pinster-site-overlay").remove();
            $(".pinster-resource, .pinster-removable").show();

            // Fire event top open lightbox
            if (typeof this.getOptions().onExtracted !== "undefined"){
                this.setDisableRollover(true);
                this.getOptions().onExtracted(canvas);
            }

        },

        extractable: function($el) {
            var returnObj = { extractable: false, message: null};
            returnObj = this.isImage($el);

            //Try for a video
            if (!returnObj.extractable && returnObj.message === null){
                returnObj = this.isYouTubeVideo($el);
            }

            if (!returnObj.extractable && returnObj.message === null){
                returnObj = this.isTextBlock($el);
            }

            return returnObj;
        },

        isImage: function(el){
            var returnObj = { extractable: false, message: null};

            if (el.is("a") && el.children().length === 1 && el.children()[0].tagName.toLowerCase() === "img"){
                el = el.children().first();
            }
            var largeEnough = this.isImageLargeEnough(el);
            if (el.is("img") && el.attr('src') && largeEnough){
                returnObj.extractable = true;
                returnObj.message = "element found";
            }
            else if (el.is("img") && !el.attr('src')){
                returnObj.message = "Image has no source";
            }
            else if (el.is("img") && el.attr('src') && !largeEnough){
                returnObj.message = "Image not large enough";
            }

            return returnObj;
        },

        isImageLargeEnough: function(img){
            return (img.width() > 50 && img.height() > 50) || (img[0].width > 50 && img[0].height > 50);
        },

        isTextBlock: function($el){
            var returnObj = { extractable: false, message: null};

            returnObj.extractable = $el.is("div") ||
                $el.is("h1") ||
                $el.is("h2") ||
                $el.is("h3") ||
                $el.is("ul") ||
                $el.is("ol") ||
                $el.is("li") ||
                $el.is("p") ||
                $el.is("blockquote") ||
                $el.is("section") ||
                $el.is("article") ||
                $el.is("strong") ||
                $el.is("em");

            if (returnObj.extractable)
                returnObj.message = "Text found";
            else
                returnObj.message = "Cannot be grabbed";

            return returnObj;
        },

        isHeadline: function($el){
            return $el.is("h1, h2, h3")
        },

        isYouTubeVideo: function($el) {
            var returnObj = { extractable: false, youtubeId: null, message: null};

            if (typeof $el.is === "undefined") return returnObj;

            var src, flashvars, param = function($el,name) { var p = $el.find("param[name=" + name + "]"); return p ? p.attr('value') : null; }

            if ($el.is("video")){
                if ($el.data('youtube-id')){
                    returnObj.extractable = true;
                    returnObj.message = "HTML5 video found.";
                    returnObj.youtubeId = $el.data('youtube-id');
                }
                else{
                    returnObj.message = this.VideoSiteNotSupported
                }
            }

            else if (src = $el.is("iframe") || $el.is("embed") ? $el.attr('src') : $el.is('object') ? param($el, 'movie') : null) {
                var m = src.match(/youtube(?:-nocookie|\.googleapis)?\.com\/(?:embed|v)\/([-\w]+)/); // http://apiblog.youtube.com/2010/07/new-way-to-embed-youtube-videos.html
                if (m){
                    returnObj.extractable = true;
                    returnObj.message = "Video embed or iframe found";
                    returnObj.youtubeId = m[1];
                }
                else{
                    returnObj.message = this.VideoSiteNotSupported;
                }
            }

            if (flashvars = $el.is("embed") ? $el.attr('flashvars') : $el.is("object") ? param($el, 'flashvars') : null) {
                var m = flashvars.match(/\bvideo_id=([-\w]+)/); // https://www.youtube.com/watch?v=YkS9EJmUuSo
                if (m){
                    returnObj.extractable = true;
                    returnObj.message = "Video embed found";
                    returnObj.youtubeId = m[1];
                }
                else{
                    returnObj.message = this.VideoSiteNotSupported;
                }
            }

            return returnObj;
        },

        extract: function(el) {
            var extracted = { type: "image", items: [] }, baseItem = { source_page_url: window.location.href };

            //Adjust for links and images
            if (typeof el.is !== "undefined" && el.is("a") && el.children().length === 1 && el.children()[0].tagName.toLowerCase() === "img"){
                el = el.children().first();
            }

            //check for RSS feed here
            if (typeof el === "string"){
                baseItem.type = "FeedAsset";
                extracted.type = baseItem.asset_type = "feed";
                baseItem.feed_url = el;
                extracted.items.push(baseItem);
                return extracted;
            }

            //Web site canvas
            if((el.is && el.is("canvas")) || (el.tagName && el.tagName.toLowerCase() === "canvas")){
                baseItem.type = 'ImageAsset';
                extracted.type = baseItem.asset_type = "image";
                baseItem.canvas = el;
                baseItem.description = "pluscollagio:website";
                extracted.items.push(baseItem);
                return extracted;
            }

            var isYouTube = this.isYouTubeVideo(el);
            if (isYouTube.extractable) {
                baseItem.type = 'VideoAsset';
                extracted.type = baseItem.asset_type = "video";
                baseItem.title = el.attr('title');
                baseItem.youtube_id = isYouTube.youtubeId;
                baseItem.asset_url = 'http://www.youtube.com/embed/' + isYouTube.youtubeId;
                baseItem.preview_image_url = 'http://img.youtube.com/vi/' + isYouTube.youtubeId + '/0.jpg';
                extracted.items.push(baseItem);
                return extracted;
            }
            var isImage = this.isImage(el);
            if (isImage.extractable) {
                baseItem.type = 'ImageAsset';
                extracted.type = baseItem.asset_type = "image";
                baseItem.title = el.attr('alt');
                baseItem.description = el.attr('title');
                baseItem.asset_url = el[0].src; // .src is fully qualified even if .attr('src') is not
                extracted.items.push(baseItem);
                return extracted;
            }

            if(this.isTextBlock(el)){
                extracted.type = "fact";

                //Remove some bad bad tags
                el.find("script, noscript, object, embed").remove();

                //Loop through all children elements
                var totalChildren = el.find("*"), sectionChildren = el.find("div, section, p, li");

                //We can grab the entire element and display it because there are no good children there
                if (sectionChildren.length === 0){
                    var newItem = $.extend({}, baseItem);
                    newItem.type = 'FactAsset';
                    newItem.asset_type = "fact";

                    var contentHTML = $("<div>").html(el.clone())[0];
                    var siteMarkdown = global.markdown.serialize(contentHTML);
                    newItem.title = " ";
                    newItem.text = siteMarkdown;
                    newItem.html = markdown.toHTML(siteMarkdown);
                    extracted.items.push(newItem);

                    return extracted;
                }

                _.each(totalChildren, function(childNode, idx){
                    //console.log("extractable?: " + childNode.tagName.toLowerCase());

                    var contentNode = $(childNode).clone();

                    //Remove all the other crap tags underneath
                    contentNode.find("> *:not(a,b,i,strong,em)").remove();

                    if (this.extractable(contentNode).extractable){
                        var newItem = $.extend({}, baseItem);
                        var isVideo = this.isYouTubeVideo(contentNode);
                        if (!isVideo.extractable && contentNode.is("iframe")){
                            //console.log("Remove iframe");
                            return;
                        }
                        if (isVideo.extractable){
                            //console.log("%cyoutubeID - " + videoId, "color:red; font-weight: bold; font-size: 15px;");
                            newItem.type = 'VideoAsset';
                            newItem.asset_type = "video";
                            newItem.title = contentNode.attr('title');
                            newItem.youtube_id = isVideo.youtubeId;
                            newItem.asset_url = 'http://www.youtube.com/embed/' + isVideo.youtubeId;
                            newItem.preview_image_url = 'http://img.youtube.com/vi/' + isVideo.youtubeId + '/0.jpg';
                            extracted.items.push(newItem);
                        }
                        else if (this.isImage(contentNode).extractable){
                            //console.log("image asset");
                            newItem.type = "ImageAsset";
                            newItem.asset_type = "image";
                            newItem.asset_url = contentNode.attr("src");

                            extracted.items.push(newItem);
                            //console.log(" -- extracted: " + childNode.tagName.toLowerCase());
                            //console.log("%c -- extracted content: " + contentNode.text(), 'color: red; font-weight: bold;');
                        }
                        else{
                            //console.log("fact asset");
                            newItem.type = 'FactAsset';
                            newItem.asset_type = "fact";

                            //Empty elements
                            if (contentNode.text().trim().length === 0) {
                                //console.log("%cempty element: " + contentNode.text(), 'color: purple; font-weight: bold');
                                //console.log(contentNode);
                                //console.log(siteMarkdown);
                                return;
                            }

                            if (this.isHeadline(contentNode)){
                                //console.log("found headline - " + contentNode.text());
                                newItem.title = contentNode.text();
                                newItem.headline = true;
                                extracted.items.push(newItem);
                                return
                            }

                            //Combine this element with the last asset because it was a fact
                            var prevFact = false;
                            if (extracted.items.length > 1){
                                var prevNode = extracted.items[extracted.items.length-1];
                                prevFact = (prevNode.type === "FactAsset");
                            }
                            //console.log("%c prevFact: " + prevFact,'color:blue');

                            if (!prevFact){
                                // Find a previous headline for this
                                if (extracted.items.length > 0){
                                    for (var k=extracted.items.length-1;k>-1;k--){
                                        if (extracted.items[k].headline && typeof extracted.items[k].text === "undefined"){
                                            newItem.title = extracted.items[k].title;
                                            extracted.items.splice(k,1);
                                            break;
                                        }
                                    }
                                }

                                if (typeof newItem.title === "undefined") newItem.title = " ";
                                newItem.html = contentNode.html();
                                newItem.childIndex = idx; //For tracking later on to see if it has the same parent or not

                                //console.log("-- extracted: " + childNode.tagName.toLowerCase());
                                //console.log("%c-- extracted content: " + contentNode.text(), 'color: red; font-weight: bold;');

                                extracted.items.push(newItem);
                            }
                            else{ //Append to the other fact
                                //console.log("%cprev fact combo: " + contentNode.text(), "color: orange; font-weight: bold;");
                                newItem = extracted.items[extracted.items.length-1];
                                newItem.html += "<br /><br />"+contentNode.html();
                            }
                        }
                    }
                }, this);

                //Clean up the html of each fact asset
                _.each(extracted.items, function(element, index, list){
                    if (element.asset_type === "fact"){
                        var contentHTML = $("<div>").html(element.html)[0];
                        var siteMarkdown = global.markdown.serialize(contentHTML);
                        element.text = siteMarkdown;
                        element.html = markdown.toHTML(siteMarkdown);
                    }

                });

                //console.log("%cextracted length: " + extracted.items.length, 'font-weight: bold; background-color: yellow;');
                //console.log(extracted.items);
                return extracted;
            }
        }

    });

})(jQuery);