global.myd ?= {}

ItemsCollection = Backbone.Collection.extend(
  model: myd.ItemModel
  fetched: false

  initialize: (params) ->
    @url = myd.urls.my_collected_items
    @

  fetch: (assetType, url = @url) ->
    myd.serviceModule.get(
      url: url
      success: (response) =>
        if assetType != "Collection" || url != @url
          if response.collection
            response.items = []

            _.each response.collection.screens, (screen) ->
              response.items.push(screen.item)

          itemsList = (item for item in response.items when item.type is assetType)
          _.each response.items, (item) ->
            item.image_300_url = item.thumbnail_url
            if item.type.toLowerCase() == assetType.toLowerCase() || item.type + "asset" == assetType.toLowerCase()
              if item.type.toLowerCase() == "collection" && item.cover_asset?
                item.image_300_url = item.cover_asset.thumbnail_url
              else if item.type.toLowerCase() == "videoasset" and item.youtube_id?
                item.image_300_url = myd.getVideoUrl(item.youtube_id)
              itemsList.push item
          @reset( @parse( itemsList) )
        else
          itemsList = (screen.item for screen in response.collection.screens when screen.item.type?)
          @reset( @parse( itemsList) )
    )

  fetchSearchResults: ( searchQuery ) ->
    myd.serviceModule.get(
      url: myd.urls.search + searchQuery
      success: ( response ) =>
        #need to change old screens to new items
        items = []
        _.each response.collection.screens, (screen) =>
          items.push
            title: screen.title,
            image_300_url: screen.assets[0].thumbnail_url,
            asset_url: screen.assets[0].asset_url,
            type: "ImageAsset",
            search_origin: screen.search_origin,
            source_page_url: screen.assets[0].asset_url

        @reset (@parse( items ))
    )

)

global.myd.ItemsCollection = ItemsCollection
