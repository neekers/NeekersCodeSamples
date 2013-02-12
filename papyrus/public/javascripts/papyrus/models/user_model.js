(function() {
  var UserModel, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  UserModel = (function(_super) {

    __extends(UserModel, _super);

    function UserModel() {
      return UserModel.__super__.constructor.apply(this, arguments);
    }

    UserModel.prototype.defaults = {
      type: 'user',
      entity_url: '',
      first_name: 'Ondand',
      last_name: 'Only ',
      user_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef',
      image_url: '',
      topics_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/assets/collected_topics',
      bookmarks_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/assets/likes',
      items_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/owned_items',
      collections_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/my_profile',
      my_stats_url: 'http://local.collagio.com:9292/api/users/22eab720-7dbf-012f-3269-12313930b4ef/my_stats'
    };

    UserModel.prototype.initialize = function() {
      return this;
    };

    return UserModel;

  })(Backbone.Model);

  global.myd.UserModel = UserModel;

}).call(this);
