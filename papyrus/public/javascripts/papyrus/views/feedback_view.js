(function() {
  var FeedbackView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  FeedbackView = (function(_super) {

    __extends(FeedbackView, _super);

    function FeedbackView() {
      return FeedbackView.__super__.constructor.apply(this, arguments);
    }

    FeedbackView.prototype.initialize = function() {
      return this.render();
    };

    FeedbackView.prototype.render = function() {
      var template,
        _this = this;
      template = $("#feedback_template").html();
      if (template === null) {
        return false;
      }
      $("body").append("<div id='feedback_form'>");
      this.setElement($("#feedback_form"));
      this.$el.html(Mustache.render(template));
      this.$el.find('.form_toggle_btn').on('click', function() {
        _this.$el.toggleClass('activated');
        return false;
      });
      this.$el.find('.close_form').on('click', function() {
        return _this.$el.removeClass('activated');
      });
      return this.$el.find('#feedback_submit').on('click', function() {
        return _this.submitFeedback();
      });
    };

    FeedbackView.prototype.submitFeedback = function() {
      var dataStuffs, feedback_text, feedback_url, feedback_user_agent, type;
      type = "";
      feedback_text = this.$el.find('#feedback_text').val();
      feedback_url = window.location.href;
      feedback_user_agent = navigator.userAgent;
      this.$el.find('#feedback_form input[type=radio]').each(function() {
        if ($(this).attr("checked")) {
          return type = $(this).val();
        }
      });
      dataStuffs = {
        "feedbackText": feedback_text,
        "type": type,
        "feedbackURL": feedback_url,
        "feedbackUserAgent": feedback_user_agent
      };
      dataStuffs = JSON.stringify(dataStuffs);
      return $.post('/api/feedback/submit', dataStuffs, function(data) {
        alert(data);
        $('#feedback_form').removeClass('activated');
        $('#feedback_text').val('');
        return $('#feedback_form input[type=radio]').each(function() {
          return $(this).removeAttr('checked');
        });
      });
    };

    return FeedbackView;

  })(Backbone.View);

  global.myd.FeedbackView = FeedbackView;

}).call(this);
