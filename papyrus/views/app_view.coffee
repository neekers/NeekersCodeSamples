
global.myd ?= {}
global.myd.urls ?= {}
global.myd.urls.current_user ?= {}
global.myd.topics ?= {}

class AppView extends Backbone.View
  el: "body"

  prevScreenId: null
  currentView: null

  # todo - lots of repetition
  initialize: (dependencies) ->

    window.Router = new myd.PapyrusRouter({
    app_view: @
    })


    @feedbackView = new global.myd.FeedbackView()
    @headerView = new global.myd.HeaderView(@)
    @notificationsView = new global.myd.NotificationsListView(container: @headerView.$el.find(".login"))

    campaignCode = new global.myd.Uri(window.location).get("utm_campaign")
    if campaignCode
      _gaq.push(['_setCustomVar',
        1,                    #This custom var is set to slot #1.  Required parameter.
        'Member Type',        # The name of the custom variable.  Required parameter.
        campaignCode.value,   # The value of the custom variable.  Required parameter.
        #  (possible values might be Free, Bronze, Gold, and Platinum)
        1                     # Sets the scope to visitor-level.  Optional parameter.
      ])


    ca = document.cookie.split(';')
    for i in ca
      if(i.indexOf("publish") > -1)
        global.myd.feature["publish"] = true
    #@wayBackCollection = new myd.WayBackCollection()
    #@wayBackView = new myd.WayBackView( container: $("body"), collection: @wayBackCollection )
    @setFeatureFlags()

    # Set omniture page name
    # Sometimes this is overridden (ex: collage view)
    omnicollagio.pageName = 'home'

    @

  setFeatureFlags: ->

    flags = _.map _.keys(global.myd.feature), (flag) -> "ff-#{flag}"
    $('html').addClass(flags.join(' '))

  showCollection: (mydCollection, assetUID) ->
    collageView = new myd.CollageView(
      collection: new myd.GridCollection
      streamView: true)
    @showView collageView, mydCollection, assetUID

  showAssetInFullScreen: (assetUID) ->
    if @currentView?
      @currentView.showFullScreen(assetUID)

  closeCurrentView: ->
    $(".menu a.selected").removeClass("selected")
    @currentView.unbind("rendered", @rendered, @)
    @currentView.close()
    @currentView = null

  showView: (view, params...) ->
    # remove the first time call out if it's there
    if params?.tab == 'likes' && document.location.hash.indexOf('first') != -1
      $('#first_time_user_callout').remove()

    if @currentView?
      @closeCurrentView()

    if @notificationsView?
      @notificationsView.toggleList(close:true)
      @notificationsView.refresh()
    @currentView = view
    @currentView.bind("rendered", @rendered, @)
    @currentView.display(params...)

  rendered: (params) ->
    # Do not show first time user callout if screen is too small
    smallScreen = false
    new mediaQuery({
      media: 'screen and (max-width: 639px)'
      entry: ->
        smallScreen = true
      exit: ->
    })

    if @wayBackCollection? and params?
      if params.clearHistory
        @wayBackCollection.reset()

      url = Backbone.history.getFragment()
      if params? and params.thumbnail?
        @wayBackCollection.add new myd.BreadcrumbModel( url:url, name: document.title, thumbnail: params.thumbnail ), at:0
      else

        @wayBackCollection.add new myd.BreadcrumbModel( url:url, name: document.title ), at:0

    if params?.tab == 'likes' && !smallScreen && document.location.hash.indexOf('first') != -1
      body = $('body')
      body.addClass("cf")
      body.addClass('onboardComplete')
      template = Mustache.render $("#first_time_user_callout").html()
      $(".name-header").append(template)

      @$el.bind('click'
        ()->
          $(this).removeClass 'onboardComplete'
      )

    # omniture user tracking
    omnicollagio.eVar16 = myd.urls.current_user;
    omnicollagio.eVar23 = "D=v16";

    #ominture page tracking
    omnicollagio.t(this, 'o', window.location)
    omnicollagio.events = ''


  showNewest: () ->
    newestView = new myd.ExploreNewestView(
      collection: _.extend(new myd.NewestGridCollection,
        url: myd.urls.new_stream
      )
      filter: "newest"
      streamView: true
      appView: @
    )
    @showView newestView
    @trigger("changedSection", {section: 'newest'})

  showByMostLikes: () ->
    exploreMostLikesView = new myd.ExploreMostLikesView(
      collection: _.extend(new myd.MostLikesGridCollection,
        url: myd.urls.popular
      )
      filter: "likes"
      streamView: true,
      appView: @
    )
    @showView exploreMostLikesView
    @trigger("changedSection", {section: 'likes'})

  showByModifiedDate: () ->
    exploreModifiedDateView = new myd.ExploreModifiedDateView(
      collection: _.extend(new myd.ModifiedDateGridCollection,
        url: myd.urls.modification
      )
      filter: "modified"
      streamView: true,
      appView: @
    )
    @showView exploreModifiedDateView
    @trigger("changedSection", {section: 'modified'})


  showByMostCommented: () ->
    exploreMostCommentedView = new myd.ExploreMostCommentedView(
      collection: _.extend(new myd.MostCommentedGridCollection,
        url: myd.urls.comments
      )
      filter: "commented"
      streamView: true,
      appView: @
    )
    @showView exploreMostCommentedView
    @trigger("changedSection", {section: 'commented'})


  showByViews: () ->
    exploreByViews = new myd.ExploreByViews(
      collection: _.extend(new myd.ViewsGridCollection,
        url: myd.urls.views
      )
      filter: "views"
      streamView: true,
      appView: @
    )
    @showView exploreByViews
    @trigger("changedSection", {section: 'views'})

  showByReuses: () ->
    exploreByReuses = new myd.ExploreByReuses(
      collection: _.extend(new myd.ReusesGridCollection,
        url: myd.urls.reuses
      )
      filter: "reuses"
      streamView: true,
      appView: @
    )
    @showView exploreByReuses
    @trigger("changedSection", {section: 'reuses'})


  showTopic: (params = uid: 0, filter: "newest") ->
    topicView = new myd.ExploreTopicView(
      collection: _.extend(new myd.TopicGridCollection,
        url: "/api/collections/#{params.uid}"
      )
      filter: params.filter
      uid: params.uid
      streamView: true
      appView: @
    )
    @showView topicView

  showFollowing: (params = filter: "modified") ->

    followingRoutes = {
      "newest"    : myd.urls.following_collections_creation
      "likes"     : myd.urls.following_collections_likes
      "modified"  : myd.urls.following_collections_modification
      "commented" : myd.urls.following_collections_comments
      "views"     : myd.urls.following_collections_views
      "reuses"    : myd.urls.following_collections_reuses
    }

    #console.log "following filter: " + params.filter
    exploreFollowing = new myd.ExploreFollowing(
      collection: _.extend(new myd.FollowingGridCollection,
        url: followingRoutes[params.filter]
      )
      filter: params.filter
      streamView: true,
      appView: @
    )
    @showView exploreFollowing
    @trigger("changedSection", {section: 'following'})

  showProfile:(params) ->
    myProfileView = new myd.ProfileView(
      collection: new myd.ProfileGridCollection(params)
      tab: params.tab
    )
    @showView myProfileView, {tab: params.tab, userPath: params.userPath}

  showSearch: (query) ->
    searchGridView = new myd.SearchView(
      collection: new myd.GridCollection
      searchTerm: query
    )
    @showView searchGridView

  showBookmarklet: ->
    @showView new myd.BookmarkletView

global.myd.AppView = AppView
