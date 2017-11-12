/* ----------------------- Mustache -------------------------*/

// Data to fill Mustache template.
var data = {
  title: "The Three Little Pigs",
  text: "Once upon a time"
};

var titleTemplate = $("#title-template").html();
var textTemplate = $("#text-template").html();
var imageTemplate = $("#image-template").html();
var endTemplate = $("#end-template").html();

/* ----------------------- Sizing -------------------------*/

// Calculate booklet size.
var w = $(window).width();
var h = $(window).height();

var BOOK_SIZE = 0.8; 
var ASPECT_RATIO = 3/2;
var bookWidth = w/2 * BOOK_SIZE;
var bookHeight = bookWidth * ASPECT_RATIO; 

if (bookHeight > h * BOOK_SIZE) {
	bookHeight = h * BOOK_SIZE;
	bookWidth = bookHeight / ASPECT_RATIO;
}

/* ----------------------- Booklet -------------------------*/

// Initialize booklet.
$(function() {
	// Single book
	$('#book').booklet({
		width: bookWidth * 2, 
		height: bookHeight,
        pagePadding: 0,
        pageNumbers: true,
        closed: true,
        covers: true,
        keyboard: true
	});

	$('#mybook').booklet("enable");
});

// Updating title cover, pages, and end cover.
$("#title-cover").html(Mustache.render(titleTemplate, data));
$('#page-1').html(Mustache.render(textTemplate, data));
$('#page-2').html(Mustache.render(imageTemplate, data))
$("#end-cover").html(Mustache.render(endTemplate, data));

/* ----------------------- Requesting data -------------------------*/

function addText(moreText) {
	console.log(moreText);
}

