global.myd ?= {}

class FrontMatterTileModel extends Backbone.Model
  idAttribute: "uid"

  exists: ->
    @get("type")?

  toggleLike: ->
    myd.serviceModule.post(
      url: myd.urls.bookmarks
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

global.myd.FrontMatterTileModel = FrontMatterTileModel