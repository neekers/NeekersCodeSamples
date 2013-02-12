(function() {
  var CommentsCollection, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  CommentsCollection = Backbone.Collection.extend({
    model: myd.CommentModel,
    fetched: false,
    initialize: function(params) {
      this.commentsUrl = params.comments_url;
      return this;
    },
    save: function(comment) {
      var _this = this;
      return myd.serviceModule.post({
        url: this.commentsUrl,
        data: comment.toJSON(),
        success: function(response) {
          return _this.add(response);
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    },
    "delete": function(comment) {
      var _this = this;
      if (comment.get("deleted")) {
        return myd.serviceModule["delete"]({
          url: comment.get("entity_url"),
          success: function(response) {
            return _this.remove(comment);
          },
          error: function(response) {
            return _this.trigger("errorReset");
          }
        });
      }
    },
    fetch: function(page, per_page) {
      var _this = this;
      if (page == null) {
        page = 0;
      }
      if (per_page == null) {
        per_page = 20;
      }
      this.fetched = true;
      return myd.serviceModule.get({
        url: this.commentsUrl,
        data: {
          page: page,
          per_page: per_page
        },
        success: function(response) {
          if (page === 0) {
            return _this.reset(response);
          } else {
            return _this.add(response.reverse(), {
              at: 0
            });
          }
        },
        error: function(response) {
          return _this.trigger("errorReset");
        }
      });
    }
  });

  global.myd.CommentsCollection = CommentsCollection;

}).call(this);
