(function() {
  var createAndStartAddItemsController, fetchBookmarks, parseBookmarks, _ref;

  if ((_ref = global.myd) == null) {
    global.myd = {};
  }

  parseBookmarks = function(response) {
    return _.map(response.collection.screens, function(screen) {
      return new myd.AddItemModel(screen);
    });
  };

  fetchBookmarks = function(callback) {
    return myd.serviceModule.get({
      url: myd.urls.bookmarks,
      success: function(response) {
        var models;
        models = parseBookmarks(response);
        return callback(models);
      }
    });
  };

  createAndStartAddItemsController = function(addItemsUrl, collectionUrl) {
    var addItemChooser, bookmarksCollection;
    addItemChooser = new myd.AddItemChooserView();
    bookmarksCollection = new global.myd.AddItemCollection();
    bookmarksCollection.on('reset', function() {
      return addItemChooser.resetItems(bookmarksCollection);
    });
    bookmarksCollection.on('tileSelected', function(item) {
      return addItemToCollection(item, addItemsUrl, function() {
        addItemChooser.hide();
        return Router.collections(collectionUrl);
      });
    });
    return fetchBookmarks(function(addItemModels) {
      bookmarksCollection.reset(addItemModels);
      return addItemChooser.show();
    });
  };

  global.myd.createAndStartAddItemsController = createAndStartAddItemsController;

}).call(this);
