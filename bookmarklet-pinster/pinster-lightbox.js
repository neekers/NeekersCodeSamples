(function ($) {

    if (typeof collagio === "undefined"){
        collagio = {}
    }

    collagio.PinsterLightbox = Class.extend({

        options: {},

        urls: {
            closeImageUrl : "{serverDomain}/images/close-button.png",
            prevArrowImageUrl: "{serverDomain}/images/pinning-arrow-back.png",
            nextArrowImageUrl: "{serverDomain}/images/pinning-arrow-forward.png",
            trashImageUrl : "{serverDomain}/images/icon-trash.png",
            userUrlsUrl : "{serverDomain}/api",
            s3UserUrl : "{serverDomain}/api/users/s3",
            frameUrl : "{serverDomain}/tools/frame.html",
            postUrl : "{serverDomain}/api/collections/{selectedCollectionUrl}/new_item",
            collectionUrl : "{serverDomain}/api/collections/{selectedCollectionUrl}",
            collectionSyncUrl : "{serverDomain}/api/collections/{selectedCollectionUrl}/sync",
            authCheckUrl : "{serverDomain}/auth/check",
            topicsUrl : "{serverDomain}/api/topics",
            authUrl : "{serverDomain}/auth/login?close=1"
        },

        el: null,
        excerpt: null,
        excerptList: null,
        indexEl: null,
        my_collection_list : "",
        create_collection: "",
        selectedCollectionUrl: "",
        selectedTopicUrl: "",
        selectedFeedUrl: "",
        s3: null,
        user : null,
        currentAssetIndex: 0,
        assetWidth: 610,
        RSS_OPTIONS: {
            limit: 3,
            header: true,
            snippet: false,
            content: true,
            linktarget: "_blank"
        },

        getOptions: function(){
            return this.options;
        },
        setOptions: function(value){
            this.options = value;
        },
        getEl: function(){
            return this.el;
        },
        setEl: function(value){
            this.el = value;
        },

        init: function(options){

            for (key in this.urls)
                if (typeof this.urls[key] == "string")
                    this.urls[key] = this.urls[key].replace("{serverDomain}",options.serverDomain).replace("{pinsterRoot}", options.pinsterRoot);

            if (typeof options === "undefined"){
                options = {
                    extracted: null,
                    onClose: null
                }
            }
            this.setOptions(options);

            $("body").addClass("noscroll");

            this.authenticate();
            this.generateContent(this.getOptions().extracted);
        },

        generateContent: function(extracted) {

            var $content;

            $content = $(
                '<div class="pinster-resource pinster-removable ' + extracted.type + '">'
                    +     '<div id="pinster-clearout">'
                    +     '<div id="pinster-lightbox">'
                    +         '<div id="pinster-disabled-overlay"><div id="pinster-disabled-wrapper"><div id="pinster-disabled-inner">'
                    +           '<h3 style="display: none;">Please <button id="pinster-collagio-login">Login</button> to use +Collagio</h3>'
                    +         '</div></div></div> '
                    +         '<a id="pinster-cancel-button" href="#"><img src="'+ this.urls.closeImageUrl +'" /></a>'
                    +         '<div id="pinster-excerpt" class="' + extracted.type + '"></div>'
                    +         '<div id="pinster-submit-in-progress" style="display:none"></div>'
                    +         '<div id="pinster-submit-error" style="display:none"><h3>Oops!</h3><p>We were not able to submit your '+ extracted.type +'.<br />Please try saving again.</p></div>'
                    +         '<div id="pinster-submit-success" style="display:none"></div>'
                    +         '<div id="pinster-lightbox-controls">'
                    +             '<textarea id="pinster-caption" placeholder="Add a caption ..."></textarea>'
                    +             '<div id="pinster-button-bar">'
                    +                 '<div id="pinster-topic-title-error-message" class="error-message" style="display: none;">Please enter a title</div>'
                    +                 '<div id="pinster-topic-error-message" class="error-message" style="display: none;">Please select a topic</div>'
                    +                 '<div id="pinster-dropdown-container" class="dropdown">'
                    +                   '<div id="pinster-error-message" class="error-message" style="display: none;">Please select a collage</div>'
                    +                   '<div class="pinster-selected-collage">Select a Collage</div>'
                    +                   '<div class="pinster-notch"></div>'
                    +                   '<ul id="pinster-options"></ul>'

                    +                   '<div id="pinster-new-collage">'
                    +                       '<a id="pinster-new-collage-button" href="#">Create New Collage</a>'
                    +                   '</div>'

                    +                 '</div>'

                    +               '<input id="pinster-collage-title" style="display: none;" placeholder="Create New Collage" />'
                    +               '<div id="pinster-topic-dropdown-container" class="dropdown" style="display: none;">'
                    +                   '<div class="pinster-selected-topic">Select a Topic</div>'
                    +                   '<div class="pinster-notch"></div>'
                    +                   '<ul id="pinster-topic-options"></ul>'

                    +                   '<div id="pinster-new-collage">'
                    +                       '<a id="pinster-new-collage-button" href="#">Create New Collage</a>'
                    +                   '</div>'

                    +               '</div>'

                    +               '<a id="pinster-save-button" class="inactive" disabled="true">Add</a>'
                    +               '<div id="fileupload" style="display: none;"></div> '
                    +         '</div></div>'
                    +     '</div>'
                    + '</div></div>'
            );

            if (extracted.type === "fact" || extracted.type === "feed"){
                $content.find("#pinster-caption").hide();
            }

            this.excerpt = $content.find('#pinster-excerpt');
            if (extracted.items.length === 1 && extracted.type !== "feed"){
                this.excerpt.append(this.renderItem(extracted.items[0]));
                this.excerpt.find(" > img").aeImageResize( {height:500, width: 600});
            }
            else if (extracted.type === "feed"){

                //Add other feeds as a dropdown
                if(this.getOptions().rssFeeds.length > 1){
                    var rssDropdown = $('<div id="pinster-asset-controls"><div id="pinster-rss-dropdown-container" class="dropdown">'
                        +                   '<div class="pinster-selected-feed">'+this.getOptions().rssFeeds[0].title.substring(0, 49)+'</div>'
                        +                   '<div class="pinster-notch"></div>'
                        +                   '<ul id="pinster-feeds-list"></ul>'
                        +                 '</div>'
                    );
                    var feedList = rssDropdown.find("#pinster-feeds-list");
                    for (var i=0;i<this.getOptions().rssFeeds.length;i++){
                        feedList.append("<li value='"+this.getOptions().rssFeeds[i].href+"'>"+this.getOptions().rssFeeds[i].title.substring(0, 49)+"</li>");
                    }
                    this.excerpt.append(rssDropdown);
                    this.excerpt.find(".pinster-selected-feed").bind('click.pinster', function(){ this.clickedFeedsDropdown(); });
                    //bind to the collections list
                    this.excerpt.find("#pinster-feeds-list li").bind("click", $.proxy(function(event){
                        var target = $(event.target);
                        this.selectedFeedIndex = target.index();
                        extracted.items[0].feed_url = this.getOptions().rssFeeds[this.selectedFeedIndex].href;
                        excerpt.find("#pinster-rss-feed").rssfeed(extracted.items[0].feed_url, this.RSS_OPTIONS);
                        $('.pinster-selected-feed').text(target.text());
                        return this.clickedFeedsDropdown();
                    }, this));
                }

                this.excerpt.append("<div id='pinster-rss-feed'>").find("#pinster-rss-feed").rssfeed(extracted.items[0].feed_url, this.RSS_OPTIONS);
            }
            else if (extracted.type === "fact" && extracted.items.length === 1){
                this.excerpt.append(renderItem(extracted.items[0]));
            }
            else if (extracted.type === "fact" && extracted.items.length > 1){
                $content.find("#pinster-save-button").addClass("pinster-create-multiple-button").text("Add "+ extracted.items.length + " Elements");
                $content.find("#pinster-dropdown-container").addClass("fact");

                this.excerpt.addClass("extras");
                //Add slideshow controls
                this.excerpt.append("<div id='pinster-asset-controls'><span id='pinster-assets-count'><span id='pinster-index'>1</span> <span>of</span> <span id='pinster-asset-total'>"+ extracted.items.length +"</span> <span>Elements</span></span>"
                    + "<div id='pinster-assets-nav'>"
                    +   "<a id='pinster-assets-prev' class='disabled' href='#'><img src='"+this.urls.prevArrowImageUrl+"'></a>"
                    +   "<a id='pinster-assets-next' href='#'><img src='"+this.urls.nextArrowImageUrl+"'></a>"
                    + "</div></div>");

                //Paint all the items in a new list as a slide show
                this.excerpt.append("<a id='pinster-delete-element' title='Remove this element' href='#'><img src='"+this.urls.trashImageUrl+"' /></a><ol>");
                this.excerptList = this.excerpt.find("ol");
                this.indexEl = this.excerpt.find("#pinster-index");
                this.excerptList.css("width", extracted.items.length * (this.assetWidth+20));

                for (var i=0;i<extracted.items.length;i++){
                    var extItem = extracted.items[i];
                    if (extItem.type === "ImageAsset"){
                        this.excerptList.append("<li class='img'><div class='image-container'><div class='image-cell'></div></div></li>");
                        this.excerpt.find("li:last-child .image-cell").append(this.renderItem(extItem));
                    }
                    else{
                        this.excerptList.append("<li></li>");
                        this.excerpt.find("li:last-child").append(this.renderItem(extItem));

                    }
                }

                this.excerptList.find('img').aeImageResize( {height:435, width: 580});

                this.excerpt.find("#pinster-assets-prev").click($.proxy(this.clickedPrevElement, this));
                this.excerpt.find("#pinster-assets-next").click($.proxy(this.clickedNextAsset, this));
                this.excerpt.find("#pinster-delete-element").click($.proxy(this.clickedDeleteElement, this));
            }

            if (extracted.items[0].canvas){
                //console.log("crop canvas");
                //Crop the canvas to something we can actually show, not the entire mile long site
                $("body").append("<canvas id='pinster-temp-canvas' height='700' width='1024'>");

                var canvas = $("#pinster-temp-canvas");
                var context = canvas[0].getContext("2d");

                context.drawImage(extracted.items[0].canvas, -(($("body").width()-1024)/2), 0);
                extracted.items[0].canvas = null;
                extracted.items[0].canvas = canvas[0];

                if (extracted.items[0].canvas.toBlob) {
                    extracted.items[0].canvas.toBlob(function (blob) {
                            //console.log("load image from blob");
                            window.loadImage(
                                blob,
                                function (img) {
                                    if(img.type === "error") {
                                        console.log("Error loading image");
                                    } else {
                                        document.body.style.cursor = 'default';
                                        $('#pinster-excerpt > img').attr("src", img.src).aeImageResize( {height:500, width: 600});
                                    }
                                    $("#pinster-temp-canvas").remove();
                                },
                                {
                                    maxWidth: 600,
                                    noRevoke: true
                                }
                            );
                        },
                        'image/jpeg'
                    );
                }
                else{
                    //console.log("no canvas to blob support");
                }

            }

            $content.find("#pinster-collage-title").bind('click.pinster', $.proxy(this.showNewCollection, this));
            $content.find("#pinster-cancel-button").bind('click.pinster', this.getOptions().onClose);
            $content.find("#pinster-save-button").attr('disabled', null).bind('click.pinster', $.proxy(this.saveExtracted, this));

            $content.find("#pinster-collagio-login")
                .attr('href', this.urls.authUrl)
                .click($.proxy(this.openCollagioLogin, this));

            $content.find(".pinster-selected-collage").bind('click.pinster', $.proxy(this.clickedDropdown, this));
            $content.find(".pinster-selected-topic").bind('click.pinster', $.proxy(this.clickedTopicDropdown, this));
            $content.find("#pinster-new-collage-button").attr('disabled', null).bind('click.pinster', $.proxy(this.showNewCollection, this));

            $("body").append(this.el = $content);
            $('#pinster-lightbox').addClass("pinster-animated-fast pinster-bounce-in");
        },

        clickedPrevElement: function(){
            if (this.currentAssetIndex === 0) return false;

            //repaint the video if there is one
            var asset = this.getOptions().extracted.items[this.currentAssetIndex];
            if (asset && asset.asset_type === "video"){
                this.excerpt.find("ol li:eq("+this.currentAssetIndex+")").html(this.renderItem(asset));
            }

            this.currentAssetIndex--;

            if (this.currentAssetIndex === this.getOptions().extracted.items.length-1) //at the end
                this.excerpt.find("#pinster-assets-next").addClass("disabled");
            else
                this.excerpt.find("#pinster-assets-next").removeClass("disabled");
            this.excerpt.find("#pinster-delete-element").hide();

            //show the next image
            this.excerptList.find("li").animate({
                'left':  -(this.currentAssetIndex*this.assetWidth)
            }, 500, "easeOutCirc", $.proxy(function(){
                this.excerpt.find("#pinster-delete-element").fadeIn(250);
            }, this));

            this.indexEl.text(this.currentAssetIndex+1);

            if (this.currentAssetIndex === 0) $(this).addClass("disabled");
            return false;
        },

        clickedNextAsset: function(){
            if (this.currentAssetIndex === this.getOptions().extracted.items.length-1) return false;

            //repaint the video if there is one
            var asset = this.getOptions().extracted.items[this.currentAssetIndex];
            if (asset.asset_type === "video"){
                this.excerpt.find("ol li:eq("+this.currentAssetIndex+")").html(this.renderItem(asset));
            }

            this.excerpt.find("#pinster-assets-prev").removeClass("disabled");
            this.excerpt.find("#pinster-delete-element").hide();

            this.currentAssetIndex++;
            //show the next image
            this.excerptList.find("li").animate({
                'left':  -(this.currentAssetIndex*this.assetWidth)
            }, 500, "easeOutCirc", $.proxy(function(){
                this.excerpt.find("#pinster-delete-element").fadeIn(250);
            }, this));

            this.indexEl.text(this.currentAssetIndex+1);

            if (this.currentAssetIndex === this.getOptions().extracted.items.length-1) $(this).addClass("disabled");
            return false;

        },

        clickedDeleteElement: function(){
            var assetIndex = this.currentAssetIndex;

            this.excerpt.find("#pinster-delete-element").hide();
            this.getOptions().extracted.items.splice(assetIndex,1);
            this.excerpt.find("ol li:eq("+assetIndex+")").fadeOut(500, $.proxy(function(e){
                if (this.getOptions().extracted.items.length === 0 && typeof this.getOptions().onClose !== "undefined"){
                    this.getOptions().onClose();
                    return;
                }

                this.excerpt.find("ol li:eq("+assetIndex+")").remove();

                //Show the previous element (if removing from the end)
                if (assetIndex === this.getOptions().extracted.items.length){
                    this.excerpt.find("#pinster-assets-prev").click();
                    return;
                }
                this.excerpt.find("#pinster-delete-element").fadeIn(250);
                //Figure out which of the arrows needs to be enabled
                if (this.getOptions().extracted.items.length === 1){ //only 1 item
                    this.excerpt.find("#pinster-assets-prev, #pinster-assets-next").addClass("disabled");
                }
                else if (assetIndex == 0){
                    this.excerpt.find("#pinster-assets-next").removeClass("disabled");
                    this.excerpt.find("#pinster-assets-prev").addClass("disabled");
                }
                else if (assetIndex === this.getOptions().extracted.items.length-1){ //At the end of the
                    this.excerpt.find("#pinster-assets-next").addClass("disabled");
                }
                else{ // in the middle of the stack
                    this.excerpt.find("#pinster-assets-next").removeClass("disabled");
                    this.excerpt.find("#pinster-assets-prev").removeClass("disabled");
                }

            }, this));

            this.excerpt.find("#pinster-asset-total").text(this.getOptions().extracted.items.length);
            $("#pinster-save-button").text("add " + this.getOptions().extracted.items.length + (this.getOptions().extracted.items.length == 1 ? " element" : " elements"));

            return false;
        },

        openCollagioLogin: function(){
            if ($.browser.msie){
                window.addEventListener("focus", this.loginCallbackIE, false);
            }
            else{
                window.addEventListener("message", this.loginCallback, false);
            }
            window.open(this.urls.authUrl, "collagio", "left=425,top=100,width=650,height=375,titlebar=0,menubar=0,status=0,toolbar=0");
            return false;
        },

        saveExtracted: function(extracted){
            if ($("#pinster-collage-title").css("display") !== "none" && $("#pinster-collage-title").val().trim().length === 0){ //Creating new collection
                $("#pinster-topic-title-error-message").show();
                return false;
            }
            else if ($("#pinster-collage-title").css("display") !== "none" && this.selectedTopicUrl.length === 0){ //Creating new collection
                $("#pinster-topic-error-message").show();
                return false;
            }
            else if (this.selectedCollectionUrl.length === 0 && $("#pinster-collage-title").css("display") === "none"){
                $("#pinster-error-message").show();
                return false;
            }

            $("#pinster-cancel-button").attr('disabled', true).unbind('click.pinster');
            $("#pinster-save-button").attr('disabled', true).unbind('click.pinster');
            $("#pinster-topic-options li").unbind("click");
            $(".pinster-selected-topic").unbind("click");

            this.getOptions().extracted.items[0].caption = $("#pinster-caption").val();

            if ($("#pinster-collage-title").val().trim().length > 0){
                this.saveNewCollection(this.getOptions().extracted);
            }
            else{
                this.processPost(this.getOptions().extracted);
            }

            return false;
        },

        submitItem: function(item) {

            $("#pinster-submit-success").hide();
            $("#pinster-submit-error").hide();

            // Uses a custom ajaxTransport at the bottom of this file to use an iFrame for communication
            $.ajax({
                type : "POST",
                url : this.urls.postUrl.replace("{selectedCollectionUrl}", this.selectedCollectionUrl),
                postMessage : this.urls.frameUrl,
                data : JSON_collagio.stringify(item),
                success: function () {
                    $("#pinster-submit-in-progress").hide();
                    $("#pinster-submit-success").animate({ opacity: 'show' }, 1000, $.proxy(function () {
                        $.cookie("theclaw_lastcollageuid", this.urls.selectedCollectionUrl, { expires: 1, path: '/' });
                        //bubble up event
                        if (typeof this.getOptions().onClose !== "undefined"){
                            this.getOptions().onClose({shutdown: true});
                        }
                    }, this));
                },
                error: function () {
                    $("#pinster-submit-in-progress").hide();
                    $("#pinster-submit-error").animate({ opacity: 'show' }, 2000, function () {
                        //bubble up event
                        if (typeof this.getOptions().onClose !== "undefined"){
                            this.getOptions().onClose();
                        }
                    });
                },
                context: this
            });

        },

        saveNewCollection: function(extracted){
            if (this.selectedTopicUrl.length === 0){
                $("#pinster-new-error-message").show();
                return false;
            }

            this.createCollage( {title: $("#pinster-collage-title").val().trim(), topic_entity_url: this.selectedTopicUrl}, extracted );
            return false;
        },

        createCollage: function(collage, extracted) {
            // Uses a custom ajaxTransport at the bottom of this file to use an iFrame for communication
            $.ajax({
                type : "POST",
                url : this.create_collection,
                postMessage : this.urls.frameUrl,
                data : JSON_collagio.stringify(collage),
                success: function (response) {
                    //Save collage for immediate usage
                    this.selectedCollectionUrl = response.url.substring(response.url.lastIndexOf("/")+1);
                    //$('.pinster-selected-collage').text(collage.title);

                    this.processPost(extracted);
                },
                error: function () {
                    $("#pinster-submit-in-progress").hide();
                    $("#pinster-submit-error").animate({ opacity: 'show' }, 2000, this.getOptions().onClose());
                },
                context: this
            });
        },

        renderItem: function(item) {
            //console.log("renderItem - " + item.type);
            if (item.type === 'VideoAsset')
                return $('<iframe type="text/html" width=600 height=385 frameboarder=0>').attr('src', item.asset_url +"?html5=1");
            else if (item.type === 'ImageAsset' && item.asset_url)
                return $('<img>').attr('src', item.asset_url);
            else if (item.type === "ImageAsset")
                return $('<img>');
            else if (item.type === "FactAsset"){
                if (typeof item.title === "undefined" || item.title.trim().length === 0)
                    return $("<div class='fact-text-wrapper'>").append(item.html);
                else
                    return $("<div class='fact-text-wrapper'>").append("<h2 class='pinster-fact-headline'>"+item.title+"</h2>").append(item.html);
            }
        },

        loginCallback: function(e){
            if (e.origin === this.serverDomain) {
                window.removeEventListener("message", this.loginCallback);
                authenticated(JSON_collagio.parse(e.data).user);
            }
        },

        loginCallbackIE: function(){
            window.removeEventListener("focus", this.loginCallbackIE);
            this.authenticate();
        },

        processPost: function(extracted){
            $("#pinster-submit-in-progress").show();
            if (extracted.items.length === 1 && typeof extracted.items[0].canvas === "undefined"){
                this.submitItem(extracted.items[0]);
            }
            else if (extracted.items.length === 1 && extracted.items[0].canvas){
                extracted.items[0].canvas.toBlob(function (blob) {
                        var rnd = ((1<<23) | Math.floor(Math.random()*(1<<23))).toString(16); // salt to avoid overwriting
                        var fd = {
                            key:            this.s3.prefix + rnd + "-"+document.domain+".jpg",
                            bucket:         this.s3.bucket,
                            acl:            this.s3.acl,
                            AWSAccessKeyId: this.s3.AWSAccessKeyId,
                            policy:         this.s3.policy,
                            signature:      this.s3.signature,
                            filename:       "",
                            "Content-Type": 'image/jpeg'
                        };
                        var fileupload = $("#fileupload").fileupload({
                            url:           "https://"+this.s3.bucket+".s3.amazonaws.com",
                            paramName:     "file",
                            formData: fd,
                            done: function(){
                                extracted.items[0].asset_url = "https://"+this.s3.bucket+".s3.amazonaws.com/" + fd.key;
                                delete extracted.items[0].canvas;
                                submitItem(extracted.items[0]);
                            }
                        })
                        fileupload.fileupload('send', {files: blob});

                    },
                    'image/jpeg'
                );

            }
            else{
                this.getCollection(extracted);
            }
        },

        authenticate: function() {
            var jqhxr = $.ajax({
                type : "GET",
                url : this.urls.authCheckUrl,
                postMessage : this.urls.frameUrl,
                success : function(user) {
                    this.authenticated(user);
                },
                error : function(xhr, textStatus, errorThrown) {
                    $("#pinster-disabled-inner").children().show();
                },
                context: this
            });
        },

        getUserUrls: function() {
            $.ajax({
                type : "GET",
                url : this.urls.userUrlsUrl,
                postMessage : this.urls.frameUrl,
                success : function(response) {
                    this.my_collection_list = response.my_collection_list;
                    this.create_collection = response.create_collection;
                    this.getCollectionList();
                },
                error : function(xhr, textStatus, errorThrown) {
                    $("#pinster-disabled-inner").children().remove();
                    $("#pinster-disabled-inner").append("<div id='pinster-thirdparty-block'>+Collagio only works when third party cookies are enabled.</div>"
                        + "<div id='pinster-thirdparty-help'>Please enable third party cookies in your browser settings.</div> ");
                },
                context: this
            });
        },

        getS3Urls: function(){
            $.ajax({
                type : "GET",
                url : this.urls.s3UserUrl,
                postMessage : this.urls.frameUrl,
                success : function(response) {
                    this.s3 = response;
                },
                error : function(xhr, textStatus, errorThrown) {
                },
                context: this
            });
        },

        getCollectionList: function(newCollection) {
            var jqhxr = $.ajax({
                type : "GET",
                url : this.my_collection_list,
                postMessage : this.urls.frameUrl,
                success : function(response) {
                    var dropdown = $("#pinster-options");
                    var lastCollageUID = $.cookie("theclaw_lastcollageuid");
                    for (var i=0;i<response.length;i++){
                        var collection = response[i];
                        if (!collection.title) collection.title = "";
                        collection.title = collection.title.length > 50 ? collection.title.substr(0, 49) + " ..." : collection.title;
                        var option = $("<li>").data({"value": collection.uid}).text(collection.title);
                        $.data(option[0], 'edit_items_url', collection.edit_items_url);
                        dropdown.append(option);

                        //Read the cookie and restore selected if there's one there
                        if (collection.uid === lastCollageUID && typeof(newCollection) === "undefined"){
                            this.selectedCollectionUrl = collection.uid;
                            $('.pinster-selected-collage').text(collection.title);
                            $("#pinster-save-button").removeClass("inactive");
                        }
                    }

                    if (typeof(newCollection) !== "undefined"){
                        this.selectedCollectionUrl = newCollection.uid;
                        $('.pinster-selected-collage').text(newCollection.title);
                        $("#pinster-save-button").removeClass("inactive");
                    }

                    $("#pinster-disabled-overlay").fadeOut(1000);

                    //bind to the collections list
                    $("#pinster-options li").bind("click", $.proxy(this.clickedDropdownItem, this));
                },
                error : function(xhr, textStatus, errorThrown) {
                },
                context: this
            });
        },

        getTopicsList: function() {
            var jqhxr = $.ajax({
                type : "GET",
                url : this.urls.topicsUrl,
                postMessage : this.urls.frameUrl,
                success : function(response) {
                    var dropdown = $("#pinster-topic-options");
                    var lastTopicUID = $.cookie("theclaw_lasttopicuid");

                    $("#pinster-topic-options li").unbind("click.pinster");

                    for (var i=0;i<response.topics.length;i++){
                        var topic = response.topics[i];

                        topic.title = topic.title.length > 50 ? topic.title.substr(0, 49) + " ..." : topic.title;
                        var option = $("<li>").data({"value": topic.uid}).text(topic.title);
                        $.data(option[0], 'uid', topic.entity_url);
                        dropdown.append(option);

                        //Read the cookie and restore selected if there's one there
                        if (topic.uid === lastTopicUID){
                            this.selectedTopicUrl = topic.entity_url;
                            $('.pinster-selected-topic').text(topic.title);
                        }
                    }
                    $("#pinster-topic-options li").bind("click", $.proxy(this.clickedTopicDropdownItem, this));
                },
                error : function(xhr, textStatus, errorThrown) {
                },
                context: this
            });
        },

        getCollection: function(extracted) {
            var jqhxr = $.ajax({
                type : "GET",
                url : this.collectionUrl.replace("{selectedCollectionUrl}", this.selectedCollectionUrl),
                postMessage : this.urls.frameUrl,
                success : function(response) {
                    var collection = response.collection, payLoad = [];

                    //clear out the original collection extras for syncing very little
                    $.each(collection.screens, function(index, screen){
                        payLoad.push({ uid: screen.uid });
                    });

                    //add new item then extras into the collection
                    $.each(extracted.items, function(index, extraItem){
                        payLoad.push({ item: extraItem });
                    });

                    var newCollection = { uid: collection.uid, screens:payLoad };
                    newCollection.screens = payLoad;
                    this.syncCollection(newCollection);
                },
                error : function(xhr, textStatus, errorThrown) {
                },
                context: this
            });
        },

        syncCollection: function(collection) {
            var jqhxr = $.ajax({
                type : "POST",
                dataType: 'json',
                contentType: "text/json",
                url : this.collectionSyncUrl.replace("{selectedCollectionUrl}", this.selectedCollectionUrl),
                postMessage : this.urls.frameUrl,
                data: JSON_collagio.stringify(collection),
                success : function() {
                    $("#pinster-submit-in-progress").hide();
                    $("#pinster-submit-success").animate({ opacity: 'show' }, 1000, function () {
                        $.cookie("theclaw_lastcollageuid", this.selectedCollectionUrl, { expires: 1, path: '/' });
                        this.getOptions().onClose({shutdown: true});
                    });
                },
                error : function(xhr, textStatus, errorThrown) {
                },
                context: this
            });
        },

        clickedDropdown: function() {
            $("#pinster-error-message").hide();
            $('#pinster-dropdown-container').toggleClass('open');
            $('#pinster-options').toggle();
            $("#pinster-new-collage").toggle();
        },

        clickedTopicDropdownItem: function(event) {
            var target = $(event.target);

            this.selectedTopicUrl = target.data('uid');
            $('.pinster-selected-topic').text(target.text());
            $("#pinster-save-button").removeClass("inactive");

            $("#pinster-topic-error-message").hide();
            $("#pinster-topic-title-error-message").hide();
            $('#pinster-topic-dropdown-container').removeClass('open');
            $('#pinster-topic-options').hide('blind', 150);
        },

        clickedTopicDropdown: function() {
            $("#pinster-topic-error-message").hide();
            $("#pinster-topic-title-error-message").hide();
            $('#pinster-topic-dropdown-container').toggleClass('open');
            $('#pinster-topic-options').toggle('blind', 150);
        },

        clickedDropdownItem: function(event) {
            var target, middle, ending;
            target = $(event.target);
            ending = target.data('edit_items_url').substr(0, target.data('edit_items_url').lastIndexOf("/"));
            middle = ending.substr(ending.lastIndexOf("/")+1)
            this.selectedCollectionUrl = middle;
            $("#pinster-save-button").removeClass("inactive");
            $('.pinster-selected-collage').text(target.text());
            return this.clickedDropdown();
        },

        showNewCollection: function(){
            $("#pinster-dropdown-container").hide();
            $("#pinster-collage-title").show();
            $("#pinster-topic-dropdown-container").show();
            $("#pinster-save-button").removeClass("pinster-create-multiple-button").addClass("pinster-create-button").text("Create + Add");

            this.getTopicsList();
            return false;
        },

        clickedFeedsDropdown: function() {
            $('#pinster-rss-dropdown-container').toggleClass('open');
            $('#pinster-feeds-list').toggle();
        },

        authenticated: function(user) {
            this.user = user;
            this.getUserUrls();
            this.getS3Urls();
        }

});


    (function($){
        $.fn.redrawVideo = function(){
            return $(this).each(function(idx, el){
                var oldSrc = $(el).attr("src");
                $(el).attr("src", '').attr('src', oldSrc);
            });
        }
    })(jQuery);

    (function () { // This transport uses postMessage to an iframe to allow sending our credentials without CORS restrictions.
        var ids = 0;
        $.ajaxTransport("+*", function (options) {
            if (!window.postMessage || !options.postMessage)
                return;
            var $iframe = $("<iframe class='pinster-removable' style='display:none;'>").attr('src', options.postMessage),
                target_origin = $.origin(options.postMessage),
                message = { id: (ids += 1) },
                cleanup, handler;
            return {
                abort: cleanup = function () {
                    $iframe.remove();
                    $(window).off('message', handler);
                },
                send: function(headers, complete) {
                    $(window).on('message', handler = function (e) {
                        var e = e.originalEvent, data = JSON_collagio.parse(e.data);
                        if (e.origin === target_origin && data.id === message.id) {
                            complete(data.status, data.statusText, {json: data.result, text: data.result}, data.headers);
                            cleanup();
                            return false;
                        }
                    });
                    $iframe.load(function () {
                        for (var i in {accepts:0, contentType:0, data:0, dataType:0, headers:0, type:0, url:0})
                            message[i] = options[i];

                        $iframe[0].contentWindow.postMessage(JSON_collagio.stringify(message), target_origin); // IE9 only allows postMessage of strings, so JSON
                    }).appendTo(document.body);
                }
            }
        });
    })();


})(jQuery);