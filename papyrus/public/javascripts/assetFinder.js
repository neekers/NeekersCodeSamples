(function() {
  var _ref, _ref1;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  if ((_ref1 = global.myd) == null) {
    global.myd = {};
  }

  global.myd.assetFinder = function($) {
    var MIN_ASSET_HEIGHT, MIN_ASSET_WIDTH, findAssets;
    MIN_ASSET_WIDTH = 240;
    MIN_ASSET_HEIGHT = 200;
    findAssets = function(html) {
      var $cleanedImages, $clonedImages, $filteredImages, $filteredVideos, $hiddenDiv, $wrappedImages, $wrappedVideos;
      $clonedImages = $('img', html).clone();
      $hiddenDiv = $('<div>').attr('style', 'display:none;');
      $clonedImages.appendTo($hiddenDiv);
      $hiddenDiv.appendTo($(html));
      $cleanedImages = $clonedImages.map(function() {
        return $(this).removeAttr('width').removeAttr('height')[0];
      });
      $filteredImages = $cleanedImages.filter(function() {
        return this.width >= MIN_ASSET_WIDTH && this.height >= MIN_ASSET_HEIGHT;
      });
      $wrappedImages = $filteredImages.map(function() {
        return {
          assetElement: this,
          width: this.width,
          height: this.height
        };
      });
      $filteredVideos = $('video', html).filter(function() {
        return this.videoWidth >= MIN_ASSET_WIDTH && this.videoHeight >= MIN_ASSET_HEIGHT;
      });
      $wrappedVideos = $filteredVideos.map(function() {
        return {
          assetElement: this,
          width: this.videoWidth,
          height: this.videoHeight
        };
      });
      $hiddenDiv.remove();
      return $.merge($wrappedImages, $wrappedVideos);
    };
    return {
      findAssets: findAssets
    };
  };

}).call(this);
