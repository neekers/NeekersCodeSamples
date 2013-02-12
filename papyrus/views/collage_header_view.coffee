global.myd ?= {}

routesModule = myd.routesModule

class CollageHeaderView extends Backbone.View
  tagName: "div"
  className: "front-matter"
  model: myd.FrontMatterTileModel

  events:
    'click .author-url'             : 'clickedUserLink'
    'click .topic'                  : 'clickedTopic'
    'click #edit-background'        : 'clickedEditBackground'
    'click .collection-reuse'       : 'clickedReuse'

  clickedTopicsButton: ->
    Router.navigateToTopicsTab()

  initialize: (params) ->
    @containerEl = params.container
    @collection = params.collection
    @isEditing = params.isEditing
    @currentUserModel = params.currentUserModel

    @model.bind("change:collected", @refreshLike, @)
    @model.bind("change:screens_count", @refreshElementsCount, @)
    @model.bind("change:cover_asset", @refreshCover, @)
    @model.bind("change:view_count", @refreshViewCount, @)

    @render()
    @

  render: ->
    #we don't need front matter in my stream
    if @options.type == "mystream"
      return

    template = $("#front_matter_template_#{@options.type}").html()
    if !template
      return

    templateObject = @model.toJSON()

    total_comment_count = if templateObject.total_comment_count? > 0 then templateObject.total_comment_count else "0"
    templateObject.total_comment_count = if total_comment_count > 999 then total_comment_count + "k" else total_comment_count
    templateObject.comment_label = if total_comment_count != 1 then "Comments" else "Comment"

    view_count = if templateObject.view_count? > 0 then templateObject.view_count else "0"
    templateObject.view_count = if view_count > 999 then view_count + "k" else view_count
    templateObject.view_label = if view_count != 1 then "Views" else "View"

    currentDate = new Date();
    creationDate = new Date();
    updatedDate = new Date();
    creationDate.setTime(templateObject.created_timestamp * 1000 )
    updatedDate.setTime(templateObject.modified_timestamp * 1000 )
    templateObject.createdAgo = global.myd.timeDifference(currentDate,creationDate)
    templateObject.updatedAgo = global.myd.timeDifference(currentDate,updatedDate)


    #end place holder data for new front end social features

    switch @options.type
      when 'search'
        templateObject = myd.pluralizeIfNeeded( templateObject, 'result_quantity', 'Element' )
      when 'collection'
        templateObject = myd.pluralizeIfNeeded( templateObject, 'screens_count', 'Item' )
      when 'newest' #For screen_count_text
        templateObject = myd.pluralizeIfNeeded( templateObject, 'screen_count', 'Collection' )
      when 'profile'
        templateObject.currentUser = @currentUserModel.toJSON()
        templateObject.currentUser = myd.pluralizeIfNeeded( templateObject.currentUser, 'collection_count', "Collage" )
        templateObject = myd.pluralizeIfNeeded( templateObject, 'screens_count', "Collage" )

    templateObject = myd.pluralizeIfNeeded( templateObject, 'collected_count', 'Time' )

    if templateObject.cover_asset? and templateObject.cover_asset.type == "video" and templateObject.cover_asset.youtube_id?
      templateObject.cover_asset.asset_url = "http://img.youtube.com/vi/#{templateObject.cover_asset.youtube_id}/0.jpg"

    if templateObject.cover_asset == null
      templateObject.cover_asset = {}
      templateObject.cover_asset.asset_url = "/images/default_new_collection.png"
      
    if myd.feature.testing and templateObject.cover_asset?
      templateObject.cover_asset.asset_url = "/images/default_new_collection.png"

    renderedContent = Mustache.render(template, templateObject)
    @containerEl.prepend(renderedContent)
    @setElement($("#collage-header .header-content"))

    @likeButtonView = new myd.LikeButtonView(model: @collection.frontMatter, el: @$el.find(".like-container"))
    @itemCount = @$el.find(".item-count")
    @viewCount = @$el.find(".collage-header-view-count")
    @viewCountLabel = @$el.find(".collage-header-view-label")

    if @options.type == 'collection'
      @blurHeader()

    if @isEditing
      @startEditMode()
    @refreshFollowingUser()
    @

  refreshFollowingUser: ->
    following_el =$(".follow-user")
    current_user_path = myd.urls.current_user
    #check to see if you are looking at your own profile
    userid = current_user_path.substring(current_user_path.lastIndexOf("/")+1,current_user_path.length)
    if(window.location.pathname.indexOf(userid) > 0)
      following_el.hide()
    else
      if(@collection.collection?.owner.collected == true || @.currentUser?.get("collected"))
        following_el.find(".text").html("FOLLOWING USER")
        following_el.addClass("followed-user-btn").removeClass("following-user-btn")
      else
        following_el.find(".text").html("FOLLOW USER")
        following_el.removeClass("followed-user-btn").addClass("following-user-btn")

  refreshElementsCount: ->
    @itemCount.html(@model.get("screens_count") + " " + myd.pluralizeIfNeededText(@model.get("screens_count"), "Element"))

  refreshViewCount: ->
    view_count = @model.get("view_count")
    view_count = if view_count > 999 then view_count + "k" else view_count
    @viewCount.text(view_count)

    view_count = @model.get("view_count")
    view_count_label = if view_count != 1 then "Views" else "View"
    @viewCountLabel.text(view_count_label)

 

  refreshCover: ->
    if @model.get("cover_asset").type == "video" and @model.get("cover_asset").youtube_id?
      @model.get('cover_asset').asset_url = myd.getVideoUrl(@model.get("cover_asset").youtube_id)
    $("#collage-header").css("background-image", "url(#{@model.get('cover_asset').asset_url})")
    @blurHeader()

  blurHeader: ->
    $("#collage-header").find('canvas').remove()
    $(".page-header").find('canvas').remove()

    image = @model.get('cover_asset')?.asset_url
    if !image then return
    
    img = new Image()
    img.onload = =>
      Pixastic.process(img, "blurfast", {amount: .4}, (el)=>
        $("#collage-header").prepend(el)

        @blurredBackground = $(el)

        height = @blurredBackground.height()
        width = @blurredBackground.width()

        maxHeight = $("#collage-header").height() + $(".head-wrap").height()
        maxWidth = $(window).width()

        ratio = 1

        if width / height >= maxWidth / maxHeight
          ratio = maxHeight / height
          newHeight = maxHeight
          newWidth = width * ratio
          offsetX = -1 * Math.abs((width - maxWidth)/2)
          offsetY = 0
        else
          ratio = maxWidth / width
          newWidth = maxWidth
          newHeight = height * ratio
          offsetX = 0
          offsetY = -1 * Math.abs((height - maxHeight)/2)
        
        @blurredBackground.css(
          display: 'block'
          position: 'fixed'
          width: newWidth
          height: newHeight
          top: offsetY
          left: offsetX
        )

        @resizeBackground()

        $(window).bind('resize', _.throttle($.proxy(@resizeBackground, @), 20))
      )

      Pixastic.process(img, "blurfast", {amount: .4}, (el)=>
        $(".page-header .canvas-wrap").prepend(el)

        @blurredBackgroundNavBar = $(el)

        height = @blurredBackgroundNavBar.height()
        width = @blurredBackgroundNavBar.width()

        maxHeight = $("#collage-header").height() + $(".head-wrap").height()
        maxWidth = $(window).width()

        ratio = 1

        if width / height >= maxWidth / maxHeight
          ratio = maxHeight / height
          newHeight = maxHeight
          newWidth = width * ratio
          offsetX = -1 * Math.abs((width - maxWidth)/2)
          offsetY = 0
        else
          ratio = maxWidth / width
          newWidth = maxWidth
          newHeight = height * ratio
          offsetX = 0
          offsetY = -1 * Math.abs((height - maxHeight)/2)
        
        @blurredBackgroundNavBar.css(
          display: 'block'
          position: 'absolute'
          width: newWidth
          height: newHeight
          top: offsetY
          left: offsetX
        )

        @resizeBackgroundNav()

        $(window).bind('resize', _.throttle($.proxy(@resizeBackgroundNav, @), 20))
      )
    
    document.body.appendChild(img);
    img.src = image

  resizeBackground: ->
    height = @blurredBackground.height()
    width = @blurredBackground.width()

    maxHeight = $("#collage-header").height() + $(".head-wrap").height()
    maxWidth = $(window).width()

    ratio = 1

    if width / height >= maxWidth / maxHeight
      ratio = maxHeight / height
      newHeight = maxHeight
      newWidth = width * ratio
      offsetX = -1 * Math.abs((width - maxWidth)/2)
      offsetY = 0
    else
      ratio = maxWidth / width
      newWidth = maxWidth
      newHeight = height * ratio
      offsetX = 0
      offsetY = -1 * Math.abs((height - maxHeight)/2)
    
    @blurredBackground.css(
      width: newWidth
      height: newHeight
      top: offsetY
      left: offsetX
    )

  resizeBackgroundNav: ->
    height = @blurredBackgroundNavBar.height()
    width = @blurredBackgroundNavBar.width()

    maxHeight = $("#collage-header").height() + $(".head-wrap").height()
    maxWidth = $(window).width()

    ratio = 1

    if width / height >= maxWidth / maxHeight
      ratio = maxHeight / height
      newHeight = maxHeight
      newWidth = width * ratio
      offsetX = -1 * Math.abs((width - maxWidth)/2)
      offsetY = 0
    else
      ratio = maxWidth / width
      newWidth = maxWidth
      newHeight = height * ratio
      offsetX = 0
      offsetY = -1 * Math.abs((height - maxHeight)/2)
    
    @blurredBackgroundNavBar.css(
      width: newWidth
      height: newHeight
      top: offsetY
      left: offsetX
    )

  clickedUserLink: ->
    if @isEditing then return false
    Router.navigateToProfileTab(userPath: new global.myd.Uri(@model.get('owner').entity_url).getPathname(), tab: 'collections')
    false

  clickedTopic: ->
    if @isEditing then return false
    #ideally we would just get the topic uid. This is temp until we do the URLs project
    uid = @model.get("topic_url").substring(@model.get("topic_url").lastIndexOf("/")+1)
    Router.navigate("/topic/#{uid}", trigger: true)
    false

  clickedEditBackground: ->
    @trigger("editBackground")
    false

  clickedReuse: ->
    #Launch reuse modal
    @reuseItemView = new myd.ReuseItemView model: @collection
    false

  startEditMode: ->
    @isEditing = true
    @$el.find("#edit-collection").hide()
    @$el.find("#edit-background").show()
    $(".logo").hide()

    @$el.find("h1, .description").attr("contenteditable", true)
    myd.Placeholder().refresh(@$el)

  leaveEditMode: ->
    @isEditing = false
    @$el.find("#edit-collection").show()
    @$el.find("#edit-background").hide()
    $(".logo").show()

  onClose: ->
    $(window).unbind('resize.background')

    @blurredBackground?.remove()
    @blurredBackgroundNavBar?.remove()

    @likeButtonView?.close()

global.myd.CollageHeaderView = CollageHeaderView
