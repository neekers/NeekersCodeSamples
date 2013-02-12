(function() {
  var AddCollectionTileView, routesModule, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  routesModule = myd.routesModule;

  AddCollectionTileView = (function(_super) {

    __extends(AddCollectionTileView, _super);

    function AddCollectionTileView() {
      return AddCollectionTileView.__super__.constructor.apply(this, arguments);
    }

    AddCollectionTileView.prototype.tagName = "div";

    AddCollectionTileView.prototype.className = "add-collection";

    AddCollectionTileView.prototype.events = {
      'click #my-profile .add_btn': 'clickedAddCollection',
      'click .cancel_btn': 'clickedCancel',
      'click .fs_overlay': 'clickedCancel',
      'click .create_btn': 'submit',
      'submit #create-collection': 'submit',
      'keyup select': 'keyup',
      'click .selected-topic': 'clickedDropdown',
      'click .options li': 'clickedDropdownItem'
    };

    AddCollectionTileView.prototype.initialize = function(params) {
      this.inputModule = global.myd.inputModule;
      this.template = $("#add_collection_template").html();
      this.getForm = params.getForm;
      this.getFormWrapper = params.getFormWrapper;
      this.overlay = params.overlay;
      this.serviceModule = params.serviceModule;
      this.createCollectionUrl = params.createCollectionUrl;
      return this.selectedTopic = null;
    };

    AddCollectionTileView.prototype.hideAddCollection = function() {
      return this.overlay.close();
    };

    AddCollectionTileView.prototype.displayError = function(errorJson) {
      var titleErrorMessage, topicErrorMessage;
      this.resetErrorMessages();
      titleErrorMessage = errorJson["title"];
      topicErrorMessage = errorJson["topic"];
      if (titleErrorMessage) {
        this.showTitleErrorMessage(titleErrorMessage);
      }
      if (topicErrorMessage) {
        this.showTopicErrorMessage(topicErrorMessage);
      }
      return $("input[name=title]");
    };

    AddCollectionTileView.prototype.showTitleErrorMessage = function(message) {
      var $titleErrorLabel, $titleTextElement;
      $titleErrorLabel = this.getTitleErrorMessageElement();
      $titleTextElement = this.getTitleTextElement();
      $titleErrorLabel.text(message);
      $titleErrorLabel.show();
      return $titleTextElement.addClass("field_validation_error animated pulse");
    };

    AddCollectionTileView.prototype.showTopicErrorMessage = function(message) {
      var $topicDropdownElement, $topicErrorLabel;
      $topicErrorLabel = this.getTopicErrorMessageElement();
      $topicDropdownElement = this.getTopicDropdownElement();
      $topicErrorLabel.text(message);
      $topicErrorLabel.show();
      return $topicDropdownElement.addClass("field_validation_error animated pulse");
    };

    AddCollectionTileView.prototype.resetErrorMessages = function() {
      var $titleErrorLabel, $titleTextElement, $topicDropdownElement, $topicErrorLabel;
      $topicDropdownElement = this.getTopicDropdownElement();
      $titleTextElement = this.getTitleTextElement();
      $titleErrorLabel = this.getTitleErrorMessageElement();
      $topicErrorLabel = this.getTopicErrorMessageElement();
      $titleErrorLabel.text();
      $titleErrorLabel.hide();
      $topicErrorLabel.text();
      $topicErrorLabel.hide();
      $topicDropdownElement.removeClass("field_validation_error");
      return $titleTextElement.removeClass("field_validation_error");
    };

    AddCollectionTileView.prototype.getTitleErrorMessageElement = function() {
      return this.getForm().find("#title_error_message");
    };

    AddCollectionTileView.prototype.getTitleTextElement = function() {
      return this.getForm().find("input[name=title]");
    };

    AddCollectionTileView.prototype.getTopicDropdownElement = function() {
      return this.getForm().find("select[name=topic_entity_url]");
    };

    AddCollectionTileView.prototype.getTopicErrorMessageElement = function() {
      return this.getForm().find("#topic_error_message");
    };

    AddCollectionTileView.prototype.clickedAddCollection = function() {
      this.getForm().addClass('activated');
      return this.getFormWrapper().addClass('activated');
    };

    AddCollectionTileView.prototype.visitFormElements = function(delegate) {
      return this.getForm().find('.field').each(function() {
        return delegate(this);
      });
    };

    AddCollectionTileView.prototype.clickedCancel = function() {
      return this.hideAddCollection();
    };

    AddCollectionTileView.prototype.keyup = function(event) {
      if (this.inputModule.returnPress(event)) {
        return this.submit(event);
      }
    };

    AddCollectionTileView.prototype.submit = function(event) {
      return this.clickCreate();
    };

    AddCollectionTileView.prototype.clickCreate = function() {
      var values,
        _this = this;
      values = {};
      this.visitFormElements(function(element) {
        values[element.name] = $(element).val();
        return values.topic_entity_url = _this.selectedTopic;
      });
      return this.createCollection(values);
    };

    AddCollectionTileView.prototype.createCollection = function(collectionData) {
      var _this = this;
      if (!this.getTitleTextElement().val()) {
        return this.showTitleErrorMessage("Please enter a title.");
      }
      if (!this.selectedTopic) {
        return this.showTopicErrorMessage("Please choose a topic.");
      }
      $('.create_btn').hide();
      return myd.serviceModule.post({
        url: myd.urls.create_collection,
        data: collectionData,
        success: function(response) {
          var newCollectionUID;
          _this.getFormWrapper().remove();
          _this.overlay.close();
          newCollectionUID = response.url.substring(response.url.lastIndexOf("/") + 1);
          omnicollagio.eVar24 = _this.selectedTopic + ": " + newCollectionUID;
          if (omnicollagio.events.length) {
            omnicollagio.events += ",event15";
          } else {
            omnicollagio.events = "event15";
          }
          return Router.navigateToEditCollection("/c/api/collections/" + newCollectionUID, {
            trigger: true
          });
        },
        error: function(response) {
          var json;
          json = JSON.parse(response.responseText);
          return _this.displayError(json);
        },
        dataType: 'json'
      });
    };

    AddCollectionTileView.prototype.clickedDropdown = function() {
      this.$el.find('.dropdown-container').toggleClass('open');
      return this.$el.find('.options').toggle('blind', 150);
    };

    AddCollectionTileView.prototype.clickedDropdownItem = function(event) {
      var target;
      target = $(event.target);
      this.selectedTopic = target.data('entity');
      this.$el.find('.selected-topic').text(target.text());
      return this.clickedDropdown();
    };

    AddCollectionTileView.prototype.render = function() {
      var renderedContent;
      renderedContent = Mustache.render(this.template, this.model.toJSON());
      this.$el.html(renderedContent);
      return this;
    };

    return AddCollectionTileView;

  })(Backbone.View);

  global.myd.AddCollectionTileView = AddCollectionTileView;

}).call(this);
