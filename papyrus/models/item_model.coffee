global.myd ?= {}

class ItemModel extends Backbone.Model
  idAttribute: "uid"
  defaults:
    metaData: undefined
    type: "image"

  initialize: (options) ->
    @bookmark_url = myd.urls.bookmarks
    @set('screen_id',options.screen_id) if(options? && options.screen_id?)

  toggleLike: ->
    myd.serviceModule.post(
      url: @bookmark_url
      data:
        entity_url: @get("entity_url")
        bookmarked: !@get('collected')
      success: (response) =>
        newCount = @get("collected_count")
        if response.collected
          @set("collected_count", ++newCount)
        else
          @set("collected_count", if newCount > 0 then --newCount else 0)
        @set('collected', response.collected)
    )

  fetchMetaData: ->
    myd.serviceModule.get(
      url: @get("meta_data_url")
      success: (response) =>
        @set( "metaData", response )
    )


global.myd.ItemModel = ItemModel
