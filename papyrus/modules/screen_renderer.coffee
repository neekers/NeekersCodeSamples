global.myd ?= {}

#NEW METHOD AND TEMPLATES
renderScreen = (templateObj,
                context = "collections"
                actions = showActions: false, showLikeButton: false, showReuseButton: false, showFacebookShareButton: false, showScreenNavigation: false, showDeleteButton: false
                tab = null) ->
  if templateObj.item?
    templateObj.item = templateObj.item.toJSON()
  else
    templateObj.item = templateObj

  # Add type to the object better
  templateObj.item[templateObj.item.type + 'Type'] = true

  #Make real clickable URLS
  url = templateObj.item.entity_url
  routes = myd.routesModule.getRoutesFromUrl( url )
  templateObj.item.app_url = "/papyrus"+routes.getPapyrusPath()

  #map actions to the template
  _.map actions, (action, key) ->
      templateObj[key] = action

  if templateObj.item.type == 'fact'
    if context != "collections" and context != "reuse"
      #TODO: replace links with styled spans
      templateObj.item.text = markdown.toHTML(stripMarkdownLinks(templateObj.item.text) ? "")
    else
      templateObj.item.text  = markdown.toHTML(templateObj.item.text ? "")

  else if templateObj.item.type == "collection"
    placeholder = "/images/placeholder-logo.jpg"
    myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Element")
    templateObj.item.thumbnail_url =  templateObj.item.cover_asset?.thumbnail_url || placeholder
    templateObj.item.image_745_url =  templateObj.item.cover_asset?.image_745_url || placeholder
    templateObj.item.image_300_url =  templateObj.item.cover_asset?.image_300_url || placeholder

    # Topic
    if templateObj.item.is_topic?
      myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Collage")
      templateObj.item.app_url = "/papyrus/topic/#{templateObj.item.uid}"
    else # Normal Collection
      # current date
      currentDate = new Date()
      creationDate = new Date()

      if templateObj.item.modified_timestamp?
        # modified timestamp
        creationDate.setTime(templateObj.item.modified_timestamp * 1000 )
        # set the creation time
        templateObj.item.created = timeDifference(currentDate, creationDate) 
      else if templateObj.item.created_timestamp?
        # creation timestamp
        creationDate.setTime(templateObj.item.created_timestamp * 1000 )
        # set the creation time
        templateObj.item.created = timeDifference(currentDate, creationDate)     
      else
        templateObj.item.created = ""

      # screens count
      if templateObj.item.screens_count?
        myd.pluralizeIfNeeded(templateObj.item, "screens_count", "Element")
      else
        templateObj.item.screens_count_text = ""

  else
    delete templateObj.item.title

  templateObj.item.domain = new myd.Uri(templateObj.item.source_page_url).getHost()

  # TODO: Let's do auto thumbnail detection so we're never without one
  #templateObj.item.thumbnail =

  #should be last for testing
  if global.myd.feature.testing
    templateObj.item.thumbnail_url = "/images/default_new_collection.png"
    templateObj.item.asset_url = "/images/default_new_collection.png"
    templateObj.item.image_150_url = "/images/default_new_collection.png"
    templateObj.item.image_300_url = "/images/default_new_collection.png"
    templateObj.item.image_745_url = "/images/default_new_collection.png"
    templateObj.item.image_1024_url = "/images/default_new_collection.png"
    templateObj.item.image_2048_url = "/images/default_new_collection.png"

  if context == "reorder"
    Mustache.render $("#reorder_screen_template").html(), templateObj.item
  else if context == "collections" and templateObj.item.type == "collection" and !templateObj.item.is_topic

    if templateObj.item.screens?
      collectionShort = templateObj.item.screens.slice(0, 6)
      _.each collectionShort, (screen) ->
        if screen.item.type == "fact"
          screen.item.text = markdown.toHTML(stripMarkdownLinks(screen.item.text) ? "")
        else if screen.item.type == "video" and screen.item.youtube_id?
          screen.item.thumbnail_url = getVideoUrl(screen.item.youtube_id)

      templateObj.item.screens = collectionShort

    Mustache.render $("#full_screen_inline_template").html(), templateObj, screen_nav_template: $("#screen_nav_template").html(), collage_screens_template: $("#collage_screens_template").html()
  else if templateObj.item.type == "collection" and !templateObj.item.is_topic

    if !templateObj.item.view_count or templateObj.item.view_count < 1
      templateObj.item.view_count = "0"

    if !templateObj.item.total_comment_count or templateObj.item.total_comment_count < 1
      templateObj.item.total_comment_count = "0"

    if !templateObj.item.reuse_count or templateObj.item.reuse_count < 1
      templateObj.item.reuse_count = "0"

    Mustache.render $("#explore_screen_template").html(), templateObj

  else if templateObj.item.type == "collection" and templateObj.item.is_topic
    Mustache.render $("#topic_item_template").html(), templateObj
  else if context == "collections" or context == "itemlightbox" or context == "reuse"
    Mustache.render $("#full_screen_inline_template").html(), templateObj, screen_nav_template: $("#screen_nav_template").html()
  else if templateObj.item.type == "user" and context == "profile"
    Mustache.render $("#search_user_screen_template").html(), templateObj
  else

    # current date
    currentDate = new Date()
    creationDate = new Date()

    if templateObj.item.modified_timestamp?
      # modified timestamp
      creationDate.setTime(templateObj.item.modified_timestamp * 1000 )
      # set the creation time
      templateObj.item.created = timeDifference(currentDate, creationDate)
    else if templateObj.item.created_timestamp?
      # timestamp
      creationDate.setTime(templateObj.item.created_timestamp * 1000 )
      # set the creation time
      templateObj.item.created = timeDifference(currentDate, creationDate)

      if !templateObj.item.view_count? or templateObj.item.view_count < 1
        templateObj.item.view_count = "0"

      if !templateObj.item.comment_count? or templateObj.item.comment_count < 1
        templateObj.item.comment_count = "0"

      if !templateObj.item.reuse_count or templateObj.item.reuse_count < 1
        templateObj.item.reuse_count = "0"

    if templateObj.item.type == "user"
      Mustache.render $("#search_user_screen_template").html(), templateObj
    else
      Mustache.render $("#full_screen_template").html(), templateObj

stripMarkdownLinks = (text) ->
  if typeof text == "undefined" or text == null then return ""
  noLinks = text.replace(/\[/g, "")
  noLinks = noLinks.replace(/]/g, " ")
  noLinks = noLinks.replace(/\)/g, "")
  noLinks.replace(/\(/g, "")

renderAssetFragment = (screen, context, el, tab) ->
  item = screen.get("item")
  renderAssetFragmentFromItem(item, screen.get("index"), context, el)

#For collection collage look
renderAssetFragmentFromItem = (item, ordinal = 0, context, el) ->
  # add assets to collection tile
  MAX_ASSET_COUNT = 5
  assets = item.get("screens")
  assetCount = 0
  fragment = ""
  elements = []

  # default thumbnail
  defaultThumbnail = "/images/placeholder-logo.jpg"

  # cover image
  #******************************
  placeholder = "/images/placeholder-logo.jpg"
  coverImageThumb = item.get("cover_asset")?.preview_image_url || placeholder
  coverImage150 = item.get("cover_asset")?.image_150_url || placeholder
  coverImage300 = item.get("cover_asset")?.image_300_url || placeholder
  coverImage745 = item.get("cover_asset")?.image_745_url || placeholder
  coverImage1024 = item.get("cover_asset")?.image_1024_url || placeholder
  coverImage2048 = item.get("cover_asset")?.image_2048_url || placeholder
  itemClass = if item.get("description") == '' || item.get("description") == null then '' else ' with-description'
  
  # We don't want to test the internet
  if myd.feature.testing
    coverImage = defaultThumbnail

  fragment = "<div class='asset#{itemClass}'><div class='gradient'></div><div class='frame'><img class='image' data-src-thumb='#{coverImageThumb}' data-src-150='#{coverImage150}' data-src-300='#{coverImage300}' data-src-745='#{coverImage745}' data-src-1024='#{coverImage1024}' data-src-2048='#{coverImage2048}'></div></div>"

  elements.push(fragment)
  assetCount++
  #******************************

  _.map assets , (asset, index) =>
    if asset.item.type == "image" || asset.item.type == "fact" || asset.item.type == "video"

      if asset.item.type == "image" || asset.item.type == "video"
        thumbnail = asset.item.image_150_url || defaultThumbnail

        # We don't want to test the internet
        if myd.feature.testing
          thumbnail = defaultThumbnail

        if assetCount < MAX_ASSET_COUNT
          fragment = "<div class='tile'><div class='frame'><img class='image' src='#{thumbnail}'></div></div>"
          elements.push(fragment)

      else if asset.item.type == "fact"

        # we need to check if there are already html tags in the fact asset, if there aren't, process it (used for reuse window)
        text = asset.item.text ||  ''
        tags = text.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/)
        
        if !tags?
          asset.item.text = markdown.toHTML(stripMarkdownLinks(text) ? "")

        templateObj = asset

        if assetCount < MAX_ASSET_COUNT
          fragment = Mustache.render $('#collage_fact_tile_template').html(), templateObj
          elements.push(fragment)

      assetCount++


  # Add empty placeholder for now if the asset count is less than 6
  if assetCount < MAX_ASSET_COUNT
    for i in [1..MAX_ASSET_COUNT - assetCount]
      if i % 2 == 0
        fragment = "<div class='tile placeholder even'></div>"
        elements.push(fragment)
      else
        fragment = "<div class='tile placeholder'></div>"
        elements.push(fragment)



  coverImageTile = elements[0]
  miniTiles = elements.slice(1, elements.length)

  # process the cover image
  el.find(".link").prepend coverImageTile

  # go through all the tiles and add them to the mini-tiles container
  $.each(miniTiles,
  (index, value) =>
    el.find(".mini-tiles").append value
  )

  # Add different background shade for "even" fact tiles
  $facts = el.find(".fact-wrapper")
  $.each($facts,
  (index, fact) =>
    if index % 2
      $(fact).addClass("even")
  )
  
    
timeDifference = (current, previous) -> 
  msPerMinute = 60 * 1000
  msPerHour = msPerMinute * 60
  msPerDay = msPerHour * 24
  msPerMonth = msPerDay * 30
  msPerYear = msPerDay * 365

  elapsed = current - previous

  if (elapsed < msPerMinute)
    return Math.round(elapsed/1000) + 's ago'   
  else if (elapsed < msPerHour)
    return Math.round(elapsed/msPerMinute) + 'm ago'
  else if (elapsed < msPerDay )
    return Math.round(elapsed/msPerHour ) + 'h ago'
  else if (elapsed < msPerMonth)
    return Math.round(elapsed/msPerDay) + 'd ago'
  else if (elapsed < msPerYear)
    return Math.round(elapsed/msPerMonth) + 'mo ago'
  else
    return Math.round(elapsed/msPerYear) + 'y ago'


renderTurntableScreen = (templateObj) ->
  # if templateObj.item.type == 'fact'
    # console.log templateObj.item.text
    # templateObj.item.text  = markdown.toHTML(templateObj.item.text ? "")

  if global.myd.feature.testing
    templateObj.item.image_300_url = "/images/default_new_collection.png"

  else if templateObj.item.type == "collection"
    if templateObj.item.cover_asset.type == "video" and templateObj.item.cover_asset.youtube_id?
      templateObj.item.image_300_url = getVideoUrl(templateObj.item.cover_asset.youtube_id)
    else
      templateObj.item.image_300_url =  templateObj.item.cover_asset.image_300_url

  if templateObj.item.type == 'video' && templateObj.item.youtube_id?
    templateObj.item.image_300_url = getVideoUrl(templateObj.item.youtube_id)

  Mustache.render $("#turntable_record_template").html(), templateObj


getVideoUrl = (youtube_id) ->
  "http://img.youtube.com/vi/#{youtube_id}/0.jpg"

getTemplate = (assetType) ->
  template_id = "#{assetType}_template"
  $("##{template_id}").html()

getTurntableTemplate = (type) ->
  if type == 'image' or type == 'externalvideo' or type == 'fact' or type =="collection"
    $("##{type}_turntable_template").html()
  else
    template_id = "#{type}_template"
    $("##{template_id}").html()

renderVideoEmbed = (asset, el, height = 350) ->
  videoId = asset.get('item').get("youtube_id")
  templateObj = asset.toJSON()
  templateObj.item = templateObj.item.toJSON()

  #Paint the current YouTube video
  youtube_template = $("#youtube_embed_template").html()
  #Not sure why i need to add this first in. might be some weird markup for IE
  el.find(".video-wrapper").html(Mustache.render(youtube_template, templateObj))
  el.find(".youtube-player").show()

  el.find("iframe").attr("height", height)

tinyMCEOptions =
  theme: "advanced"
  skin: "collagio"
  plugins : "inlinepopups"
  height : "250"
  width: "100%"
  inlinepopups_skin: "collagio"
  dialog_type : "modal"
  theme_advanced_buttons1 : "bold,italic,bullist,numlist,link"

initTextEditor = ->
  tinyMCEOptions
  tinyMCEOptions.mode = "specific_textareas"
  tinyMCEOptions.editor_selector = "text-editor"

  tinyMCE.init tinyMCEOptions

renderTextEditor = (elementId) ->
  editor = new tinymce.Editor(elementId, tinyMCEOptions)
  editor.render()
  tinyMCE.add editor
  editor

global.myd.initTextEditor = initTextEditor
global.myd.renderTextEditor = renderTextEditor
global.myd.renderAssetFragment = renderAssetFragment
global.myd.renderAssetFragmentFromItem = renderAssetFragmentFromItem
global.myd.getVideoUrl = getVideoUrl
global.myd.renderScreen = renderScreen
global.myd.renderVideoEmbed = renderVideoEmbed
global.myd.renderTurntableScreen = renderTurntableScreen
global.myd.timeDifference = timeDifference
