global.myd ?= {}

routesModule =
  
  # collection route
  getRoutesFromRelativePath: ( pathname )->
    if (pathname.substr(0, 1) == '/')
      pathnameWithLeadingSlash = pathname
    else
      pathnameWithLeadingSlash = '/' + pathname
    {
      pathname: pathnameWithLeadingSlash
      getPapyrusPath: ( screenId ) ->
        if screenId?
          "/c#{pathnameWithLeadingSlash}/screens/#{encodeURIComponent(screenId)}"
        else
          "/c#{pathnameWithLeadingSlash}"
    }

  # screen tile cicked
  getRoutesFromUrl: ( url, alwaysRefresh )->
    pathname = new myd.Uri( url ).getPathname()
    {
      pathname: pathname
      getPapyrusPath: ( screenId ) ->
        if screenId?
          "/c#{pathname}/screens/#{encodeURIComponent(screenId)}"
        else
          "/c#{pathname}"
    }

global.myd.routesModule = routesModule
