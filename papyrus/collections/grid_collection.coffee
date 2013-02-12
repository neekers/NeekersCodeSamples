global.myd ?= {}

GridCollection = Backbone.Collection.extend(
  model: myd.ScreenModel

  initialize: ->

  comparator: (item) ->
    return item.get('index')


  fetch: (collection) ->
    url = @getUrl( collection )

    if @contentLoaded( url )
      return

    myd.serviceModule.get(
      url: url
      success: ( response ) =>
        @parse(response)
      error: (response) =>
        @trigger("errorReset")
    )

  fetchByUrl: (url) ->
    if @contentLoaded( url )
      return

    myd.serviceModule.get(
      url: url
      success: ( response ) =>
        @parse(response)
      error: (response) =>
        @trigger("errorReset")
    )

  fetchSearchResults: ( searchQuery ) ->
    myd.serviceModule.get(
      url: myd.urls.search + searchQuery
      success: ( response ) =>
        @parse( response )
    )

  fetchInternalSearchResults: (searchQuery) ->
    myd.serviceModule.get
      url: myd.urls.search_internal + searchQuery
      success: (response) =>
        @parse( response )

  parse: (response) ->
    @frontMatter = new myd.FrontMatterTileModel(
      response.collection
    )
    @uid = response.collection.uid
    @syncUrl = response.collection.sync_url
    @url = @syncUrl
    @newItemUrl = response.collection.add_new_item_url
    @coverUrl = response.collection.cover_url
    @coverAsset = response.collection.cover_asset
    @editItemsUrl = response.collection.edit_items_url
    @collection = response.collection

    @originalCover = new myd.ItemModel response.collection.cover_asset

    if @context == "likes"
      @collection.screens = @sortScreensCollectedCountDescending()
    if @context == "newest"
      @collection.screens = @sortScreensByDateDescending()

    if @context == "topic"
      if @filter == "likes"
        @collection.screens = @sortScreensCollectedCountDescending()
      if @filter == "newest"
        @collection.screens = @sortScreensByDateDescending()
      if @filter == "modified"
        @collection.screens = @sortScreensByModifiedDateDescending()
      if @filter == "commented"
        @collection.screens = @sortScreensByCommentsDescending()
      if @filter == "views"
        @collection.screens = @sortScreensByViewsDescending()
      if @filter == "reuses"
        @collection.screens = @sortScreensByReusesDescending()

    # collages in the profile section should be sorted by modified date
    if @context == "profile" and @tab == "collections"
      @collection.screens = @sortScreensByModifiedDateDescending()


    assets = []
    for asset in response.collection.screens
      unless asset.item.cover_asset?
        asset.item.cover_asset =
          thumbnail_url: "/images/default_new_collection.png"
          asset_url:    "/images/default_new_collection.png"
      if typeof asset.editable == "undefined" and @context == "profile"
        asset.editable = response.collection.editable

      assets.push new myd.ScreenModel(asset)

    @reset( assets, {sort:false}) # triggers internally
    @originalResponse = response

  sortScreensCollectedCountDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.collected_count

    sortedScreens


  sortScreensByDateDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.created_timestamp

    sortedScreens

  sortScreensByModifiedDateDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.modified_timestamp

    sortedScreens

  sortScreensByCommentsDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.total_comment_count

    sortedScreens


  sortScreensByViewsDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.view_count

    sortedScreens

  sortScreensByReusesDescending: ->
    sortedScreens = _.sortBy @collection.screens, (screen) =>
      return -screen.item.reuse_count

    sortedScreens

  cancelEditing: ->
    @setCoverImage(@originalCover)
    @parse @originalResponse
    @sync()

  setCoverImage: (item) ->
    myd.serviceModule.post(
      url: @coverUrl
      data:
        cover_asset_url: item.get('entity_url')
      success: (response) =>
        #TODO
    )

  getUrl: (collection) ->
    if collection?
      collection.pathname
    else
      @url

  getLastPath: ->
    if @lastRequestUrl?
      if @lastRequestUrl.indexOf("http://") > -1
        return false #TODO - dirty? Yes!
      else
        return @lastRequestUrl.slice(1)
    else
      ""

  contentLoaded: (url) ->
    if @lastRequestUrl == url
      return true
    @lastRequestUrl = url
    return false

  deleteScreen: (collectionUrl, asset) ->
    myd.serviceModule.delete(
      url: if asset.get("item").get("type") == "collection" then myd.urls.edit_collection else asset.get('item').get("entity_url")
      data: if asset.get("item").get("type") == "collection" then [ collectionUrl ]
      success: ( response ) =>

        #Check if any collection has it as it's cover and replace with a deleted placeholder fact asset
        _.each @models, (item) =>
          if item.get("originalUID") == asset.get("uid") and item.get("type") == "collection"
            item.set type: "fact", text: "This item has been removed by the owner.", thumbnail_url: null
        @remove(asset)

        #update frontmatter with new count as well
        oldCount = @frontMatter.get("collection_count")
        @frontMatter.set("collection_count", --oldCount)

        @reset(@models)
      error: (response) =>
        @trigger("errorReset")
    )

  addItemToCollection: (itemModel, atIndex = 0) ->
    myd.serviceModule.post(
      url: @editItemsUrl
      data: [ entity_url: itemModel.get("entity_url"), index: atIndex ]
      success: (response)=>
        @add(new myd.ScreenModel(response[0]), at: atIndex)
      error: (response)->
        global.myd.modalAlert( response.responseText )
    )

  addNewItem: (itemModel, atIndex = 0) ->
    itemModel.set("index", atIndex)
    myd.serviceModule.post(
      url: @newItemUrl
      data: itemModel
      success: (response)=>
        @add(new myd.ScreenModel(response), at: atIndex)
      error: (response)->
        global.myd.modalAlert( response.responseText )
    )

  saveCurrentStateAsOriginal: ->
    response = {}
    response.collection = @frontMatter.toJSON()
    response.collection.screens = @toJSON()

    # Save items
    _.each response.collection.screens, (screen) =>
      screen.item = screen.item.toJSON()

    #save as new original
    @originalResponse = response

  sync: (callBack) ->
    itemsPayload = []
    needSync = true
    _.each @models, (screen) ->
      if !screen.isNew()
        item = screen.changed
        item.uid = screen.get('uid')
        item.item = screen.get("item").changed unless _.isEmpty(screen.get("item").changed)

        delete item.index
        delete item.nextIndex
        delete item.prevIndex
        if item.item?
          item.item.uid = screen.get("item").get("uid")
      else
        item = screen

      itemsPayload.push item
      if Object.keys(item).length > 1 then needSync = true

    changedStuff = @frontMatter.changed
    if Object.keys(changedStuff).length
      needSync = true
    changedStuff.screens = itemsPayload

    if !needSync
      if callBack? then callBack()
      return

    myd.serviceModule.post(
      url: @syncUrl
      data: changedStuff
      success: (response)=>
        if callBack? then callBack(response)
      error: (response)->
        global.myd.modalAlert( response.responseText )
    )

  syncReorder: (items, callBack) ->
    myd.serviceModule.post(
      url: @syncUrl
      data: screens: items
      success: (response)=>
        if callBack? then callBack()
      error: (response)->
        global.myd.modalAlert( response.responseText )
    )
)


class MostLikesGridCollection extends GridCollection

  initialize: () ->
    @context = "likes"

class NewestGridCollection extends GridCollection

  initialize: () ->
    @context = "newest"

class ModifiedDateGridCollection extends GridCollection

  initialize: () ->
    @context = "modified"

class MostCommentedGridCollection extends GridCollection

  initialize: () ->
    @context = "comments"

class ViewsGridCollection extends GridCollection

  initialize: () ->
    @context = "views"

class ReusesGridCollection extends GridCollection

  initialize: () ->
    @context = "reuses"

class TopicGridCollection extends GridCollection

  initialize: () ->
    @context = "topic"

class ProfileGridCollection extends GridCollection

  initialize: (params) ->
    @context = "profile"
    @tab = params.tab

class FollowingGridCollection extends GridCollection

  initialize: () ->
    @context = "following"



global.myd.GridCollection = GridCollection
global.myd.MostLikesGridCollection = MostLikesGridCollection
global.myd.NewestGridCollection = NewestGridCollection
global.myd.TopicGridCollection = TopicGridCollection
global.myd.ProfileGridCollection = ProfileGridCollection
global.myd.ModifiedDateGridCollection = ModifiedDateGridCollection
global.myd.MostCommentedGridCollection = MostCommentedGridCollection
global.myd.ViewsGridCollection = ViewsGridCollection
global.myd.ReusesGridCollection = ReusesGridCollection
global.myd.FollowingGridCollection = FollowingGridCollection

