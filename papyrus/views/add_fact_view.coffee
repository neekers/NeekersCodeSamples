global.myd ?= {}

class AddFactView extends Backbone.View
  tagName: "div"
  className: "screen-item add-asset fact-type cf"
  collection: myd.ItemsCollection

  events:
    'click .close-add-item':          'clickedClose'
    'click .add-btn':                 'addItem'

  initialize: (params) ->
    @containerTarget = params.container
    @index = params.index

    @bind "finishEdit", => @clickedClose()
    @bind "cancelEdit", => @clickedClose()

    @render()
  render: ->
    @template = $("#add_fact_item_template").html()
    @$el.append Mustache.render(@template, index: @index)

    @$el.insertAfter @containerTarget

    @editBar = $('.edit')

    myd.Placeholder().refresh(@$el)

    @$el.show("blind", 1000, =>
      editor = myd.renderTextEditor "new-text-#{@index}"
    )

  addItem: ->
    myd.Placeholder().clean(@$el)

    title = @$el.find('.fact_title').text()
    editor = tinyMCE.get("new-text-#{@index}")
    contentHTML = $("<div>").html(editor.getContent())[0]
    text = markdown.serialize(contentHTML)

    if !title.length && !text.length
      @clickedClose()
      return

    item = new myd.ItemModel(
      asset_type: "fact"
      title: title
      text: text
      index: @index,
      type: 'fact'
    )

    @trigger("addItem", item)

    @clickedClose()

  clickedClose: ->
    @$el.hide("blind", 1000, =>
      @close()
    )
    false

  onClose: ->
    tinyMCE.get("new-text-#{@index}")?.remove()


global.myd.AddFactView = AddFactView
