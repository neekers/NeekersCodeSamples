(function() {

  global.myd.UserAdmin = (function() {

    function UserAdmin() {}

    UserAdmin.prototype.initialize = function() {
      var _this = this;
      return $("#save_btn").bind("click", function() {
        return _this.post();
      });
    };

    UserAdmin.prototype.post = function() {
      var emailAddress,
        _this = this;
      emailAddress = $("#emailAddress").val();
      return $.ajax({
        url: myd.urls.new_beta_whitelist_user,
        type: 'post',
        data: {
          email: $.trim(emailAddress)
        },
        success: function() {
          return _this.handleResponse(emailAddress, "success");
        },
        error: function() {
          return _this.handleResponse(emailAddress, "fail");
        }
      });
    };

    UserAdmin.prototype.handleResponse = function(email, successFail) {
      var newUserEl, responseText;
      responseText = "There was an issue with saving " + email + " please try again later.";
      newUserEl = $("<li class='newUser saving' style='display:none'></li>");
      if (successFail === "success") {
        responseText = "" + email;
        $("#result").prepend(newUserEl);
        $(".newUser:first").text(responseText).fadeIn("slow", function() {
          return $(this).removeClass('saving').addClass('saved');
        });
        return $("#emailAddress").val("");
      } else {
        return alert('there was an issue please try again.');
      }
    };

    return UserAdmin;

  })();

}).call(this);
