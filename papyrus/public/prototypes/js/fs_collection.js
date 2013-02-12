$("document").ready(function(){
	$(".bookmark").click(function(){
		$(this).toggleClass("bookmarked");
	})
})














/*
$("document").ready(function(){
	$("#thumbnail").click(function(){
		createStackCardOverlay();
		onResize();
	})
	
	$(window).resize(function() {
		onResize();
	  //$('#log').append('<div>Handler for .resize() called.</div>');
	});
})


function createStackCardOverlay(){
	//main overlay container
	var overlayContainer = $('<div id="overlayContainer" />');
	
	//overlay background
	var overlayBackground = $('<div id="overlayBackground" />');
	overlayContainer.append(overlayBackground);
	
	//overlay content
	var overlayContent = $('<div id="overlayContent" />');
	overlayContainer.append(overlayContent);
	
	//image container
	var overlayMainImageContainer = $('<div id="overlayMainImageContainer" />');
	overlayContent.append(overlayMainImageContainer);
	
	//overlay image
	var overlayMainImage = $('<img id="overlayMainImage" src="./images/truck.jpg" />');
	overlayMainImageContainer.append(overlayMainImage);
	
	//open button
	var overlayOpenButton = $('<div id="overlayOpenButton" />');
	//overlayMainImageContainer.append(overlayOpenButton);
		
	//Add the overlay to the body
	$('body').append(overlayContainer);
	
	//Remove the overlay
	$("#overlayBackground").click(function(){
		//$("#overlayContainer").remove();
	});
}

function onResize(){
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();
	
	$("#overlayBackground").css('width', windowWidth);
	$("#overlayBackground").css('height', windowHeight);
	
	$("#overlayContainer").css('width', windowWidth);
	$("#overlayContainer").css('height', windowHeight);
}
*/