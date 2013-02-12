$(function() {
  // bookmarking
  $(".bookmark").click(function(event){
    // alert("yo dawg i heard you like bookmarking")
    $(this).toggleClass("bookmarked");
    return false
  });

  // full screen for cards that aren't cardstacks
  $(".card").click(function cardClick(){
    var tile = $(this);
    // if its MY collection
    if (tile.hasClass('my_collection')) {
       window.location = '/prototypes/my_collection'
      return false
    } else
    // if its a collection
    if (tile.hasClass('cardstack')) {
      window.location = '/prototypes/not_my_collection'
    }
    // screen
    else {
      tile.toggleClass("fullscreen");
      $('body').toggleClass('fullscreen');
    } 
  }); // end full screen for cards
  
  // show a form when user clicks the add box
  $('.add_to_collection').click(function(){
    $('.add_to_collection > form').addClass("activated");
  });

  //append a new collection when user clicks on add button
  $('.go_btn').click(function(){
	  $('.upload_collection').after('<article class="card cardstack new_collection my_collection" onClick="myCollectionEmpty()"><h2>New Collection</h2><div class="card_meta"><div class="item_count">0 items</div><div class="appendix_count">0 Soundoffs</div></div></article>');
  });

  //append a new asset to an appendix
  $('.appendix_meta .assets_thumb').click(function(){
	  $('.appendix_meta').after('<article class="card quad new"></article>');
  });
  
  //append a new asset to my collection
  $('.my_collection .assets_thumb').click(function(){
	  $('.collection_owner').after('<article class="card large new"><a class="bookmark"></a></article>');
  });
  
  // close the form on cancel
  $('.cancel_btn').click(function(){
    $(this).parent('form').removeClass("activated");
    return false
  });
  
  //open overlay to show assets from a collection
  $('.collection_thumbs').click(function(){
    $('.add_assets_overlay').addClass('active');
  });
  
  $('.go_btn').click(function(){
    $('.add_assets_overlay').addClass('active');
    $('.add_assets_overlay > h2').replaceWith('<h2>Assets from Google</h2>')
  });
  
  $('.add_assets_overlay').click(function(){
    $('.add_assets_overlay').removeClass('active');
    $('.add_assets_overlay > h2').replaceWith('<h2>Assets from Collection#</h2>')
  })
  
  
  // back arrow
  $('.back_arrow').click(function(){
    window.history.back();
    return false;
  });
 
 // search t3h googles
 $('#search_googles').click(function(){
   
 });

 // check for title h1 and change title of page in header
var headertext = $('.page_title').html();
//$('.title').html(headertext); 
 $('.title').html(headertext); 

function myCollectionEmpty(){
  window.location = "/prototypes/my_collection_empty"
}

});