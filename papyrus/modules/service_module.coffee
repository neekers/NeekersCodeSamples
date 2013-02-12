global.myd ?= {}

serviceModule =
  get: ( options ) ->
    request = $.ajax
      type: "GET"
      dataType: 'json'
      contentType: "text/json"
      data: options.data
      url: if window.location.href.indexOf("https://") > -1 then options.url.replace("http://", "https://") else options.url.replace('https://', 'http://')
      success: options.success
      error: options.error
      
  post: ( options ) ->
    request = $.ajax
      type: "POST"
      dataType: 'json'
      contentType: "text/json"
      url: if window.location.href.indexOf("https://") > -1 then options.url.replace("http://", "https://") else options.url.replace('https://', 'http://')
      data: JSON.stringify( options.data )
      success: options.success
      error: options.error

  delete: ( options ) ->
    request = $.ajax
      type: "DELETE"
      dataType: 'json'
      contentType: "text/json"
      url: if window.location.href.indexOf("https://") > -1 then options.url.replace("http://", "https://") else options.url.replace('https://', 'http://')
      data: JSON.stringify( options.data )
      success: options.success
      error: options.error

global.myd.serviceModule = serviceModule
