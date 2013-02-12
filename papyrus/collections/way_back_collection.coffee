global.myd ?= {}

WayBackCollection = Backbone.Collection.extend(
  model: myd.BreadcrumbModel
  overflow: []

  initialize: ->
    @

  add: (model, options) ->
    #Don't add the same page twice in a row
    lastCrumb = _.first @models
    if lastCrumb? and model.get("name") == lastCrumb.get("name") and model.get("url") == lastCrumb.get("url")
      return

    #always keep the latest 5 in the collection
    if @models.length > 5
      @overflow.push(@pop())

    #call the real add
    Backbone.Collection.prototype.add.call(this, model, options)

  rollBackHistory: (crumbClicked) ->
    #Find the one clicked in the current collection
    index = @indexOf crumbClicked

    #Remove the extras off the front
    @shift() for num in [0..index]

    #Must do the rest before adding the new ones, because Backbone listens when we add new ones to automagically render them
    @reset(@models)

    #Add the difference
    goBack = 4 - index
    @addOverflow num for num in [1..goBack]

    #navigate back for the app
    Router.navigate(crumbClicked.get("url"), trigger: true)

  addOverflow: ->
    overflowItem = @overflow.pop()

    if overflowItem?
      @add(overflowItem, silent: true)
)

global.myd.WayBackCollection = WayBackCollection