# Usage:
#
# Add ?ff=my_feature&ff=my_other_feature to your URL and then you can test
#   global.myd.feature.my_feature
# and
#   global.myd.feature.my_other_feature
# for truth...

global.myd ||= {}

splitParam = (param) ->
  result = {}
  tmp = param.split("=");
  result[tmp[0]] = unescape(tmp[1]);
  result

getQueryParameters = ->
  if window.location.search
    # split up the query string and store in an associative array
    params = window.location.search.slice(1).split("&");
    (splitParam param for param in params)

global.myd.ResetFeatureFlags = ->
  global.myd.feature = {}
  for flag in _.filter(getQueryParameters(), (param)-> !!param.ff)
    if(flag.ff == "publish")
      document.cookie = "publish=true;path=/"

    global.myd.feature[flag.ff] = true

  if document.domain == "system-integration.collagio.com"
    global.myd.feature["testing"] = true


global.myd.ResetFeatureFlags() if window? # no "window" during node.js tests until later...
