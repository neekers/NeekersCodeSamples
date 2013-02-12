
capFirstLetter = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)

pluralizeIfNeeded = (templateObject, propertyToCheck, label) ->
  if templateObject[propertyToCheck] != 1
    label = "#{label}s"
  templateObject["#{propertyToCheck}_text"] = label
  templateObject

pluralizeIfNeededText = (templateObject, label) ->
  if templateObject.length != 1
    label = "#{label}s"
  label

global.myd.pluralizeIfNeededText = pluralizeIfNeededText
global.myd.pluralizeIfNeeded = pluralizeIfNeeded
global.myd.capFirstLetter = capFirstLetter