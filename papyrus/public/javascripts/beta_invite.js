(function() {
  var BetaInvite, _ref;

  if ((_ref = this.global) == null) {
    this.global = {};
  }

  BetaInvite = (function() {

    function BetaInvite() {
      var closeWindow,
        _this = this;
      this.pageData = {
        kg: {
          title: "Welcome.",
          background: ["/images/beta_request/knitting.jpg", "/images/beta_request/knitting-2.jpg", "/images/beta_request/152134800_w.jpg"],
          body: "<p class='message'>Collagio is a place to explore, learn, create and connect with others who share your love of knitting.</p>            <p class='message callout'><strong>Here you can:</strong></p>            <ul>              <li class='message'>Post patterns and projects, upload images, tell stories</li>              <li class='message'>Collect, organize and share great content you find around the web</li>              <li class='message'>Explore collages made by other knitters — like yourself!</li>            </ul>            <p class='message'>We've pulled together this early (and rough) working version and need a few, brave beta testers to give it a try. Want to help us make it great?</p>"
        },
        ay: {
          title: "Welcome.",
          background: ["/images/beta_request/space.jpg", "/images/beta_request/119089394_w.jpg", "/images/beta_request/131759513_w.jpg"],
          body: "<p class='message'>Collagio is a place to explore, learn, create and connect with others who share your love of astronomy.</p>            <p class='message callout'><strong>Here you can:</strong></p>            <ul>              <li class='message'>Post your newest discoveries, upload images, tell stories</li>              <li class='message'>Collect, organize and share great content you find around the web</li>              <li class='message'>Explore collages made by other astronomy fans — like yourself!</li>            </ul>            <p class='message'>We've pulled together this early (and rough) working version and need a few, brave beta testers to give it a try. Want to help us make it great?</p>"
        },
        fg: {
          title: "Welcome.",
          background: ["/images/beta_request/fishing.jpg", "/images/beta_request/87517272_w.jpg", "/images/beta_request/121025607_w.jpg", "/images/beta_request/146781428_w.jpg"],
          body: "<p class='message'>Collagio is a place to explore, learn, create and connect with others who share your love of fishing.</p>            <p class='message callout'><strong>Here you can:</strong></p>            <ul>              <li class='message'>Post your latest catches, upload images, tell stories about the one that got away</li>              <li class='message'>Collect, organize and share great content you find around the web</li>              <li class='message'>Explore collages made by other anglers — like yourself!</li>            </ul>            <p class='message'>We've pulled together this early (and rough) working version and need a few, brave beta testers to give it a try. Want to help us make it great?</p>"
        }
      };
      this.defaultBackgrounds = ["/images/beta_request/121025607_w.jpg", "/images/beta_request/119089394_w.jpg", "/images/beta_request/152134800_w.jpg", "/images/beta_request/knitting.jpg", "/images/beta_request/fishing.jpg", "/images/beta_request/knitting-2.jpg", "/images/beta_request/131759513_w.jpg", "/images/beta_request/87517272_w.jpg", "/images/beta_request/146781428_w.jpg", "/images/beta_request/space.jpg"];
      this.background = $("#background");
      this.currentHash = this.parseHash();
      this.currentPage = this.pageData[this.currentHash];
      if (typeof this.currentPage === "undefined") {
        this.currentPage = 'default';
      }
      this.updatePage();
      closeWindow = (global.myd.Uri != null) ? new global.myd.Uri(window.location).get("close") : void 0;
      if (closeWindow) {
        $("#welcome-message").remove();
        $("#request > [id!=logins], .login-text").remove();
        $("#request").addClass("popup").height(125);
        $("#logo").css("margin-left", "110px");
        $(".already").text("Please login with one of the following options:");
      }
      $(window).bind('resize', function() {
        return _this.updateDimensions(true);
      });
    }

    BetaInvite.prototype.parseHash = function() {
      return document.location.hash.slice(1, 3);
    };

    BetaInvite.prototype.updatePage = function() {
      if (this.currentPage !== 'default') {
        $("#title").html(this.currentPage.title);
        $("#bodyCopy").html(this.currentPage.body);
      }
      this.updateDimensions();
      return this.setupBackgrounds();
    };

    BetaInvite.prototype.updateDimensions = function(resize) {
      var messageHeight, sidebarHeight;
      if (resize == null) {
        resize = false;
      }
      this.background.height($("#container").outerHeight());
      if ($(window).width() < 549) {
        return false;
      }
      if (!resize) {
        messageHeight = $("#welcome-message").outerHeight();
        sidebarHeight = $("#request").outerHeight() + $("#logins").outerHeight() - 20;
        if (messageHeight > sidebarHeight) {
          $("#request").height(messageHeight);
          return $("#welcome-message").height(messageHeight);
        } else {
          $("#request").height(sidebarHeight);
          return $("#welcome-message").height(sidebarHeight);
        }
      }
    };

    BetaInvite.prototype.setupBackgrounds = function() {
      var background, backgrounds, image, _i, _len,
        _this = this;
      if (this.currentPage !== 'default') {
        backgrounds = this.currentPage.background;
      } else {
        backgrounds = this.defaultBackgrounds;
      }
      for (_i = 0, _len = backgrounds.length; _i < _len; _i++) {
        background = backgrounds[_i];
        image = $("<div/>").addClass('image').css('background-image', "url(" + background + ")");
        this.background.append(image);
      }
      return this.backgroundCycle = setInterval(function() {
        return _this.cycleBackground();
      }, 5000);
    };

    BetaInvite.prototype.cycleBackground = function() {
      var _this = this;
      return this.background.find(".image").last().fadeOut(2000, function() {
        return _this.background.find(".image").last().insertBefore(_this.background.find('.image').first()).show();
      });
    };

    return BetaInvite;

  })();

  window.BetaInvite = BetaInvite;

}).call(this);
