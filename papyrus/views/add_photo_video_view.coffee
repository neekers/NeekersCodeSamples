global.myd ?= {}

class AddPhotoVideoView extends Backbone.View
  tagName: "div"
  className: "screen-item add-asset media-type cf"
  collection: myd.ItemsCollection

  events:
    'click .search-images':           'clickedSearch'
    'click .close-add-item':          'clickedClosed'
    'click .liked-images':            'clickedLiked'
    'click .liked-videos':            'clickedLiked'
    'click .liked-collages':          'clickedLiked'
    'click .my-images':               'clickedMy'
    'click .my-videos':               'clickedMy'
    'click .my-collages':             'clickedMy'
    'keyup .search-photo-bar input':  'liveSearch'

  initialize: (params) ->

    @containerTarget = params.container
    @addType = params.addType
    @collectionItems = params.collectionItems ||[]
    @addItemUrl = params.addItemUrl
    @index = params.index

    @progress = {}
    @data = {}
    @filesSelected = 0
    @filesComplete = 0

    @liveSearch = _.debounce( _.bind( @doSearch, this), 300 )

    @collection = new myd.ItemsCollection
    @collection.bind("reset", @render, @)

    if @addType == "image"
      @assetType = "ImageAsset"
      @collection.fetch(@assetType, myd.urls.my_collected_items)
    else if @addType == "video"
      @$el.addClass("video-type")
      @assetType = "VideoAsset"
      @collection.fetch(@assetType, myd.urls.my_collected_items)
    else if @addType == "collage"
      @$el.addClass("collage-type")
      @assetType = "Collection"
      @collection.fetch(@assetType, myd.urls.my_bookmarks)
    else if @addType == "cover"
      @$el.addClass("cover-type")

    @$el.addClass("#{@addType}-type")
    if @addType == "cover"
      @collection.reset(@collectionItems)

  render: ->
    animate = true
    showPhotoBar = false
    showVideoBar = false
    showCollageBar = false
    if @addType == "image"
      showPhotoBar = true
      headline = "Select an image to add ..."
    else if @addType == "video"
      headline = "Select a video to add ..."
      showVideoBar = true
    else if @addType == "collage"
      headline = "Select a collage to add ..."
      showCollageBar = true
    else if @addType == "cover"
      headline = "Select a new background image ..."

    likedItemsList = @$el.find(".liked-items")
    if likedItemsList.length == 0
      @$el.append Mustache.render($("#add_media_item_template").html(), headline: headline, showPhotoBar: showPhotoBar, showVideoBar: showVideoBar, showCollageBar: showCollageBar)
      @$el.insertAfter @containerTarget

      @likedImagesBtn = @$el.find(".liked-images")
      @likedVideosBtn = @$el.find(".liked-videos")
      @likedCollagesBtn = @$el.find(".liked-collages")
      @myImagesBtn = @$el.find(".my-images")
      @myVideosBtn = @$el.find(".my-videos")
      @myCollagesBtn = @$el.find(".my-collages")
      @searchImagesBtn = @$el.find(".search-images")
      @searchBar = @$el.find(".search-photo-bar")

    likedItemsList = @$el.find(".liked-items")
    if likedItemsList.children().length
      animate = false
      likedItemsList.empty()

    @itemViews = []
    if @collection.models.length == 0
      @$el.find(".no-likes").remove()

      if @$el.find(".search-images").hasClass("active")
        @$el.find(".asset-wrapper").append("<div class='no-likes'>Type in the search box above to find images.</div>")
      else if @addType == "cover"
        @$el.find(".asset-wrapper").append("<div class='no-likes'>You must add an image or video to your collage first...</div>")
      else
        @$el.find(".asset-wrapper").append("<div class='no-likes'>You must first like or upload a few #{@addType}s...</div>")

      @$el.find(".liked-items").hide()
    else
      @$el.find(".no-likes").remove()
      @$el.find(".liked-items").show()

      _.each @collection.models, (item) =>
        if item.get('image_300_url')? or item.get("type") == "collection"
          view = new myd.AddItemView(model: item, addType: @addType)
          likedItemsList.append(view.el)
          view.bind("addItem", @addItem, @)
          @itemViews.push view

    if animate then @$el.show("blind", 1000)

    likedItemsList.animate({
      'scrollTop': 0
    }, 250, "easeOutBack")

    @$el.find('.frame .image').each ->
      $(this).attr('src', $(this).data('src-300'))
    new global.myd.ImageCenter(@$el.find('.asset'))

    if @addType == "image"
      window.SI.Files.wrapClass = 'upload-image'
      window.SI.Files.stylize(@$el.find('input.file')[0])

      @uploader = @$el.find('.file').fileupload({
        url: myd.s3.uploaded_url
        multipart: true
        forceIframeTransport: false # Set to true for easier testing
        fileInput: @$el.find('input.file')
        dataType: 'text'
        formAcceptCharset: 'utf-8'
        sequentialUploads: true
        add: (e, data) =>
          if @filesSelected == 5
            return false

          if !data.files[0].name.match(/(jpg|jpeg|gif|png)$/i)
            alert(data.files[0].name + ' is not supported at this time.')
            return false
            
          basename = (f) -> f.replace /.*[\/\\]/, ""
          rnd = ((1<<23) | Math.floor(Math.random()*(1<<23))).toString(16) # salt to avoid overwriting
          filename = data.files[0].name
          type = data.files[0].type
          base = basename(filename)

          data.base = base
          data.paramName = "file"
          data.formData =
            key:                     key="#{myd.s3.prefix}#{rnd}-#{base}"
            bucket:                  myd.s3.bucket
            acl:                     myd.s3.acl
            AWSAccessKeyId:          myd.s3.AWSAccessKeyId
            policy:                  myd.s3.policy
            signature:               myd.s3.signature
            filename:                ""
            "Content-Type":          type
            success_action_redirect: myd.s3.success_action_redirect
          data.submit()

          @data[base] = data

          @progress[base] = $(Mustache.render $("#image_upload_progress_template").html())
          @$el.before(@progress[base])

          @filesSelected++

          # Shows preview of uploading image if browser supports it.
          if window.File && window.FileReader
            reader = new FileReader()

            reader.onload = ((file) =>
              
              return (e) =>
                @.progress[base].find('.image-placeholder img').attr('src', e.target.result)
            )(data.files[0])

            reader.readAsDataURL(data.files[0])


          # Fake progress bar for IE. It takes ~40 seconds total.
          # We should figure out how to speed up the timeout. 
          if $.browser.msie && parseInt($.browser.version) < 10
            @progress[data.base].find('.bar').animate(
              width: '98%'
            , 40000)

        start: (e) =>
          @$el.hide()

        progress: (e, data) =>
          progress = parseInt(data.loaded / data.total * 100, 10)

          @progress[data.base].find('.bar').width(progress + '%')

        always: (e, data) =>
          base = data.base
          @progress[base].remove()

          @addNewItem(
            asset_type: "image"
            asset_url: myd.s3.uploaded_url + @data[base].formData.key
            description: ""
            thumbnail_url: null
            title: base
          , false)

          @filesComplete++

          if @filesSelected == @filesComplete
            @clickedClosed()
      })

  addNewItem: (itemObj, autoClose = true) ->
    #create item model from json object
    itemObj.index = @index
    @trigger("addNewItem", new myd.ItemModel(itemObj))

    if autoClose
      @clickedClosed()

  addItem: (item) ->
    if @addType != "cover"
      item.set('index', @index)
      @trigger("addItem", item)
    else
      @trigger("setCover", item)

    @clickedClosed()

  clickedSearch: ->
    #add search bar in here
    if @searchBar.width() == 0 #open the search
      @$el.find(".liked-items-bar .active").removeClass("active")
      @searchImagesBtn.addClass("active")
      @$el.find(".liked-items").show()
      @$el.find(".no-likes").remove()
      cookieSearch = $.cookie("add_image_search")
      if cookieSearch
        @$el.find(".search-photo-bar input").focus().val($.cookie("add_image_search"))
        @doSearch()
      else
        @$el.find(".search-photo-bar input").focus()

    else
      $(".liked-items-bar .active").removeClass("active")
      @likedImagesBtn.addClass("active")

    if @searchBar.width() == 0
      @searchBar.attr('style', '')
    else
      @searchBar.css('width', 0)
    
    false

  doSearch: ->
    @searchImagesBtn.addClass("active")
    @likedImagesBtn.removeClass("active")

    $.cookie("add_image_search", @searchBar.find("input").val())

    @collection.fetchSearchResults @searchBar.find("input").val()

    _gaq.push(['_trackEvent', "AddBar", "Search", @searchBar.find("input").val(), 1])
    omnicollagio.linkTrackEvents = "event21, prop21, eVar8"
    omnicollagio.eVar8 = "CollageAddImageSearchView"
    omnicollagio.prop21 = @searchBar.find("input").val()
    omnicollagio.t(this, 'o', window.location)

  clickedLiked: ->

    $(".liked-items-bar .active").removeClass("active")

    if @assetType == "ImageAsset"
      @collection.fetch(@assetType, myd.urls.my_collected_items)
      @likedImagesBtn.addClass("active")
    else if @assetType == "VideoAsset"
      @collection.fetch(@assetType, myd.urls.my_collected_items)
      @likedVideosBtn.addClass("active")
    else if @assetType == "Collection"
      @collection.fetch(@assetType, myd.urls.my_bookmarks)
      @likedCollagesBtn.addClass("active")

    @searchBar.css('width', 0)
    @searchBar.find("input").val("")
    false

  clickedMy: ->

    $(".liked-items-bar .active").removeClass("active")
    
    if @assetType == "ImageAsset"
      @myImagesBtn.addClass("active")
      @collection.fetch(@assetType, myd.urls.owned)
    else if @assetType == "VideoAsset"
      @myVideosBtn.addClass("active")
      @collection.fetch(@assetType, myd.urls.owned)
    else if @assetType == "Collection"
      @myCollagesBtn.addClass("active")
      @collection.fetch(@assetType, myd.urls.my_profile)

    @searchBar.css('width', 0)
    @searchBar.find("input").val("")
    false

  clickedClosed: ->
    @$el.slideUp(1000, =>
      @close()
    )
    @trigger("cancel")
    false

  onClose: ->
    _.each @itemViews, (view) =>
      view.unbind("addItem", @addItem, @)
      view.close()


global.myd.AddPhotoVideoView = AddPhotoVideoView
