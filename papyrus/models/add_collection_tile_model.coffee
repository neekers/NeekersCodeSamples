global.myd ?= {}

class AddCollectionTileModel extends Backbone.Model

  type: "add_collection"

  defaults:
    title: "Give me title"

global.myd.AddCollectionTileModel = AddCollectionTileModel
