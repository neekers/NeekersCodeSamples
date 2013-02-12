global.myd ?= {}

class TurntableModule
  currentPage = 0

  constructor: (params) ->
    @$el = params.el
    @onAfterSlide = params.onAfterSlide
    @slides = @$el.children('li')
    @slideWidth = $(@slides[0]).outerWidth()

    @centerSlide()

    $(window).bind('resize.turntable', _.throttle($.proxy(@centerSlide, @), 500))

    # Stops auto scrolling when a user scrolls
    # Delayed slightly to avoid page jumps triggering scroll
    setTimeout(
      => $(window).one('scroll', $.proxy(@stopTimer, @))
    , 5000)

    @startTimer()

  slide: (page = currentPage+1, forced = false) ->
    if page == currentPage then return
    if page >= @slides.length then page = 0
    if forced then @resetTimer()
    
    currentPage = page
    @centerSlide()
    @onAfterSlide(page, forced)

  centerSlide: ->
    @$el.css('left', (($(window).width()/2) - (@slideWidth/2)) - (currentPage * @slideWidth))

  startTimer: ->
    @timer = window.setInterval($.proxy(@slide, @), 5000)

  stopTimer: ->
    window.clearTimeout(@timer)

  resetTimer: ->
    @stopTimer()
    @startTimer()

  getCurrentSlide: ->
    currentPage

  close: ->
    $(window).unbind('resize.turntable')

global.myd.TurntableModule = TurntableModule