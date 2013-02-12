(function() {
  var AddPhotoVideoView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  AddPhotoVideoView = (function(_super) {

    __extends(AddPhotoVideoView, _super);

    function AddPhotoVideoView() {
      return AddPhotoVideoView.__super__.constructor.apply(this, arguments);
    }

    AddPhotoVideoView.prototype.tagName = "div";

    AddPhotoVideoView.prototype.className = "screen-item add-asset media-type cf";

    AddPhotoVideoView.prototype.collection = myd.ItemsCollection;

    AddPhotoVideoView.prototype.events = {
      'click .search-images': 'clickedSearch',
      'click .close-add-item': 'clickedClosed',
      'click .liked-images': 'clickedLiked',
      'click .liked-videos': 'clickedLiked',
      'click .liked-collages': 'clickedLiked',
      'click .my-images': 'clickedMy',
      'click .my-videos': 'clickedMy',
      'click .my-collages': 'clickedMy',
      'keyup .search-photo-bar input': 'liveSearch'
    };

    AddPhotoVideoView.prototype.initialize = function(params) {
      this.containerTarget = params.container;
      this.addType = params.addType;
      this.collectionItems = params.collectionItems || [];
      this.addItemUrl = params.addItemUrl;
      this.index = params.index;
      this.progress = {};
      this.data = {};
      this.filesSelected = 0;
      this.filesComplete = 0;
      this.liveSearch = _.debounce(_.bind(this.doSearch, this), 300);
      this.collection = new myd.ItemsCollection;
      this.collection.bind("reset", this.render, this);
      if (this.addType === "image") {
        this.assetType = "ImageAsset";
        this.collection.fetch(this.assetType, myd.urls.my_collected_items);
      } else if (this.addType === "video") {
        this.$el.addClass("video-type");
        this.assetType = "VideoAsset";
        this.collection.fetch(this.assetType, myd.urls.my_collected_items);
      } else if (this.addType === "collage") {
        this.$el.addClass("collage-type");
        this.assetType = "Collection";
        this.collection.fetch(this.assetType, myd.urls.my_bookmarks);
      } else if (this.addType === "cover") {
        this.$el.addClass("cover-type");
      }
      this.$el.addClass("" + this.addType + "-type");
      if (this.addType === "cover") {
        return this.collection.reset(this.collectionItems);
      }
    };

    AddPhotoVideoView.prototype.render = function() {
      var animate, headline, likedItemsList, showCollageBar, showPhotoBar, showVideoBar,
        _this = this;
      animate = true;
      showPhotoBar = false;
      showVideoBar = false;
      showCollageBar = false;
      if (this.addType === "image") {
        showPhotoBar = true;
        headline = "Select an image to add ...";
      } else if (this.addType === "video") {
        headline = "Select a video to add ...";
        showVideoBar = true;
      } else if (this.addType === "collage") {
        headline = "Select a collage to add ...";
        showCollageBar = true;
      } else if (this.addType === "cover") {
        headline = "Select a new background image ...";
      }
      likedItemsList = this.$el.find(".liked-items");
      if (likedItemsList.length === 0) {
        this.$el.append(Mustache.render($("#add_media_item_template").html(), {
          headline: headline,
          showPhotoBar: showPhotoBar,
          showVideoBar: showVideoBar,
          showCollageBar: showCollageBar
        }));
        this.$el.insertAfter(this.containerTarget);
        this.likedImagesBtn = this.$el.find(".liked-images");
        this.likedVideosBtn = this.$el.find(".liked-videos");
        this.likedCollagesBtn = this.$el.find(".liked-collages");
        this.myImagesBtn = this.$el.find(".my-images");
        this.myVideosBtn = this.$el.find(".my-videos");
        this.myCollagesBtn = this.$el.find(".my-collages");
        this.searchImagesBtn = this.$el.find(".search-images");
        this.searchBar = this.$el.find(".search-photo-bar");
      }
      likedItemsList = this.$el.find(".liked-items");
      if (likedItemsList.children().length) {
        animate = false;
        likedItemsList.empty();
      }
      this.itemViews = [];
      if (this.collection.models.length === 0) {
        this.$el.find(".no-likes").remove();
        if (this.$el.find(".search-images").hasClass("active")) {
          this.$el.find(".asset-wrapper").append("<div class='no-likes'>Type in the search box above to find images.</div>");
        } else if (this.addType === "cover") {
          this.$el.find(".asset-wrapper").append("<div class='no-likes'>You must add an image or video to your collage first...</div>");
        } else {
          this.$el.find(".asset-wrapper").append("<div class='no-likes'>You must first like or upload a few " + this.addType + "s...</div>");
        }
        this.$el.find(".liked-items").hide();
      } else {
        this.$el.find(".no-likes").remove();
        this.$el.find(".liked-items").show();
        _.each(this.collection.models, function(item) {
          var view;
          if ((item.get('image_300_url') != null) || item.get("type") === "collection") {
            view = new myd.AddItemView({
              model: item,
              addType: _this.addType
            });
            likedItemsList.append(view.el);
            view.bind("addItem", _this.addItem, _this);
            return _this.itemViews.push(view);
          }
        });
      }
      if (animate) {
        this.$el.show("blind", 1000);
      }
      likedItemsList.animate({
        'scrollTop': 0
      }, 250, "easeOutBack");
      this.$el.find('.frame .image').each(function() {
        return $(this).attr('src', $(this).data('src-300'));
      });
      new global.myd.ImageCenter(this.$el.find('.asset'));
      if (this.addType === "image") {
        window.SI.Files.wrapClass = 'upload-image';
        window.SI.Files.stylize(this.$el.find('input.file')[0]);
        return this.uploader = this.$el.find('.file').fileupload({
          url: myd.s3.uploaded_url,
          multipart: true,
          forceIframeTransport: false,
          fileInput: this.$el.find('input.file'),
          dataType: 'text',
          formAcceptCharset: 'utf-8',
          sequentialUploads: true,
          add: function(e, data) {
            var base, basename, filename, key, reader, rnd, type;
            if (_this.filesSelected === 5) {
              return false;
            }
            if (!data.files[0].name.match(/(jpg|jpeg|gif|png)$/i)) {
              alert(data.files[0].name + ' is not supported at this time.');
              return false;
            }
            basename = function(f) {
              return f.replace(/.*[\/\\]/, "");
            };
            rnd = ((1 << 23) | Math.floor(Math.random() * (1 << 23))).toString(16);
            filename = data.files[0].name;
            type = data.files[0].type;
            base = basename(filename);
            data.base = base;
            data.paramName = "file";
            data.formData = {
              key: key = "" + myd.s3.prefix + rnd + "-" + base,
              bucket: myd.s3.bucket,
              acl: myd.s3.acl,
              AWSAccessKeyId: myd.s3.AWSAccessKeyId,
              policy: myd.s3.policy,
              signature: myd.s3.signature,
              filename: "",
              "Content-Type": type,
              success_action_redirect: myd.s3.success_action_redirect
            };
            data.submit();
            _this.data[base] = data;
            _this.progress[base] = $(Mustache.render($("#image_upload_progress_template").html()));
            _this.$el.before(_this.progress[base]);
            _this.filesSelected++;
            if (window.File && window.FileReader) {
              reader = new FileReader();
              reader.onload = (function(file) {
                return function(e) {
                  return _this.progress[base].find('.image-placeholder img').attr('src', e.target.result);
                };
              })(data.files[0]);
              reader.readAsDataURL(data.files[0]);
            }
            if ($.browser.msie && parseInt($.browser.version) < 10) {
              return _this.progress[data.base].find('.bar').animate({
                width: '98%'
              }, 40000);
            }
          },
          start: function(e) {
            return _this.$el.hide();
          },
          progress: function(e, data) {
            var progress;
            progress = parseInt(data.loaded / data.total * 100, 10);
            return _this.progress[data.base].find('.bar').width(progress + '%');
          },
          always: function(e, data) {
            var base;
            base = data.base;
            _this.progress[base].remove();
            _this.addNewItem({
              asset_type: "image",
              asset_url: myd.s3.uploaded_url + _this.data[base].formData.key,
              description: "",
              thumbnail_url: null,
              title: base
            }, false);
            _this.filesComplete++;
            if (_this.filesSelected === _this.filesComplete) {
              return _this.clickedClosed();
            }
          }
        });
      }
    };

    AddPhotoVideoView.prototype.addNewItem = function(itemObj, autoClose) {
      if (autoClose == null) {
        autoClose = true;
      }
      itemObj.index = this.index;
      this.trigger("addNewItem", new myd.ItemModel(itemObj));
      if (autoClose) {
        return this.clickedClosed();
      }
    };

    AddPhotoVideoView.prototype.addItem = function(item) {
      if (this.addType !== "cover") {
        item.set('index', this.index);
        this.trigger("addItem", item);
      } else {
        this.trigger("setCover", item);
      }
      return this.clickedClosed();
    };

    AddPhotoVideoView.prototype.clickedSearch = function() {
      var cookieSearch;
      if (this.searchBar.width() === 0) {
        this.$el.find(".liked-items-bar .active").removeClass("active");
        this.searchImagesBtn.addClass("active");
        this.$el.find(".liked-items").show();
        this.$el.find(".no-likes").remove();
        cookieSearch = $.cookie("add_image_search");
        if (cookieSearch) {
          this.$el.find(".search-photo-bar input").focus().val($.cookie("add_image_search"));
          this.doSearch();
        } else {
          this.$el.find(".search-photo-bar input").focus();
        }
      } else {
        $(".liked-items-bar .active").removeClass("active");
        this.likedImagesBtn.addClass("active");
      }
      if (this.searchBar.width() === 0) {
        this.searchBar.attr('style', '');
      } else {
        this.searchBar.css('width', 0);
      }
      return false;
    };

    AddPhotoVideoView.prototype.doSearch = function() {
      this.searchImagesBtn.addClass("active");
      this.likedImagesBtn.removeClass("active");
      $.cookie("add_image_search", this.searchBar.find("input").val());
      this.collection.fetchSearchResults(this.searchBar.find("input").val());
      _gaq.push(['_trackEvent', "AddBar", "Search", this.searchBar.find("input").val(), 1]);
      omnicollagio.linkTrackEvents = "event21, prop21, eVar8";
      omnicollagio.eVar8 = "CollageAddImageSearchView";
      omnicollagio.prop21 = this.searchBar.find("input").val();
      return omnicollagio.t(this, 'o', window.location);
    };

    AddPhotoVideoView.prototype.clickedLiked = function() {
      $(".liked-items-bar .active").removeClass("active");
      if (this.assetType === "ImageAsset") {
        this.collection.fetch(this.assetType, myd.urls.my_collected_items);
        this.likedImagesBtn.addClass("active");
      } else if (this.assetType === "VideoAsset") {
        this.collection.fetch(this.assetType, myd.urls.my_collected_items);
        this.likedVideosBtn.addClass("active");
      } else if (this.assetType === "Collection") {
        this.collection.fetch(this.assetType, myd.urls.my_bookmarks);
        this.likedCollagesBtn.addClass("active");
      }
      this.searchBar.css('width', 0);
      this.searchBar.find("input").val("");
      return false;
    };

    AddPhotoVideoView.prototype.clickedMy = function() {
      $(".liked-items-bar .active").removeClass("active");
      if (this.assetType === "ImageAsset") {
        this.myImagesBtn.addClass("active");
        this.collection.fetch(this.assetType, myd.urls.owned);
      } else if (this.assetType === "VideoAsset") {
        this.myVideosBtn.addClass("active");
        this.collection.fetch(this.assetType, myd.urls.owned);
      } else if (this.assetType === "Collection") {
        this.myCollagesBtn.addClass("active");
        this.collection.fetch(this.assetType, myd.urls.my_profile);
      }
      this.searchBar.css('width', 0);
      this.searchBar.find("input").val("");
      return false;
    };

    AddPhotoVideoView.prototype.clickedClosed = function() {
      var _this = this;
      this.$el.slideUp(1000, function() {
        return _this.close();
      });
      this.trigger("cancel");
      return false;
    };

    AddPhotoVideoView.prototype.onClose = function() {
      var _this = this;
      return _.each(this.itemViews, function(view) {
        view.unbind("addItem", _this.addItem, _this);
        return view.close();
      });
    };

    return AddPhotoVideoView;

  })(Backbone.View);

  global.myd.AddPhotoVideoView = AddPhotoVideoView;

}).call(this);
