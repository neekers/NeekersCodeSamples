global.myd ?= {}

class UserModel extends Backbone.Model
  defaults:
    type: 'user'
    entity_url:        ''
    first_name:       'Ondand'
    last_name:        'Only '
    user_url:         'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef'
    image_url:        ''
    topics_url:       'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/assets/collected_topics'
    bookmarks_url:    'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/assets/likes'
    items_url:        'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/owned_items'
    collections_url:  'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/my_profile'
    my_stats_url:     'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/my_stats'


  initialize: ->
    @

global.myd.UserModel = UserModel
