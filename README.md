MyD
===

Old My Discovery work

It's an app that was called, Collagio and it was a place to share knowledge in a structured format like multimedia collages of information for the sake of learning.  
Similar product is http://www.learnist.com


Under the Papyrus folder you'll find the basic structure of our non-rails ruby app. It was using sinatra and padrino, all direct REST, no ORM with a backend db of neo4j

CoffeeScript/Javascript examples
===

Way Back Button/View/Model
===
I created something that was akin to a back button with history of the user using backbone and also saving the thumbnail images of each section for display. 

Collage View/Screen View/Screen Renderer and the 4 types of assets
Photo, Video, Text and RSS.
===
These files allow us to paint an entire multimedia gallery with different asset types.  Templates for each context and view were being managed centrally for the app since we had to show those same assets in many other pages
I wrote all these base classes for my team that served until the end of our run. Most were refactored from original copies to make sense and there was no philosophy in the coding structure.
Keyboard navigation and making sure there was an "active" item above the fold to display the comments box active other share buttons.
Also we had inline editing in this view so that a user can add or delete or go to another view overlayed and reorder.  We had a number of memory leaks in the beginning of writing this because of the non-disposed views, that's when we added a framework to help us unbind. Also adding the close function to Backbone view was help to climb up the chain for disposing of views in the DOM.

Screen Comments/List/View/Model
===
This feature allowed a user to make a comment on an asset. It had an active and faded state. We put in a way in a collage to navigate and leave a comment without leaving the keyboard as well.
This was a great exercise for me in building flexible code, because the requirements kept changing about how many comments need to show and paging for those comments, the length shown.


CSS
===
We were really trying to build a beautiful product and paid lots of attention to the animations in the app. I learned a great deal about frameworks and using CSS animations with timing which is hard if you want something to happen after an animation is complete
I learned all the ways to get things vertically centered and mastered it in this application. Also learning SaSS was a great challenge. We initially were nesting a lot, until we realized that that was slowing down our application because of how long the selectors were getting

  Gradient mixin
  Great app on apple store called Gradient. We used it all over to help us create gorgeous gradients with ease. It comes with a mixin that works with SCSS quite nicely 

  Item lightbox SASS
  I am really proud of the work done in positioning this item lightbox that can resize for each asset type, but is always centered horizontally and vertically on the screen with a close button using pseudo elements
  
  Fact markdown
  Here we had to do the opposite of a reset and make some basic HTML styles work on our site again.  This was meant to override our general site styles for lists and paragraphs to make the content stand out.
  
  Notifications
  Had fun with mixins and gradients and button states. Here we also had to use a notch to make the modal look like a comic balloon.
  


Pinster
===
This section was written in pure JS and CSS. See folder's readme for more info

