global.myd ?= {}
global.myd.common ?= {}

selectedScreen = (screen) ->
  if screen.get("item").get("type") is "collection" and screen.get("item").get("is_topic")
    Router.navigate("topic/#{screen.get("item").get("uid")}", trigger: true)
  else if screen.get("item").get("type") is "collection"
    url = screen.get('item').get("entity_url")
    routes = myd.routesModule.getRoutesFromUrl( url )
    Router.navigate(routes.getPapyrusPath(), trigger: true)
  else if screen.get("item").get("type") is "user"
    #People
    url = screen.get('item').get("entity_url")
    Router.navigateToProfileTab(userPath: new global.myd.Uri(url).getPathname(), tab: 'collections')
  else if screen.get("item").get("type") != "collection"
    @itemLightboxView = new myd.ItemLightboxView(model:screen)

global.myd.common.selectedScreen = selectedScreen