global.myd ?= {}

class CollageView extends Backbone.View
  el: "#collections"
  collection: myd.GridCollection

  events:
    'click div > .fb-share':        'shareCollection'
    'click #back-to-top':           'clickedBackToTop'
    'click .colleciton-reuse':      'clickedReuse'
    'click .collection-fb-share':   'clickedShare'
    'click .publish span:first':    'clickedPublish'
    'click .publish span:last':     'clickedUnPublish'

  bindToCollection:
    'errorReset': "renderError"
    'reset': "reset"
    'add': "addNewScreen"
    'reordered': "reorderedReset"
    'deleteScreen': "deleteScreen"
    'remove': "reindexCollection"

  initialize: (params) ->
    @window = $(window)

    $("#content").html(Mustache.render($("#full_stacked_view_template").html()))
    @setElement($("div#collections"))

    $("body").bind('keyup', (event) => @screenKeyNav(event))

    @frontMatterView = null
    @weAreInEditingMode = false
    @context = "collections"
    @clearHistory = params.clearHistory || false
    @startInEditMode = false
    @editBar = $('.edit')
    @editCollectionButton = $('#edit-collection')

    @activeScreenIndex = 0
    @screenViews = []
    @tileViewCreator = params.tileViewCreator || (tileModel) =>
      entity_url = tileModel.get("entity_url")

      assetView = new myd.ScreenView(model: tileModel, context: "collections", inline: true, isEditing: @weAreInEditingMode)
      assetView.bind('selected', @selectedAsset, @)
      assetView.bind('addItem', @callAddItem, @)
      assetView.bind('addNewItem', @callAddNewItem, @)
      assetView.bind('delete', @deleteScreen, @)
      assetView.bind('active', @activeScreen, @)
      @screenViews.push assetView
      assetView
    @collection = params.collection

    #retain featureflag persistence of publish/unpublish
    if(document.cookie.indexOf("publish") >0 )
      global.myd.feature["publish"] = true


  display: (mydCollection, assetUID) ->
    @showCommentsForScreen = assetUID
    @collection.fetch(mydCollection)

  reset: ->
    @closeScreens()

    $("#content").html(Mustache.render($("#full_stacked_view_template").html()))
    @setElement($("div#collections"))

    @editBar.find('.cancel-edit-btn, .done-edit-btn, .reorder-btn').unbind('click')

    if @$el.find("article").length == 0 then @$el.find("ol").empty()
    if @frontMatterView != null
      @frontMatterView.unbind("refresh", => @collection.fetch())
      @frontMatterView.unbind("editBackground", @launchEditBackground, @)
      @frontMatterView.close()

    @render()

  # Like reset but this doesn't touch the front matter
  reorderedReset: ->
    @closeScreens()
    @renderCollectionTiles()

    myd.Placeholder().refresh(@$el)

  render: (params) ->
    $("#page-title").text(@collection.frontMatter.get("title"))
    document.title = "#{$('#page-title').text()} - Collagio"

    # Omniture - Collage view
    omnicollagio.pageName = "topic > " + @collection.frontMatter.get('topic_title') + ": collage detail: " + @collection.frontMatter.get('uid')
    omnicollagio.eVar15 = "D=pageName"
    if omnicollagio.events?.length
      omnicollagio.events += ",event8"
    else
      omnicollagio.events = "event8"
    # tracks time per topic.
    omnicollagio.prop7 = @collection.frontMatter.get("topic_title")

    $(".page-header").addClass("collection")

    @editBar.find('.cancel-edit-btn').click => @cancelEdit()
    @editBar.find('.done-edit-btn').click => @finishEdit()
    @editBar.find('.reorder-btn').click => @launchReorder()

    @frontMatterView = new global.myd.CollageHeaderView(
      container: @$el,
      model: @collection.frontMatter,
      collection: @collection
      isEditing: @weAreInEditingMode || false
      type:    {
        likes:   "likes"
        profile       :   "profile"
        newest           :   "newest"
        collections   :   "collection"
      }[@context]
    )
    @frontMatterView.bind("refresh", => @collection.fetch())
    @frontMatterView.bind("editBackground", @launchEditBackground, @)

    @renderCollectionTiles()

    #scroll to the screen
    if @showCommentsForScreen
      counter = 0
      index = 0
      _.each @collection.models, (screen) =>
        if screen.get("uid") == @showCommentsForScreen
          index = counter
          @activeScreenIndex = index+1
          @screenViews[index].activateScreen()
          @screenViews[index].$el.find("aside.comments").addClass("show")
          return
        ++counter

      itemEl =  $("a[name='screen-#{index+1}']")
      if itemEl.length
        $("body, html").delay(3000).animate({
          'scrollTop':  itemEl.offset().top - 80
        }, 500, "easeOutCirc")
      @showCommentsForScreen = null

    $(window).bind 'scroll', _.throttle($.proxy(@checkScroll, this), 500)

    if @collection.models.length == 0 #need this to trigger the recommended to show right away
      @checkScroll()

    if @collection.frontMatter.get("editable")
      myd.initTextEditor()

    # Get the first screens comments
    @screenViews[0]?.fetchComments()

    if @collection.frontMatter.get("editable")
      @editCollectionButton.show()
      self = this
      @editCollectionButton.click  (event) ->
        event.preventDefault()
        self.enterEditingMode()
    else
      @editCollectionButton.hide()

    if @startInEditMode then @enterEditingMode()

    if @collection.frontMatter.get("cover_asset")?
      @trigger("rendered", clearHistory: @clearHistory, thumbnail: @collection.frontMatter.get("cover_asset").thumbnail_url)
    else
      @trigger("rendered", clearHistory: @clearHistory)

    # increment the collection's view count
    @incrementViewCount()


  incrementViewCount: ->
    incrementViewCountUrl = @collection.collection.increment_view_count
    
    myd.serviceModule.post(
      url: incrementViewCountUrl
      data:  []
      success: ( response ) =>
        @onIncrementViewCountSuccess(response)
      error: (response) =>
        # Nothing to do here
    )

  onIncrementViewCountSuccess: (response) ->
    @frontMatterView.model.set('view_count', response.view_count)

  screenKeyNav: (event) ->
    # This allows us to use a textarea or input when leaving a comment on a screen
    if event.target.tagName.toLowerCase() == "input" or event.target.tagName.toLowerCase() == "textarea" or $(event.target).attr("contenteditable")
      return false

    if event.keyCode == 74 #J
      itemEl =  $("a[name='screen-#{@activeScreenIndex+1}']")
      if itemEl then @activeScreenIndex++
    else if event.keyCode == 75 #k
      itemEl =  $("a[name='screen-#{@activeScreenIndex-1}']")
      if itemEl then @activeScreenIndex--
    else if !@weAreInEditingMode and event.keyCode == 82 #R
      @screenViews[@activeScreenIndex-1]?.clickedReuse()
      return false
    else if !@weAreInEditingMode and event.keyCode == 72 #H for heart
      @screenViews[@activeScreenIndex-1]?.likeButtonView.clickedLike()
      return false
    else if !@weAreInEditingMode and event.keyCode == 83 #S
      @screenViews[@activeScreenIndex-1]?.clickedFBShare()
      return false
    else if !@weAreInEditingMode and event.keyCode == 67 #C leave a comment
      @screenViews[@activeScreenIndex-1]?.leaveCommentView.textInput.focus()
      return false

    if itemEl?.length
      $("body, html").animate({
      'scrollTop':  itemEl.offset().top - 100
      }, 500, "easeOutCirc");
    false

  addNewScreen: (screenModel, collection, options) ->
    entity_url = screenModel.get("entity_url")

    screenModel.set("index", options.index, silent: true)

    screenView = new myd.ScreenView(model: screenModel, context: "collections", inline: true, isEditing: true)
    screenView.bind('selected', @selectedAsset, @)
    screenView.bind('addItem', @callAddItem, @)
    screenView.bind('addNewItem', @callAddNewItem, @)
    screenView.bind('delete', @deleteScreen, @)
    screenView.bind('active', @activeScreen, @)
    screenView.render()
    if options.index > 0
      @$el.find("article section:eq(#{options.index-1})").after screenView.el
    else
      @$el.find("article > div").after screenView.el

    @screenViews.splice(options.index, 0, screenView)

    myd.Placeholder().refresh(@$el)
    # Adjust all the indexes for each screen
    @reindexCollection()

  deleteScreen: (screen) ->
    @collection.remove(screen, silent: true)
    #update frontmatter with new count as well
    oldCount = @frontMatterView.model.get("screens_count")
    @frontMatterView.model.set("screens_count", --oldCount)
    @reindexCollection()

  reindexCollection: ->
    _.each @collection.models, (screenModel, index, collection) ->
      screenModel.set("prevIndex", index)
      screenModel.set("nextIndex", index+2)
      screenModel.set("index", index+1)

  checkScroll: ->
    docViewTop = @window.scrollTop()
    docViewBottom = docViewTop + @window.height()
    middle = @window.scrollTop()+(@window.height()/2)

    screenEls = @$el.find(".screen-item")
    _.all @screenViews, (screenView) =>
      screenEl = screenView.$el
      elemTop = screenEl.offset().top
      elemBottom = elemTop + screenEl.height()

      if elemTop <= middle and elemTop > docViewTop and elemTop < docViewBottom
        screenV.deactivateScreen() for screenV in @screenViews
        screenView.activateScreen()

        #also get the next screens comments
        currentIndex = _.indexOf(@screenViews, screenView)
        @activeScreenIndex = currentIndex+1
        @screenViews[currentIndex+1]?.fetchComments()
        return false
      true

    # Show Recommended callages when the user scrolls down to almost the end
    if (@collection.models.length == 0 or @activeScreenIndex >= @collection.models.length-3) and typeof @recommendedCollagesView == "undefined"
      @recommendedCollagesView = new myd.RecommendedCollagesView(
        container: $("#content"),
        topic: @collection.frontMatter.get("topic_title"),
        currentCollectionUID: @collection.frontMatter.id)

    if @context == "collections"
      if docViewTop > 360 then $("#back-to-top").slideDown() else $("#back-to-top").slideUp()

  enterEditingMode: ->
    @weAreInEditingMode = true

    $('body').addClass('editing')

    @frontMatterView.startEditMode()
    @addFullScreenAddBar()

    screen.startEditing() for screen in @screenViews
    myd.Placeholder().refresh(@$el)

    @startInEditMode = false
    $('.comments a').bind('click', -> false)

    ##feature flag for show hide publish buttons
    if(myd.feature["publish"])
      publishDiv = @$el.find(".publish")
      publishDiv.show()
      if @collection.frontMatter.attributes.published
        publishDiv.find("span:first").addClass("publish-on").removeClass("publish-off")
        publishDiv.find("span:last").addClass("publish-off").removeClass("publish-on")
      else
        publishDiv.find("span:first").addClass("publish-off").removeClass("publish-on")
        publishDiv.find("span:last").addClass("publish-on").removeClass("publish-off")
    ##
    false
  clickedPublish: ->
    publishDiv = @$el.find(".publish")
    publishDiv.find("span:first").addClass("publish-on").removeClass("publish-off")
    publishDiv.find("span:last").addClass("publish-off").removeClass("publish-on")
  clickedUnPublish: ->
    publishDiv = @$el.find(".publish")
    publishDiv.find("span:first").addClass("publish-off").removeClass("publish-on")
    publishDiv.find("span:last").addClass("publish-on").removeClass("publish-off")
  cancelEdit: ->
    @screenViews.map (screen) ->
      screen.trigger("cancelEdit")

    #clear out the page ready for the cancelled data to come back in.
    if $("#content article").length > 0
      @closeScreens()
      $("#content").html(Mustache.render($("#full_stacked_view_template").html()))

    @trigger("cancelEdit")

    @leaveEditingMode()
    @collection.cancelEditing()
    false

  finishEdit: (params = callBack: null) ->

    @screenViews.map (screen) =>
      screen.trigger("finishEdit")

#    myd.Placeholder().clean(@$el)
    # Set the new collage title and desc back to the UI

    #set publish buttons if they are visible
    if(myd.feature["publish"])
      publishDiv = @$el.find(".publish")
      if(publishDiv.is(":visible"))
        isPublishSelected = if publishDiv.find("span:first").hasClass("publish-on") then true else false
        @collection.frontMatter.set("published", isPublishSelected, silent: true)
        publishDiv.hide()
    textValue = @$el.find("h1.title").first().text().trim()
    @$el.find("h1.title").first().removeClass("error-message-collage-title")

    if(textValue.toLowerCase() != "please enter a title...")
      @collection.frontMatter.set("title",textValue , silent: true)
    else
      return

    if @$el.find(".description").first().text().trim() != "Enter description"
      @collection.frontMatter.set("description", @$el.find(".description").first().text().trim(), silent: true)
    else
      @$el.find(".description").first().text('')
      @collection.frontMatter.set("description", '', silent: true)

    # Turn off collage header contenteditable
    @$el.find("h1, .description").attr("contenteditable", false)

    # Have each screen prepare their changes before submission
    screen.stopEditing() for screen in @screenViews

    @trigger("finishEdit")

    @leaveEditingMode(params.silent)
    @syncEdit(callBack: params.callBack)

    @collection.saveCurrentStateAsOriginal()
    false

  leaveEditingMode: ->

    @weAreInEditingMode = false

    $('body').removeClass('editing')

    if @frontMatterView?
      @frontMatterView.leaveEditMode()

    if @addBarView?
      @bind "finishEdit", => @addBarView.trigger("finishEdit")
      @bind "cancelEdit", => @addBarView.trigger("cancelEdit")
      @addBarView.close()

    $('.comments a').unbind('click')

  # Simply renders the tiles in the article or div, not the frontmatter
  # This is used in adding a new item to the collection
  renderCollectionTiles: ->
    # tiles
    indexer = 1

    rendered_view_html = @collection.map (tile) =>
      tile.set("index", indexer, silent: true)
      tile.set("nextIndex", indexer+1, silent: true)
      tile.set("prevIndex", indexer-1, silent: true)

      view = @tileViewCreator(tile)
      view.render()
      indexer++
      view.el

    #sometimes we have an ordered list, Collages are articles
    if @$el.find('article').length
      @$el.find('article').html(rendered_view_html)
    else
      @$el.find('ol').html(rendered_view_html)

    #chances are we're repainting the collection after an add new item, so we need to add this back in at the top
    if @weAreInEditingMode then @addFullScreenAddBar()

  addFullScreenAddBar: ->
    # Temporary fix. Prevents multiple top add bars from showing up when clicking cancel then edit again.
    # There's a memory leak with edit and I presume this is part of it.
    @$el.find('article > div > .add-bar').parent().remove()

    @addBarView = new myd.AddBarView(model: @collection.frontMatter, index: 0, first_time: @startInEditMode)
    @$el.find('article').prepend(@addBarView.render())

    @bind "finishEdit", => @addBarView.trigger("finishEdit")
    @bind "cancelEdit", => @addBarView.trigger("cancelEdit")

    @addBarView.bind "addItem", (item) => @callAddItem(item)
    @addBarView.bind "addNewItem", (item) => @callAddNewItem(item)

  syncEdit:(params = callBack: null) ->
    if params.callBack == null
      @collection.sync(@leaveEditingMode)
    else
      @collection.sync(params.callBack)

  launchReorder: ->
    # Do silent save so we dont miss anything before we refresh all the views after reorder
    myd.Placeholder().clean(@$el)
    screen.saveModelChanges() for screen in @screenViews

    @reorderView = new myd.ReorderCollectionView(collection: @collection)
    false

  clickedBackToTop: ->
    $("body, html").animate({
      'scrollTop': 0
    }, 500)
    false

  callSetCover: (item)->
    @collection.setCoverImage(item)
    @newPhotoVideoView.close()
    @overlayView.close()
    @collection.frontMatter.set("cover_asset", item.toJSON())

  selectedAsset: (screen) ->
    myd.common.selectedScreen(screen)

  submitAssetEdit: (asset) ->
    @collection.sync_api(asset)

  renderError: ->
    @$el.html("There was an error processing your request.")

  callAddItem: (params) ->
    index = params.item.get('index')

    if params.item.get("search_origin")? #searches need to be added new
      params.item.set("asset_type", if params.item.get("type") == "ImageAsset" then "image" else "video")
      @collection.addNewItem(params.item, index)
    else
      @collection.addItemToCollection(params.item, index)
    false

  callAddNewItem: (params) ->
    index = params.item.get('index')

    @collection.addNewItem(params.item, Number(index))
    false

  shareCollection: ->
    title = @collection.frontMatter.get("title")
    thumbnail = @collection.frontMatter.get("cover_asset").thumbnail_url
    description = @collection.frontMatter.get("description")
    url = window.location.href.replace("local.collagio.com:9292", "test.collagio.com")

    #get the description
    if FB?
      FB.ui(
        {
        method: 'feed',
        message: '',
        name: title,
        caption: '',
        description: description,
        link: url,
        picture: thumbnail,
        display: 'popup',
        actions: [
          { name: 'Check Out Collagio', link: 'http://www.collagio.com/' }
        ],
        user_message_prompt: 'Share your thoughts about Collagio'
        },
        (response) ->
          if response && response.post_id
            #alert 'Post was published.'
          else
            #alert 'Post was not published.'
      )
    false

  clickedReuse: ->
    #Launch reuse modal
    @reuseItemView = new myd.ReuseItemView model: @collection
    false

  clickedShare: ->
    title = @collection.frontMatter.get("title")
    thumbnail = @collection.frontMatter.get("cover_asset")?.thumbnail_url
    description = @collection.frontMatter.get("description")
    url = window.location.href.replace("local.collagio.com:9292", "test.collagio.com")

    #get the description
    if FB?
      FB.ui(
        {
        method: 'feed',
        message: '',
        name: title,
        caption: '',
        description: description,
        link: url,
        picture: thumbnail,
        display: 'popup',
        actions: [
          { name: 'Check Out Collagio', link: 'http://www.collagio.com/' }
        ],
        user_message_prompt: 'Share your thoughts about Collagio'
        },
        (response) ->
          if response && response.post_id
            #alert 'Post was published.'
          else
            #alert 'Post was not published.'
        )
      false

  callAddItemToCollection: (item) ->
    @trigger("addItem", view: @, item: item)
    return false

  launchEditBackground: ->
    #need just the items from each screen
    items = []
    #fix videos
    _.each @collection.models, (screen) ->
      if screen.get("item").get("type") == "image" or screen.get("item").get("type") == "video" or screen.get("item").get("type") == "collection"
        if screen.get("item").get("type") == "video" and screen.get("item").get("youtube_id")?
          screen.get("item").set("image_300_url", myd.getVideoUrl(screen.get("item").get("youtube_id")))
        
        items.push screen.get("item")

    @overlayView = new myd.OverlayView()
    @newPhotoVideoView = new myd.AddPhotoVideoView(container: $("body"), addType: "cover", collectionItems: items)
    @newPhotoVideoView.bind("addItem", @callAddItemToCollection, @)
    @newPhotoVideoView.bind("setCover", @callSetCover, @)
    @newPhotoVideoView.bind("cancel", => @overlayView.close())

  closeScreens: ->
    _.each @screenViews, (screenView )->
      screenView.unbind('selected', @selectedAsset, @)
      screenView.unbind('addItem', @callAddItem, @)
      screenView.unbind('addNewItem', @callAddNewItem, @)
      screenView.unbind('delete', @deleteScreen, @)
      screenView.close()
    @screenViews = []

  onClose: ->
    $.removeCookie("add_image_search")

    $("body").unbind('keyup')

    @recommendedCollagesView?.close()

    if @addBarView?
      @bind "finishEdit", => @addBarView.trigger("finishEdit")
      @bind "cancelEdit", => @addBarView.trigger("cancelEdit")
      @addBarView.close()

    @closeScreens()

    @reuseItemView?.close()

    if @frontMatterView?
      @frontMatterView.unbind("refresh")
      @frontMatterView.unbind("editBackground", @launchEditBackground, @)
      @frontMatterView.close()

    @reorderView?.close()

    @editCollectionButton.hide()

    @leaveEditingMode()

global.myd.CollageView = CollageView
