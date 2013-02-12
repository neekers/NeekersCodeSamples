(function() {
  var capFirstLetter, pluralizeIfNeeded, pluralizeIfNeededText;

  capFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  pluralizeIfNeeded = function(templateObject, propertyToCheck, label) {
    if (templateObject[propertyToCheck] !== 1) {
      label = "" + label + "s";
    }
    templateObject["" + propertyToCheck + "_text"] = label;
    return templateObject;
  };

  pluralizeIfNeededText = function(templateObject, label) {
    if (templateObject.length !== 1) {
      label = "" + label + "s";
    }
    return label;
  };

  global.myd.pluralizeIfNeededText = pluralizeIfNeededText;

  global.myd.pluralizeIfNeeded = pluralizeIfNeeded;

  global.myd.capFirstLetter = capFirstLetter;

}).call(this);
