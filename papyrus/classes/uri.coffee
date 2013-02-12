global.myd ?= {}

class Uri

  constructor: ( url ) ->
    @parser = document.createElement('a')
    @parser.href = url

    queryString = @parser.search.slice( 1 ) # remove the '?' character
    @queryItems = @buildQueryItems(queryString)
    
  toString: ->
    @getProtocol() + "//" + @getHost() + @getPathname() + @getQuery() + @getHash()

  buildQueryItems: ( queryString ) ->
    _.chain(queryString.split('&'))
      .map((keyValue) -> keyValue.split('='))
      .map(([key,value]) -> { key: decodeURIComponent(key).toLowerCase(), value: decodeURIComponent(value) })
      .value()

  get: ( key ) ->
    _.find(@queryItems, (item) -> item.key == key.toLowerCase())

  set: ( key, value ) ->
    item = @get(key)
    if item?
      item.value = value
    else
      @queryItems.push( key: key, value: value )

  getQuery: ->
    keyValues = _.map(@queryItems, (item) -> "#{encodeURIComponent(item.key)}=#{encodeURIComponent(item.value)}")
    "?" + keyValues.join("&")

  getProtocol: ->
    @parser.protocol

  getHost: ->
    @parser.host

  getHostname: ->
    @parser.hostname

  getPort: ->
    @parser.port

  getPathname: ->
    pathname = @parser.pathname
    if pathname.charAt(0) != "/"
      "/" + pathname
    else
      pathname

  getHash: ->
    @parser.hash

global.myd.Uri = Uri
