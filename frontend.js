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
});

// Updating title cover, pages, and end cover.
$("#title-cover").html(Mustache.render(titleTemplate, data));
$('#page-2').html(Mustache.render(textTemplate, data));
$('#page-3').html(Mustache.render(imageTemplate, data));
$("#end-cover").html(Mustache.render(endTemplate, data));

var currentPage = 2;
var numPages = 4;

function addBlankPages() {
 	var textPage = document.createElement("div");
 	textPage.class = "text-page";
 	textPage.id = "page-" + numPages;
    $('#book').booklet("add", numPages, '<div class="text-page" id="' + textPage.id + '"></div>');
    $("#page-" + numPages).html(Mustache.render(textTemplate, data)); 
 	numPages++;

 	var imagePage = document.createElement("div");
 	imagePage.class = "image-page";
 	imagePage.id = "page-" + numPages;
    $('#book').booklet("add", numPages, '<div class="image-page" id="' + imagePage.id + '"></div>');
    $("#page-" + numPages).html(Mustache.render(imageTemplate, data));
 	numPages++;
}

function addTextToPage(text) {
	data.text += text;
    $("#page-" + currentPage).html(Mustache.render(textTemplate, data)); 
}

/* ----------------------- Requesting data -------------------------*/

function addText(moreText) {
	console.log(moreText);
}

