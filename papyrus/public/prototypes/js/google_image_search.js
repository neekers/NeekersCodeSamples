/*
 *  How to search for images on a specific site.
 */

google.load('search', '1');

function onLoad() {
  // Create a search control.
  var searchControl = new google.search.SearchControl();

  // Create an ImageSearch.
  var imageSearch = new google.search.ImageSearch();

  // Set a site restriction to the desired web site.
  imageSearch.setSiteRestriction('http://imgur.com/r/aww');

  // Add the searcher to the SearchControl.
  searchControl.addSearcher(imageSearch);

  // Tell the searcher to draw itself and tell it where to attach.
  searchControl.draw(document.getElementById('content'));

  // Search!
  searchControl.execute('cats');
}

google.setOnLoadCallback(onLoad);
