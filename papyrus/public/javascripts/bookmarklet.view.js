(function() {
  var _base, _ref, _ref1, _ref2;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  if ((_ref2 = (_base = global.myd).bookmarklet) == null) {
    _base.bookmarklet = {};
  }

  global.myd.bookmarklet.view = function($, Handlebars, Backbone, something) {
    var BookmarkletAppView, PotentialAsset, PotentialAssetView, PotentialAssets, PotentialAssetsView, TitleAndDescriptionView, addAssetsToContainer, containerExists, createBookmarkletContainerIfNotPresent, displayPage, findVideoSrc, getAbsoluteUrl, getFileName, nakedifyAssetsFrom, onCloseDrawer, removeDrawerFromDom, removeMyDFromGlobalNS, removeScripts, removeSpinner;
    getFileName = function(url) {
      var match;
      match = url.match(/\/([^\/]*)$/);
      if (match) {
        return match[1];
      } else {
        return url;
      }
    };
    getAbsoluteUrl = function(url) {
      var a;
      a = $("<a>").attr("href", url);
      return a[0].href;
    };
    displayPage = function($page) {
      $(".tta-overlay .tta-page").addClass("hidden");
      return $page.removeClass("hidden");
    };
    PotentialAsset = Backbone.Model.extend({
      saveAsset: function() {
        var BASE_URL, assetType, data, model, self;
        self = this;
        model = this.toJSON();
        if (model.assetElement.is('img')) {
          assetType = "image";
        } else if (model.assetElement.is('video')) {
          assetType = "video";
        }
        data = {
          asset_type: assetType,
          asset_url: getAbsoluteUrl(model.assetElement.attr('src')),
          title: $.trim(model.title),
          description: $.trim(model.description)
        };
        BASE_URL = window.TapTapAwesome.BASE_URL.replace(/\/$/, "");
        return $.ajax({
          url: BASE_URL + '/api/assets/',
          data: data,
          type: 'POST',
          xhrFields: {
            withCredentials: true
          }
        }).success(function() {
          return self.set({
            saved: true
          });
        }).error(function(jqXHR, textStatus, errorThrown) {
          return alert("error: status:" + textStatus + ", errorThrown:" + errorThrown);
        });
      }
    });
    PotentialAssets = Backbone.Collection.extend({
      model: PotentialAsset
    });
    global.potentialAssets = new PotentialAssets();
    PotentialAssetView = Backbone.View.extend({
      tagName: "div",
      className: "asset",
      events: {
        "click": "didSelectAsset"
      },
      initialize: function() {
        return this.model.bind('change', this.render, this);
      },
      render: function() {
        var model, template;
        model = this.model.toJSON();
        template = Handlebars.compile($('#tta-potential-asset-tmpl').html());
        $(this.el).html(template({
          image: model.assetElement.is('img'),
          video: model.assetElement.is('video'),
          src: model.assetElement[0].src,
          width: model.width,
          height: model.height,
          saved: !!model.saved
        }));
        return this;
      },
      didSelectAsset: function() {
        if (!this.model.attributes.saved) {
          return this.model.trigger('asset-selected', this.model);
        }
      }
    });
    PotentialAssetsView = Backbone.View.extend({
      el: 'ul.potential-assets',
      initialize: function() {
        return global.potentialAssets.bind('add', this.addAsset, this);
      },
      addAsset: function(asset) {
        var view,
          _this = this;
        view = new PotentialAssetView({
          model: asset
        });
        view.bind('asset-selected', function(selectedAsset) {
          return _this.trigger('asset-selected', selectedAsset);
        });
        return $(this.el).append(view.render().el);
      }
    });
    TitleAndDescriptionView = Backbone.View.extend({
      el: ".tta-title-description.tta-page",
      initialize: function() {
        return global.potentialAssets.bind('asset-selected', this.assetSelected, this);
      },
      events: {
        "click .tta-title-description.tta-page .tta-cancel": "cancelAddTitleAndDescription",
        "click .tta-title-description.tta-page .tta-save-and-collect": "saveAsset"
      },
      cancelAddTitleAndDescription: function() {
        return displayPage($('.tta-overlay .tta-asset-options.tta-page'));
      },
      saveAsset: function() {
        this.currentlySelectedAsset.set({
          title: $('.tta-title-input').val()
        });
        this.currentlySelectedAsset.set({
          description: $('.tta-description-textarea').val()
        });
        this.currentlySelectedAsset.saveAsset();
        return displayPage($('.tta-overlay .tta-asset-options.tta-page'));
      },
      assetSelected: function(selectedAsset) {
        this.currentlySelectedAsset = selectedAsset;
        return this.displayTitleAndDescriptionPage();
      },
      clearPage: function($page) {
        $page.find('.tta-title-input').val('');
        return $page.find('.tta-description-textarea').val('');
      },
      setPreviewAndDescription: function($page) {
        var altTag, model;
        model = this.currentlySelectedAsset.toJSON();
        $page.find('.tta-potential-asset-preview').empty().append(model.assetElement);
        altTag = model.assetElement.attr('alt');
        if (altTag !== "undefined") {
          return $page.find('.tta-description-textarea').val(altTag);
        }
      },
      assetClicked: function() {
        return this.trigger('assetCollected', this.model);
      },
      displayTitleAndDescriptionPage: function() {
        var $addTitleDescrPage;
        $addTitleDescrPage = $('.tta-overlay .tta-title-description.tta-page');
        this.clearPage($addTitleDescrPage);
        this.setPreviewAndDescription($addTitleDescrPage);
        return displayPage($addTitleDescrPage);
      }
    });
    BookmarkletAppView = Backbone.View.extend({
      el: ".tta-overlay",
      initialize: function() {
        this.assetsView = new PotentialAssetsView();
        return this.titleAndDescriptionView = new TitleAndDescriptionView();
      }
    });
    containerExists = function() {
      return $(".tta-container").length > 0;
    };
    createBookmarkletContainerIfNotPresent = function(data) {
      var $container;
      if (containerExists()) {
        return;
      }
      $container = $('<div class="tta-container"/>');
      $container.append(data);
      $('body').append($container);
      return window.App = new BookmarkletAppView;
    };
    addAssetsToContainer = function(assets) {
      var asset, _i, _len, _results;
      if (assets.length === 0) {
        return $('.no-asset-message').show();
      } else {
        _results = [];
        for (_i = 0, _len = assets.length; _i < _len; _i++) {
          asset = assets[_i];
          _results.push(global.potentialAssets.add(asset));
        }
        return _results;
      }
    };
    removeSpinner = function() {
      return $("#tta-spinner").remove();
    };
    findVideoSrc = function($asset) {
      var src;
      src = $asset.attr('src');
      if (!src && $asset.find("source").length > 0) {
        src || (src = $asset.find("source").attr('src'));
      }
      return src;
    };
    nakedifyAssetsFrom = function(assets) {
      var $newAssets;
      $newAssets = $(assets).map(function(index, asset) {
        var $asset, alt, src;
        $asset = $(asset.assetElement);
        alt = $asset.attr('alt');
        if ($asset.is('img')) {
          src = $asset.attr('src');
          $asset = $("<img src='" + src + "' alt='" + alt + "' />");
        } else if ($asset.is('video')) {
          src = findVideoSrc($asset);
          $asset = $("<video src='" + src + "' alt='" + alt + "'/>");
        }
        asset.assetElement = $asset;
        return asset;
      });
      return $newAssets.filter(function() {
        return $(this.assetElement).attr('src') !== '';
      });
    };
    onCloseDrawer = function(drawerClosedCallback) {
      return $('.tta-container .close-drawer').die().live('click', function() {
        return drawerClosedCallback();
      });
    };
    removeDrawerFromDom = function() {
      return $(".tta-container").remove();
    };
    removeScripts = function(scripts) {
      var script, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = scripts.length; _i < _len; _i++) {
        script = scripts[_i];
        _results.push($("#" + script.id).remove());
      }
      return _results;
    };
    removeMyDFromGlobalNS = function() {
      return global.myd = void 0;
    };
    return {
      containerExists: containerExists,
      createBookmarkletContainerIfNotPresent: createBookmarkletContainerIfNotPresent,
      addAssetsToContainer: addAssetsToContainer,
      removeSpinner: removeSpinner,
      nakedifyAssetsFrom: nakedifyAssetsFrom,
      onCloseDrawer: onCloseDrawer,
      removeDrawerFromDom: removeDrawerFromDom,
      removeScripts: removeScripts,
      removeMyDFromGlobalNS: removeMyDFromGlobalNS
    };
  };

}).call(this);
