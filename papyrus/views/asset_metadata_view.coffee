global.myd ?= {}

class AssetMetaDataView extends Backbone.View
  model: myd.ScreenModel

  events:
    'click .origin_source_url'         : 'clickedViewSource'
    'click .parent_collection_url'     : 'clickedViewParentCollection'
    'click .asset_owner_url'           : 'clickedViewAssetOwner'

  initialize: (params) ->
    @containerEl = params.container

    all_meta_data = @model.get("metaData")

    if !!all_meta_data
      if all_meta_data.uploaded
        all_meta_data.source_url_name = "Uploaded by User"
      else if all_meta_data.source_url == null and all_meta_data.asset_url == null #Text asset
        all_meta_data.source_url_name = "Added by User"
      else if all_meta_data.source_url == null #Fallback to the asset_url because we have a source we can show in the asset_url, better than nothing
        all_meta_data.source_url = all_meta_data.asset_url

      all_meta_data.owner_link = "/papyrus/p" + new global.myd.Uri(all_meta_data.owner.user_url).getPathname() + "/collections"
      @render(all_meta_data)

  render: (all_meta_data) ->
    @containerEl.append("<div class='meta_data_holder' style='display: none;'>")
    @setElement($(".meta_data_holder", @containerEl))
    @containerEl.toggleClass('showing_meta_data', !!all_meta_data)

    template = $("#asset_meta_data_template").html()
    @$el.html( Mustache.render(template, all_meta_data) )
    @$el.slideDown()

  toggle: ->
    @containerEl.toggleClass('showing_meta_data')
    if @containerEl.hasClass("showing_meta_data")
      @$el.slideDown()
      return true
    else
      @$el.slideUp()
      return false

  clickedViewSource: ->
    sourceUrl = @model.get("metaData").source_url
    if sourceUrl.indexOf("http://") == 0
      @sourceWindow = window.open( @model.get("metaData").source_url )
    false

  clickedViewParentCollection: (event) ->
    parentCollectionUrl = $(event.target).attr('href')
    collectionRoute = global.myd.routesModule.getRoutesFromUrl(parentCollectionUrl)
    Router.navigate( collectionRoute.getPapyrusPath(), trigger: true )
    false

  clickedViewAssetOwner: ->
    ownerUrl = @model.get("metaData").owner.user_url
    Router.navigateToProfileTab(userPath: new global.myd.Uri(ownerUrl).getPathname(), tab: 'collections')
    false

  onClose: ->
    @containerEl.removeClass("showing_meta_data")


global.myd.AssetMetaDataView = AssetMetaDataView