global.myd ?= {}
routesModule = myd.routesModule

class PapyrusRouter extends Backbone.Router
  routes:
    "":                       "modified"
    "papyrus":                "modified"
    "newest":                 "newest"
    "likes":                  "likes"
    "modified":               "modified"
    "commented":              "commented"
    "views":                  "views"
    "reuses":                 "reuses"
    "search":                 "search"
    "search/:query":          "search"
    "topic/:uid":             "topicNewest"
    "topic/:uid/newest":      "topicNewest"
    "topic/:uid/likes":       "topicLikes"
    "topic/:uid/modified":    "topicModified"
    "topic/:uid/commented":   "topicCommented"
    "topic/:uid/views":       "topicViews"
    "topic/:uid/reuses":      "topicReuses"
    "following":              "followingNewest"
    "following/newest":       "followingNewest"
    "following/likes":        "followingLikes"
    "following/modified":     "followingModified"
    "following/commented":    "followingCommented"
    "following/views":        "followingViews"
    "following/reuses":       "followingReuses"
    "bookmarklet":            "bookmarklet"

    #These two routes add support for feature flags
    #will only work from the "home page"
    "?:query_params": "modified"
    "papyrus?:query_params":  "modified"


  initialize: (params) ->
    @appView = params.app_view
    @currentUsersUserPath = new global.myd.Uri(global.myd.urls.current_user).getPathname()

    @route( /^c\/(.*)$/, 'collectionRoute', @showCollection )
    @route( /^c\/(.*)\/screens\/([^\/\?]+)/, 'collection', @showCollection )

    @route( /^p\/(.*)\/([^\/\?]+)/, 'profileTab', @profileTab )

    #Needed for Google Analytics
    @bind 'all', @trackPageview

  #Google Analtics
  trackPageview: ->
    url = Backbone.history.getFragment()

    if _gaq?
      #console.log "_trackPageview #{url}"
      _gaq.push(['_trackPageview', "/#{url}"])

  topicNewest: (uid) ->
    @appView.showTopic(uid: uid, filter: "newest")

  topicLikes: (uid) ->
    @appView.showTopic(uid: uid, filter: "likes")

  topicModified: (uid) ->
    @appView.showTopic(uid: uid, filter: "modified")

  topicCommented: (uid) ->
    @appView.showTopic(uid: uid, filter: "commented")

  topicViews: (uid) ->
    @appView.showTopic(uid: uid, filter: "views")

  topicReuses: (uid) ->
    @appView.showTopic(uid: uid, filter: "reuses")

  followingNewest: ->
    @appView.showFollowing(filter: "newest")

  followingLikes: ->
    @appView.showFollowing(filter: "likes")

  followingModified: ->
    @appView.showFollowing(filter: "modified")

  followingCommented: ->
    @appView.showFollowing(filter: "commented")

  followingViews: ->
    @appView.showFollowing(filter: "views")

  followingReuses: ->
    @appView.showFollowing(filter: "reuses")

  newest: ->
    @appView.showNewest()

  likes: ->
    @appView.showByMostLikes()

  modified: ->
    @appView.showByModifiedDate()

  commented: ->
    @appView.showByMostCommented()

  views: ->
    @appView.showByViews()

  reuses: ->
    @appView.showByReuses()

  bookmarklet: ->
    @appView.showBookmarklet()

  showCollection: (collectionPath, assetUID, editable = false) ->
    routes = routesModule.getRoutesFromRelativePath( collectionPath )
    @appView.showCollection( routes, assetUID)

  search: (query) ->
    @appView.showSearch(query)

  profileTab:(userPath, tabName)->
    @appView.showProfile({tab: tabName, userPath: userPath})

  navigateToProfileTabForCurrentUser: (tab, options = {} ) ->
    @navigateToProfileTab(tab:tab, userPath:@currentUsersUserPath )

  navigateToProfileTab: (params) ->
    @navigate( "p#{params.userPath}/#{params.tab}", trigger: true )

  navigateToEditCollection: (path, params) ->
    @navigate(path, params)
    @appView.currentView.startInEditMode = true

global.myd.PapyrusRouter = PapyrusRouter
