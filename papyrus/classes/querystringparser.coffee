global.myd ?= {}

class QueryStringParser

  constructor: ( queryString ) ->
    @queryItems = @buildQueryItems(queryString)

  buildQueryItems: ( queryString ) ->
    _.chain(queryString.split('&'))
      .map((keyValue) -> keyValue.split('='))
      .map(([key,value]) -> { key: key.toLowerCase(), value: value })
      .value()

  get: ( key ) ->
    _.find(@queryItems, (item) -> item.key == key.toLowerCase())

  getQuery: ->
    keyValues = _.map(@queryItems, (item) -> "#{encodeURIComponent(item.key)}=#{encodeURIComponent(item.value)}")
    "?" + keyValues.join("&")


global.myd.QueryStringParser = QueryStringParser
