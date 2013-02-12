global.myd ?= {}

class ScreenModel extends Backbone.Model
  idAttribute: "uid"
  defaults:
    editable: false
    showActions: false
    showLikeButton: false
    showReuseButton: false
    showFacebookShareButton: false
    showScreenNavigation: false
    showDeleteButton: false

  initialize: (options) ->
    @bookmark_url = myd.urls.bookmarks
    @set("item", new myd.ItemModel( @get("item") ) )

  setCoverImage: ->
    myd.serviceModule.post(
      url: @collection.coverUrl
      data:
        cover_asset_url: @get("item").get('entity_url')
      success: (response) =>
        #TODO
    )
    @isCoverImageCandidate = false

global.myd.ScreenModel = ScreenModel
