global.myd ?= {}

class LikeButtonView extends Backbone.View
  model: myd.ScreenModel
  className: "like-container"

  events:
    'click'        : 'clickedLike'
    'click .follow-topic' :'clickedFollow'

  initialize: (params) ->
    if @model.get("item")?
      @model.get("item").bind('change:collected', @refreshLike, this)
    else
      @model.bind('change:collected', @refreshLike, this)

    @likeCount = @$el.find(".like-count")

    @refreshLike()

  clickedFollow: ->
    @clickedLike()

    following_el =$(".follow-topic")
    if(following_el.find(".text").html().toLowerCase() == "following topic")
      following_el.find(".text").html("FOLLOW TOPIC")
      following_el.removeClass("followed-topic-btn").addClass("following-topic-btn")
    else
      following_el.find(".text").html("FOLLOWING TOPIC")
      following_el.addClass("followed-topic-btn").removeClass("following-topic-btn")
    false

  clickedLike:(event) ->

    if @model.get("item")?
      @model.get("item").toggleLike()
    else
      @model.toggleLike()

    if(@$el.hasClass("liked"))
      @$el.removeClass("liked")
    else
      @$el.addClass("liked")
    false

  refreshLike: ->
    following_el =$(".follow-topic")
    if  @model.get("collected")
      following_el.find(".text").html("FOLLOWING TOPIC")
      following_el.addClass("followed-topic-btn").removeClass("following-topic-btn")
    else
      following_el.find(".text").html("FOLLOW TOPIC")

    following_el =$(".follow-topic")
    if  @model.get("collected")
      following_el.find(".text").html("FOLLOWING TOPIC")
      following_el.addClass("followed-topic-btn").removeClass("following-topic-btn")
    else
      following_el.find(".text").html("FOLLOW TOPIC")
      following_el.removeClass("followed-topic-btn").addClass("following-topic-btn")

    if @model.get("item")?
      collectedCount = @model.get("item")?.get("collected_count")
    else
      collectedCount = @model.get("collected_count")
    @likeCount.html("#{collectedCount}")

    #model.get("collected") when you pass in front matter, @model.get('item')?.get('collected') is because sometimes we pass in a different model
    if @model.get("item")?.get("collected") || @model.get("collected")
      @$el.addClass("liked")

global.myd.LikeButtonView = LikeButtonView