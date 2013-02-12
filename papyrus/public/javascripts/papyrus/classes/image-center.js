(function() {
  var ImageCenter, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  ImageCenter = (function() {

    function ImageCenter(images) {
      var asset, imageEl, imageSrc, key, self, _i, _len;
      self = this;
      this.imageList = [];
      for (key = _i = 0, _len = images.length; _i < _len; key = ++_i) {
        asset = images[key];
        asset = $(asset);
        imageSrc = asset.find('.image').attr('src');
        imageEl = $('<img/>');
        imageEl.data('height', asset.outerHeight());
        imageEl.data('width', asset.outerWidth());
        imageEl.data('image-key', key);
        this.imageList.push(asset);
        imageEl.load(function(el) {
          var canvas, ctx, height, img, maxHeight, maxWidth, offsetX, offsetY, ratio, width;
          img = this;
          height = img.height;
          width = img.width;
          maxHeight = $(img).data('height');
          maxWidth = $(img).data('width');
          ratio = 1;
          canvas = document.createElement("canvas");
          ctx = canvas.getContext("2d");
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          if (img.width / img.height >= canvas.width / canvas.height) {
            ratio = canvas.height / img.height;
            img.height = maxHeight;
            img.width = img.width * ratio;
            offsetX = -1 * Math.abs((img.width - canvas.width) / 2);
            offsetY = 0;
          } else {
            ratio = canvas.width / img.width;
            img.width = maxWidth;
            img.height = img.height * ratio;
            offsetX = 0;
            offsetY = -1 * Math.abs((img.height - canvas.height) / 2);
          }
          ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
          self.imageList[$(this).data('image-key')].find('canvas').remove();
          return self.imageList[$(this).data('image-key')].append(canvas);
        });
        imageEl.attr('src', imageSrc);
      }
    }

    return ImageCenter;

  })();

  global.myd.ImageCenter = ImageCenter;

}).call(this);
