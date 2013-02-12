(function() {
  var getTemplate, getTurntableTemplate, getVideoUrl, initTextEditor, renderAssetFragment, renderAssetFragmentFromItem, renderScreen, renderTextEditor, renderTurntableScreen, renderVideoEmbed, stripMarkdownLinks, timeDifference, tinyMCEOptions, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  renderScreen = function(templateObj, context, actions, tab) {
    var collectionShort, creationDate, currentDate, placeholder, routes, url, _ref1, _ref2, _ref3, _ref4, _ref5;
    if (context == null) {
      context = "collections";
    }
    if (actions == null) {
      actions = {
        showActions: false,
        showLikeButton: false,
        showReuseButton: false,
        showFacebookShareButton: false,
        showScreenNavigation: false,
        showDeleteButton: false
      };
    }
    if (tab == null) {
      tab = null;
    }
    if (templateObj.item != null) {
      templateObj.item = templateObj.item.toJSON();
    } else {
      templateObj.item = templateObj;
    }
    templateObj.item[templateObj.item.type + 'Type'] = true;
    url = templateObj.item.entity_url;
    routes = myd.routesModule.getRoutesFromUrl(url);
    templateObj.item.app_url = "/papyrus" + routes.getPapyrusPath();
    _.map(actions, function(action, key) {
      return templateObj[key] = action;
    });
    if (templateObj.item.type === 'fact') {
      if (context !== "collections" && context !== "reuse") {
        templateObj.item.text = markdown.toHTML((_ref1 = stripMarkdownLinks(templateObj.item.text)) != null ? _ref1 : "");
      } else {
        templateObj.item.text = markdown.toHTML((_ref2 = templateObj.item.text) != null ? _ref2 : "");
      }
    } else if (templateObj.item.type === "collection") {
      placeholder = "/images/placeholder-logo.jpg";
      myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Element");
      templateObj.item.thumbnail_url = ((_ref3 = templateObj.item.cover_asset) != null ? _ref3.thumbnail_url : void 0) || placeholder;
      templateObj.item.image_745_url = ((_ref4 = templateObj.item.cover_asset) != null ? _ref4.image_745_url : void 0) || placeholder;
      templateObj.item.image_300_url = ((_ref5 = templateObj.item.cover_asset) != null ? _ref5.image_300_url : void 0) || placeholder;
      if (templateObj.item.is_topic != null) {
        myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Collage");
        templateObj.item.app_url = "/papyrus/topic/" + templateObj.item.uid;
      } else {
        currentDate = new Date();
        creationDate = new Date();
        if (templateObj.item.modified_timestamp != null) {
          creationDate.setTime(templateObj.item.modified_timestamp * 1000);
          templateObj.item.created = timeDifference(currentDate, creationDate);
        } else if (templateObj.item.created_timestamp != null) {
          creationDate.setTime(templateObj.item.created_timestamp * 1000);
          templateObj.item.created = timeDifference(currentDate, creationDate);
        } else {
          templateObj.item.created = "";
        }
        if (templateObj.item.screens_count != null) {
          myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Element");
        } else {
          templateObj.item.screens_count_text = "";
        }
      }
    } else {
      delete templateObj.item.title;
    }
    templateObj.item.domain = new myd.Uri(templateObj.item.source_page_url).getHost();
    if (global.myd.feature.testing) {
      templateObj.item.thumbnail_url = "/images/default_new_collection.png";
      templateObj.item.asset_url = "/images/default_new_collection.png";
      templateObj.item.image_150_url = "/images/default_new_collection.png";
      templateObj.item.image_300_url = "/images/default_new_collection.png";
      templateObj.item.image_745_url = "/images/default_new_collection.png";
      templateObj.item.image_1024_url = "/images/default_new_collection.png";
      templateObj.item.image_2048_url = "/images/default_new_collection.png";
    }
    if (context === "reorder") {
      return Mustache.render($("#reorder_screen_template").html(), templateObj.item);
    } else if (context === "collections" && templateObj.item.type === "collection" && !templateObj.item.is_topic) {
      if (templateObj.item.screens != null) {
        collectionShort = templateObj.item.screens.slice(0, 6);
        _.each(collectionShort, function(screen) {
          var _ref6;
          if (screen.item.type === "fact") {
            return screen.item.text = markdown.toHTML((_ref6 = stripMarkdownLinks(screen.item.text)) != null ? _ref6 : "");
          } else if (screen.item.type === "video" && (screen.item.youtube_id != null)) {
            return screen.item.thumbnail_url = getVideoUrl(screen.item.youtube_id);
          }
        });
        templateObj.item.screens = collectionShort;
      }
      return Mustache.render($("#full_screen_inline_template").html(), templateObj, {
        screen_nav_template: $("#screen_nav_template").html(),
        collage_screens_template: $("#collage_screens_template").html()
      });
    } else if (templateObj.item.type === "collection" && !templateObj.item.is_topic) {
      if (!templateObj.item.view_count || templateObj.item.view_count < 1) {
        templateObj.item.view_count = "0";
      }
      if (!templateObj.item.total_comment_count || templateObj.item.total_comment_count < 1) {
        templateObj.item.total_comment_count = "0";
      }
      if (!templateObj.item.reuse_count || templateObj.item.reuse_count < 1) {
        templateObj.item.reuse_count = "0";
      }
      return Mustache.render($("#explore_screen_template").html(), templateObj);
    } else if (templateObj.item.type === "collection" && templateObj.item.is_topic) {
      return Mustache.render($("#topic_item_template").html(), templateObj);
    } else if (context === "collections" || context === "itemlightbox" || context === "reuse") {
      return Mustache.render($("#full_screen_inline_template").html(), templateObj, {
        screen_nav_template: $("#screen_nav_template").html()
      });
    } else if (templateObj.item.type === "user" && context === "profile") {
      return Mustache.render($("#search_user_screen_template").html(), templateObj);
    } else {
      currentDate = new Date();
      creationDate = new Date();
      if (templateObj.item.modified_timestamp != null) {
        creationDate.setTime(templateObj.item.modified_timestamp * 1000);
        templateObj.item.created = timeDifference(currentDate, creationDate);
      } else if (templateObj.item.created_timestamp != null) {
        creationDate.setTime(templateObj.item.created_timestamp * 1000);
        templateObj.item.created = timeDifference(currentDate, creationDate);
        if (!(templateObj.item.view_count != null) || templateObj.item.view_count < 1) {
          templateObj.item.view_count = "0";
        }
        if (!(templateObj.item.comment_count != null) || templateObj.item.comment_count < 1) {
          templateObj.item.comment_count = "0";
        }
        if (!templateObj.item.reuse_count || templateObj.item.reuse_count < 1) {
          templateObj.item.reuse_count = "0";
        }
      }
      if (templateObj.item.type === "user") {
        return Mustache.render($("#search_user_screen_template").html(), templateObj);
      } else {
        return Mustache.render($("#full_screen_template").html(), templateObj);
      }
    }
  };

  stripMarkdownLinks = function(text) {
    var noLinks;
    if (typeof text === "undefined" || text === null) {
      return "";
    }
    noLinks = text.replace(/\[/g, "");
    noLinks = noLinks.replace(/]/g, " ");
    noLinks = noLinks.replace(/\)/g, "");
    return noLinks.replace(/\(/g, "");
  };

  renderAssetFragment = function(screen, context, el, tab) {
    var item;
    item = screen.get("item");
    return renderAssetFragmentFromItem(item, screen.get("index"), context, el);
  };

  renderAssetFragmentFromItem = function(item, ordinal, context, el) {
    var $facts, MAX_ASSET_COUNT, assetCount, assets, coverImage, coverImage1024, coverImage150, coverImage2048, coverImage300, coverImage745, coverImageThumb, coverImageTile, defaultThumbnail, elements, fragment, i, itemClass, miniTiles, placeholder, _i, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7,
      _this = this;
    if (ordinal == null) {
      ordinal = 0;
    }
    MAX_ASSET_COUNT = 5;
    assets = item.get("screens");
    assetCount = 0;
    fragment = "";
    elements = [];
    defaultThumbnail = "/images/placeholder-logo.jpg";
    placeholder = "/images/placeholder-logo.jpg";
    coverImageThumb = ((_ref1 = item.get("cover_asset")) != null ? _ref1.preview_image_url : void 0) || placeholder;
    coverImage150 = ((_ref2 = item.get("cover_asset")) != null ? _ref2.image_150_url : void 0) || placeholder;
    coverImage300 = ((_ref3 = item.get("cover_asset")) != null ? _ref3.image_300_url : void 0) || placeholder;
    coverImage745 = ((_ref4 = item.get("cover_asset")) != null ? _ref4.image_745_url : void 0) || placeholder;
    coverImage1024 = ((_ref5 = item.get("cover_asset")) != null ? _ref5.image_1024_url : void 0) || placeholder;
    coverImage2048 = ((_ref6 = item.get("cover_asset")) != null ? _ref6.image_2048_url : void 0) || placeholder;
    itemClass = item.get("description") === '' || item.get("description") === null ? '' : ' with-description';
    if (myd.feature.testing) {
      coverImage = defaultThumbnail;
    }
    fragment = "<div class='asset" + itemClass + "'><div class='gradient'></div><div class='frame'><img class='image' data-src-thumb='" + coverImageThumb + "' data-src-150='" + coverImage150 + "' data-src-300='" + coverImage300 + "' data-src-745='" + coverImage745 + "' data-src-1024='" + coverImage1024 + "' data-src-2048='" + coverImage2048 + "'></div></div>";
    elements.push(fragment);
    assetCount++;
    _.map(assets, function(asset, index) {
      var tags, templateObj, text, thumbnail, _ref7;
      if (asset.item.type === "image" || asset.item.type === "fact" || asset.item.type === "video") {
        if (asset.item.type === "image" || asset.item.type === "video") {
          thumbnail = asset.item.image_150_url || defaultThumbnail;
          if (myd.feature.testing) {
            thumbnail = defaultThumbnail;
          }
          if (assetCount < MAX_ASSET_COUNT) {
            fragment = "<div class='tile'><div class='frame'><img class='image' src='" + thumbnail + "'></div></div>";
            elements.push(fragment);
          }
        } else if (asset.item.type === "fact") {
          text = asset.item.text || '';
          tags = text.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/);
          if (!(tags != null)) {
            asset.item.text = markdown.toHTML((_ref7 = stripMarkdownLinks(text)) != null ? _ref7 : "");
          }
          templateObj = asset;
          if (assetCount < MAX_ASSET_COUNT) {
            fragment = Mustache.render($('#collage_fact_tile_template').html(), templateObj);
            elements.push(fragment);
          }
        }
        return assetCount++;
      }
    });
    if (assetCount < MAX_ASSET_COUNT) {
      for (i = _i = 1, _ref7 = MAX_ASSET_COUNT - assetCount; 1 <= _ref7 ? _i <= _ref7 : _i >= _ref7; i = 1 <= _ref7 ? ++_i : --_i) {
        if (i % 2 === 0) {
          fragment = "<div class='tile placeholder even'></div>";
          elements.push(fragment);
        } else {
          fragment = "<div class='tile placeholder'></div>";
          elements.push(fragment);
        }
      }
    }
    coverImageTile = elements[0];
    miniTiles = elements.slice(1, elements.length);
    el.find(".link").prepend(coverImageTile);
    $.each(miniTiles, function(index, value) {
      return el.find(".mini-tiles").append(value);
    });
    $facts = el.find(".fact-wrapper");
    return $.each($facts, function(index, fact) {
      if (index % 2) {
        return $(fact).addClass("even");
      }
    });
  };

  timeDifference = function(current, previous) {
    var elapsed, msPerDay, msPerHour, msPerMinute, msPerMonth, msPerYear;
    msPerMinute = 60 * 1000;
    msPerHour = msPerMinute * 60;
    msPerDay = msPerHour * 24;
    msPerMonth = msPerDay * 30;
    msPerYear = msPerDay * 365;
    elapsed = current - previous;
    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + 's ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + 'm ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + 'h ago';
    } else if (elapsed < msPerMonth) {
      return Math.round(elapsed / msPerDay) + 'd ago';
    } else if (elapsed < msPerYear) {
      return Math.round(elapsed / msPerMonth) + 'mo ago';
    } else {
      return Math.round(elapsed / msPerYear) + 'y ago';
    }
  };

  renderTurntableScreen = function(templateObj) {
    if (global.myd.feature.testing) {
      templateObj.item.image_300_url = "/images/default_new_collection.png";
    } else if (templateObj.item.type === "collection") {
      if (templateObj.item.cover_asset.type === "video" && (templateObj.item.cover_asset.youtube_id != null)) {
        templateObj.item.image_300_url = getVideoUrl(templateObj.item.cover_asset.youtube_id);
      } else {
        templateObj.item.image_300_url = templateObj.item.cover_asset.image_300_url;
      }
    }
    if (templateObj.item.type === 'video' && (templateObj.item.youtube_id != null)) {
      templateObj.item.image_300_url = getVideoUrl(templateObj.item.youtube_id);
    }
    return Mustache.render($("#turntable_record_template").html(), templateObj);
  };

  getVideoUrl = function(youtube_id) {
    return "http://img.youtube.com/vi/" + youtube_id + "/0.jpg";
  };

  getTemplate = function(assetType) {
    var template_id;
    template_id = "" + assetType + "_template";
    return $("#" + template_id).html();
  };

  getTurntableTemplate = function(type) {
    var template_id;
    if (type === 'image' || type === 'externalvideo' || type === 'fact' || type === "collection") {
      return $("#" + type + "_turntable_template").html();
    } else {
      template_id = "" + type + "_template";
      return $("#" + template_id).html();
    }
  };

  renderVideoEmbed = function(asset, el, height) {
    var templateObj, videoId, youtube_template;
    if (height == null) {
      height = 350;
    }
    videoId = asset.get('item').get("youtube_id");
    templateObj = asset.toJSON();
    templateObj.item = templateObj.item.toJSON();
    youtube_template = $("#youtube_embed_template").html();
    el.find(".video-wrapper").html(Mustache.render(youtube_template, templateObj));
    el.find(".youtube-player").show();
    return el.find("iframe").attr("height", height);
  };

  tinyMCEOptions = {
    theme: "advanced",
    skin: "collagio",
    plugins: "inlinepopups",
    height: "250",
    width: "100%",
    inlinepopups_skin: "collagio",
    dialog_type: "modal",
    theme_advanced_buttons1: "bold,italic,bullist,numlist,link"
  };

  initTextEditor = function() {
    tinyMCEOptions;
    tinyMCEOptions.mode = "specific_textareas";
    tinyMCEOptions.editor_selector = "text-editor";
    return tinyMCE.init(tinyMCEOptions);
  };

  renderTextEditor = function(elementId) {
    var editor;
    editor = new tinymce.Editor(elementId, tinyMCEOptions);
    editor.render();
    tinyMCE.add(editor);
    return editor;
  };

  global.myd.initTextEditor = initTextEditor;

  global.myd.renderTextEditor = renderTextEditor;

  global.myd.renderAssetFragment = renderAssetFragment;

  global.myd.renderAssetFragmentFromItem = renderAssetFragmentFromItem;

  global.myd.getVideoUrl = getVideoUrl;

  global.myd.renderScreen = renderScreen;

  global.myd.renderVideoEmbed = renderVideoEmbed;

  global.myd.renderTurntableScreen = renderTurntableScreen;

  global.myd.timeDifference = timeDifference;

}).call(this);
