global.myd ?= {}

class BreadcrumbModel extends Backbone.Model
  defaults:
    url: "papyrus"
    name: "Collagio"

  initialize: (params) ->
    @set("name", @get("name").replace(" - Collagio", ""))
    @

global.myd.BreadcrumbModel = BreadcrumbModel