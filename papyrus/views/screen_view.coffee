global.myd ?= {}

renderVideoEmbed = global.myd.renderVideoEmbed

class ScreenView extends Backbone.View
  model: myd.ScreenModel

  events:
    'click .asset-wrapper, .screen-app-link, .svg_play'     : 'selected'
    'click .screen-reuse'    : 'clickedReuse'
    'click .screen-fb-share' :  'clickedFBShare'
    'click .more-info'       :  'clickedMoreInfo'
    'click .origin_source_url':   'clickedSource'
    'click .screen-delete'    : 'clickedDelete'

  initialize: (params) ->
    @context = params.context
    @renderInline = params.inline
    @showComments = (@context == "collections")
    @tab = params.tab
    @searchItem = params.searchItem
    @isEditing = params.isEditing || false

    @model.get("item").bind("change:metaData", @toggleMetaDataView, @)
    @bind "finishEdit", => @addBarView?.trigger("finishEdit")
    @bind "cancelEdit", => @addBarView?.trigger("cancelEdit")
    @

  render: ->
    newRoot = ""
    if @renderInline
      newRoot = $("<section></section>")
    else
      newRoot = $("<li></li>")
    @setElement(newRoot)

    screenOptions = @getScreenOptions()
    #Paint the collection collage
    if @model.get("item").get("screens")?
      @$el.html(myd.renderScreen(@model.toJSON(), @context, screenOptions, @tab))
      myd.renderAssetFragment @model, @context, @$el
      if @renderinline then @$el.addClass("screen")
    else
      @$el.html(myd.renderScreen(@model.toJSON(), @context, screenOptions, @tab))

    if screenOptions.showScreenNavigation
      @screenNavView = new myd.ScreenNavView(model: @model, el: @$el.find(".screen-nav"))

    if @renderInline and @model.get("editable")
      @addBarView = new myd.AddBarView(model: @model, index: @model.get('index'))
      @addBarView.bind "addNewItem", (item) => @trigger("addNewItem", item)
      @addBarView.bind "addItem", (item) => @trigger("addItem", item)
      @$el.append(@addBarView.render())

    if @model.get("item").get("type") == "feed"
      @assetRSSView = new global.myd.AssetRSSView( model: @model.get("item"), container: @$el, removeEvents: (@context != "collections"), context: @context )
    else if @model.get("item").get("type") == "collection"
      @collectionAuthorView = new global.myd.CollectionAuthorView( model: @model, el: @$el.find(".collection_tile_meta"))

    @likeButtonView = new myd.LikeButtonView(model: @model, el: @$el.find(".like-container"))

    @likeContainer = @$el.find(".like-container")
    @caption = @$el.find(".caption-text")
    @headline = @$el.find("h2").first()
    @factText = @$el.find(".screen-text")
    @deleteIcon = @$el.find(".screen-delete")
    @reuseIcon = @$el.find(".screen-reuse")
    @shareIcon = @$el.find(".screen-fb-share")

    if @context == "profile" and (@tab == "collections" or @tab == "items") and @model.get("editable") and myd.feature.deletecollections
      @deleteIcon.css("display", "")

    if @showComments
      @$el.find(".screen-item").append("<aside class='comments'>")
      @commenteAside = @$el.find("aside.comments")
      @commentsCollection = new myd.CommentsCollection(comments_url: @model.get("comments_url"))
      @screenCommentsListView = new myd.ScreenCommentsListView( container: @$el.find("aside.comments"), item: @model, collection: @commentsCollection)
      @screenCommentsListView.bind("rendered", ->
        if @editMode
          $(@leaveCommentView.el).hide()
          $(@screenCommentsListView.el).hide()
      , @)
      @leaveCommentView = new myd.LeaveCommentView( container: @$el.find("aside.comments"), item: @model, collection: @commentsCollection )

    if @isEditing
      @startEditing()

    @$el.find(".asset img").on("load", =>
      @$el.find(".image-wrapper").css("opacity": 1)
      )

    # initialize the caption fields to the correct height
    @initCaptionFields()

  initCaptionFields: () ->
    CAPTION_MAX_HEIGHT = 300
    CAPTION_MIN_HEIGHT = 35
    text = @caption.val()
    lines = text?.match(new RegExp("\n\r?", "g"))
    lineHeight = 18
    textAreaHeight = 0

    if lines?.length?
      textAreaHeight = (lines.length + 1) * lineHeight
      if textAreaHeight > CAPTION_MAX_HEIGHT
        textAreaHeight = CAPTION_MAX_HEIGHT
    else
      textAreaHeight = CAPTION_MIN_HEIGHT

    @caption.height( textAreaHeight + "px")

    #make the caption field uneditable by default
    if @isEditing
      @enableCaptionField(true)
    else
      @enableCaptionField(false)

  enableCaptionField: (enable) ->
   if !enable
     @$el.find(".caption-wrapper").removeClass("active")
     @caption.attr("disabled", "disabled")
   else
     @$el.find(".caption-wrapper").addClass("active")
     @caption.removeAttr("disabled")



  getScreenOptions: ->
    screenOptions = {}
    if @context == "profile"
      screenOptions.showActions = true
      screenOptions.showLikeButton = true
      screenOptions.showReuseButton = true
      if @tab == "collections" or @tab == "items"
        screenOptions.showDeleteButton = true
    else if @context == "newest" or @context == "likes" or 
            @context == "topic" or @context == "following" or
            @context == "modified" or
            @context == "commented" or
            @context == "views" or
            @context == "reuses"
      screenOptions.showLikeButton = true
      screenOptions.showReuseButton = true
      screenOptions.showActions = true
    else if @context == "collections"
      screenOptions.showActions = true
      screenOptions.showReuseButton = true
      screenOptions.showLikeButton = true
      screenOptions.showFacebookShareButton = true
      screenOptions.showDeleteButton = true
      screenOptions.showScreenNavigation = true

    screenOptions

  selected: (event) ->

    origin = $(event.target)

    # this will take care of not poping up video elements in Safari and Firefox
    if origin.is("iframe")
      return false

    # this fixes an issue with the file input box.
    if origin.is("input")
      return true

    # Don't do anywhere if we're in edit mode and a fact
    # Still need to let fact links through however
    if (@model.get("item").get("type") == "fact" and @isEditing) or (@model.get("item").get("type") == "fact" and @context == "collections" and !origin.is("a"))
     return false

    # Don't do anything if we click the caption textarea
    if origin.hasClass("caption-text")
      return false

    # Fix for links in fact elements
    if @context == "collections" && @model.get("item").get("type") == "fact" && origin.is("a")
      @sourceWindow = window.open( origin.attr("href") )
      return false
    #If you click on a caption in edit mode it won't open the source
    else if (origin.hasClass("caption") or origin.hasClass("caption-text")) and @isEditing
      return false

    if @context == "collections" and @model.get("item").get("type") != "collection" and @model.get("item").get("type") != "video" and @model.get("item").get("type") != "fact" and !@isEditing
      @clickedSource()
    else if @context == "collections" and @model.get("item").get("type") == "video" && (origin.is('svg') or origin.is('img')) && !@isEditing
      @clickedPlayVideo()
    else
      # don't do anything if the asset type is video.  This is needed for Safari and Firefox
      if !@isEditing
        @trigger('selected', @model)
    false

  toggleMetaDataView: ->
    @metaDataView = new global.myd.AssetMetaDataView( model: @model.get("item"), container: @$el.find(".below-asset"))

  clickedMoreInfo: (event) ->
    target = $(event.currentTarget)

    if typeof @metaDataView == "undefined" or @metaDataView == null
      @model.get("item").fetchMetaData()
    else
      isShown = @metaDataView.toggle()
    false

  clickedReuse: ->
    #Launch reuse modal
    @reuseItemView = new myd.ReuseItemView model: @model
    false

  clickedPlayVideo: ->
    renderVideoEmbed @model, @$el, 600
    false

  clickedFBShare: ->
    frontMatterTitle = @model.collection.frontMatter.get("title") || "#{@model.collection.frontMatter.get("owner").first_name} #{@model.collection.frontMatter.get("owner").last_name}"
    typeName = myd.capFirstLetter @model.get('item').get("type")
    if @model.get("item").get("type") == "feed"
      typeName = "#{@model.get("item").get("title")} Feed"
    else if @model.get("item").get("type") == "fact"
      typeName = "Text"
    else if @model.get("item").get("type") == "collection"
      typeName = "#{@model.get("item").get("title")} Collage"

    title = "#{typeName} from #{frontMatterTitle}"
    thumbnail = @model.get("item").get("asset_url") || @model.get("item").get("cover_asset").thumbnail_url
    if @model.get("item").get("type") == "video" and @model.get("item").get("youtube_id")?
      thumbnail = myd.getVideoUrl(@model.get("item").get("youtube_id"))
    description = @model.get("item").get("description") || @$el.find(".screen-text").text().trim() || null
    caption = @model.get("caption") || null

    collectionUID = @model.collection.frontMatter.get("uid")
    url = "http://#{document.domain}/papyrus/c/api/collections/#{collectionUID}/screens/#{@model.get('uid')}"

    #override for facts and rss to show something good
    if @model.get("item").get("type") == "fact" or @model.get("item").get("type") == "feed"
      thumbnail = if @model.collection.frontMatter.get("cover_asset")? then @model.collection.frontMatter.get("cover_asset").thumbnail_url else "http://www.collagio.com/images/default_new_collection.png"

    if thumbnail.indexOf("//") == 0
      thumbnail = thumbnail.replace("//", "https://")

    ###
    console.log "title - #{title}"
    console.log "thumbnail - #{thumbnail}"
    console.log "description - #{description}"
    console.log "caption - #{caption}"
    console.log "url - #{url}"
    ###

    if FB?
      FB.ui(
        {
        method: 'feed',
        message: '',
        name: title,
        caption: caption,
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

  clickedSource: ->
    # handles pinned images and user uploaded files
    sourceUrl = if @model.get("item").get("source_page_url")? then @model.get("item").get("source_page_url") else @model.get("item").get("asset_url")
    if sourceUrl?.indexOf("http://") == 0 or sourceUrl?.indexOf("https://") == 0
      @sourceWindow = window.open( sourceUrl )
    false

  clickedDelete: ->
    if @context == "collections"
      @trigger("delete", @model)
      #blind
      @$el.hide("blind",1000, =>
        @close()
      )

    else if @context == "profile"
      if confirm "Are you sure you want to delete this? There is no undo."
        #Do remove call
        @model.trigger("deleteScreen", @model)
    false

  fetchComments: ->
    if @commentsCollection? and !@commentsCollection.fetched
      @commentsCollection.fetch()

  activateScreen: ->
    @commenteAside.css("opacity", 1)

    if @commentsCollection? and !@commentsCollection.fetched
      @commentsCollection.fetch()

  deactivateScreen: ->
    @commenteAside.css("opacity", 0.2)

  startEditing: ->
    @isEditing = true

    @deleteIcon.show()
    @reuseIcon.hide()
    @shareIcon.hide()
    @likeContainer.hide()
    if(@model.get("item").get("editable"))
      #add empty caption placeholder
      if (@model.get("item").get("type") == "image" or @model.get("item").get("type") == "video") and @model.get("caption")? and @model.get("caption").length == 0
        #@$el.find(".caption").html("<div class='caption-text' placeholder='Enter a caption' contenteditable='true'></div>")
        @$el.find(".caption").html("<div class='caption-wrapper'><textarea class='caption-text' placeholder='Enter a caption'></textarea></div>")
        @caption = @$el.find(".caption-text")

      if @model.get("item").get("type") == "fact"
        factWrapper = @$el.find('.fact-wrapper')
        if !factWrapper.find('h2').length
          factWrapper.prepend("<h2 placeholder='Enter Headline'>#{@model.get('item').get('title')}</h2>")

        #find the headline again since we just added it when there is none to begin with perhaps
        @headline = @$el.find("h2").first()
        @headline.attr("contenteditable", true)

        factWrapper = @$el.find('.fact-wrapper')
        if !@factText.length
          factWrapper.append("<div class='screen-text'>#{@model.get('item').get('text')}</div>")
          @factText = factWrapper.find('screen-text')
        formattedText = markdown.toHTML @model.get('item').get('text') || ""
        @factText.html("<textarea rows='4' cols='50' class='text-editor' id='fact-#{@model.get("item").get("uid")}'>#{formattedText}</textarea>")

        editor = tinyMCE.get("fact-#{@model.get('item').get('uid')}")
        window.setTimeout =>
          if typeof(editor) == "undefined"
            myd.renderTextEditor("fact-#{@model.get('item').get('uid')}")
          else
            editor.render()
        , 500

      # enable the caption field
      @enableCaptionField(true)



      @caption.keyup((e) ->
        if $(this).outerHeight() < 466
          while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth")))
            $(this).height($(this).height()+1)
          )

  stopEditing: ->
    @deleteIcon.hide()
    @reuseIcon.show()
    @shareIcon.show()
    @likeContainer.show()

    @headline.attr("contenteditable", false)

    captionText = @caption.val()
    if captionText?.length? == 0
      @caption.remove()

    #disable caption field
    @enableCaptionField(false)

    @saveModelChanges()

    #Restore the text here
    if @factText.length and @model.get("item").get("type") == "fact"
      @factText.attr("contenteditable", false)
      @factText.html(markdown.toHTML(@model.get('item').get('text')))

    try
      tinyMCE.get("fact-#{@model.get('item').get('uid')}")?.remove()
    catch error
      foo = error

    @isEditing = false

  saveModelChanges: ->
    if (@model.get("item").get("type") == "image" or @model.get("item").get("type") == "video") and @model.get("caption") != @caption.val()
      @model.set("caption", @caption.val(), silent: true)

    if @model.get("item").get("type") == "fact"

      if @model.get("item").get("title") != @headline.text().trim()
        @model.get("item").set("title", @headline.text().trim(), silent: true)

      editor = tinyMCE.get("fact-#{@model.get('item').get('uid')}")
      if editor?
        contentHTML = $("<div>").html(editor.getContent())[0]
        markdownContent = markdown.serialize(contentHTML)
        if @model.get("item").get("text") != markdownContent
          @model.get("item").set("text", markdownContent, silent: true)

  onClose: ->
    try
      tinyMCE.get("fact-#{@model.get('item').get('uid')}")?.remove()
    catch error
      foo = error

    @model.get("item").unbind("change:metaData", @toggleMetaDataView, @)
    @unbind "finishEdit", => @addBarView?.trigger("finishEdit")
    @unbind "cancelEdit", => @addBarView?.trigger("cancelEdit")


    if @addBarView?
      @addBarView.unbind "addNewItem", (item) => @trigger("addNewItem", item)
      @addBarView.unbind "addItem", (item) => @trigger("addItem", item)
      @addBarView.close()
    @assetRSSView?.close()
    @reuseItemView?.close()
    @metaDataView?.close()
    @likeButtonView?.close()
    @leaveCommentView?.close()
    @screenCommentsListView?.close()
    @screenNavView?.close()

global.myd.ScreenView = ScreenView
