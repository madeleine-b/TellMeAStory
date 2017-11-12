/* ----------------------- Mustache -------------------------*/

// Data to fill Mustache template.
var data = {
  title: "",
  text: ""
};

var titleTemplate = $("#title-template").html();
var textTemplate = $("#text-template").html();
var imageTemplate = $("#image-template").html();
var endTemplate = $("#end-template").html();

/* ----------------------- Flickity -------------------------*/

var bookOptions = {
	"The Three Little Pigs": "images/the_three_little_pigs.jpg", 
	"The Cat in the Hat": "images/the_cat_in_the_hat.jpg", 
	"Charlotte's Web": "images/charlottes_web.jpg", 
	"Tell Your Own Story": "images/tell_your_own_story.jpg"
}

for (var name in bookOptions) {
	var carouselCell = document.createElement("div");
	carouselCell.class = "carousel-cell";
	carouselCell.name = name;
	if (name == "Tell Your Own Story") {
		carouselCell.onclick = function() {
			chooseBook(this.name);
		};
	}

	var bookCover = document.createElement("img");
	bookCover.class = "carousel-cell-image";
	bookCover.alt = name;
	bookCover.width = 400;
	bookCover.height = 600;
	bookCover.src = bookOptions[name];
	carouselCell.appendChild(bookCover);

	$("#flickity-carousel").append(carouselCell);
}

var flkty = new Flickity( '#flickity-carousel', {
	imagesLoaded: true,
	wrapAround: true,
	setGallerySize: false
});


$("#book").hide();
$("#cat-hat-book").hide();
$("#pigs-book").hide();
$("#charlottes-book").hide();

function chooseBook(name) {
	$("#flickity-carousel").hide();
	$("#book").hide();
	$("#cat-hat-book").hide();
	$("#pigs-book").hide();
	$("#charlottes-book").hide();

	if (name == "Tell Your Own Story") {
		$("#book").show();
	} else if (name == "The Three Little Pigs") {
		$("#pigs-book").show();
	} else if (name == "Charlotte's Web") {
		$("#charlottes-book").show();
	} else {
		$("#cat-hat-book").show();
	}
}

/* ----------------------- Sizing -------------------------*/

// Calculate booklet size.
var w = $(window).width();
var h = window.innerHeight;

var BOOK_SIZE = 0.8; 
var ASPECT_RATIO = 3/2;
var bookWidth = w/2 * BOOK_SIZE;
var bookHeight = bookWidth * ASPECT_RATIO; 

if (bookHeight > h * BOOK_SIZE) {
	bookHeight = h * BOOK_SIZE;
	bookWidth = bookHeight / ASPECT_RATIO;
}

// Set up padding on booklet.
$("#title-cover").css("padding-top", (bookHeight/4)+"px");

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
        keyboard: false
	});

	$('#pigs-book').booklet({
		width: bookWidth * 2, 
		height: bookHeight,
        pagePadding: 0,
        pageNumbers: true,
        closed: true,
        covers: true,
        keyboard: false
	});

	$('#charlottes-book').booklet({
		width: bookWidth * 2, 
		height: bookHeight,
        pagePadding: 0,
        pageNumbers: true,
        closed: true,
        covers: true,
        keyboard: false
	});

	$('#cat-hat-book').booklet({
		width: bookWidth * 2, 
		height: bookHeight,
        pagePadding: 0,
        pageNumbers: true,
        closed: true,
        covers: true,
        keyboard: false
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

var PAGE_WORD_LIMIT = 80;
var WORD_SPEED = 200;
var startedStory = false;
var storyQueue = [];

function flipPage(direction) {
	if (direction != "next" && direction != "prev") {
		alert(direction + " is not a valid direction to flip page towards.");
	}

	$("#book").booklet(direction);	
}

function pageOverflowing(text) {
	var words = text.split(" ");
	return words.length > PAGE_WORD_LIMIT;
}

function addOneWord(word) {
	data.text += word + " ";

	// just started story (flip to first page)
	if (!startedStory) {
		flipPage("next");
		data.text = word + " ";
		startedStory = true;
	} 
	
	// current page overflowing, create new page
	else if (pageOverflowing(data.text)) { 
		addBlankPages();
		currentPage += 2;
		flipPage("next");
		data.text = word + " ";
	}

   	$("#page-" + currentPage).html(Mustache.render(textTemplate, data));
}

function addWords() {
	if (storyQueue.length != 0) {
		var word = storyQueue.shift();
		addOneWord(word);
	}
}

setInterval(addWords, WORD_SPEED);

function tellStory(text) {
	if (text.toLowerCase() == "the end") {
		endStory();
		return;
	}

	var words = text.split(" ");
	storyQueue = storyQueue.concat(words);
}

function tellTitle(title) {
	if (startedStory) {
		assert("Yo, you already told us the title: " + data.title);
	}

	data.title = title;
    $('#title-cover').html(Mustache.render(titleTemplate, data));
}

function endStory() {
	flipPage("next");

	// allow flipping of pages using keyboard left & right arrow keys
	$("#book").booklet("option", "keyboard", true);
	$("#book").booklet("option", "arrows", true);
}

/* ----------------------- Requesting data -------------------------*/

function addText() {
	$.ajax({
		'url' : 'http://66570844.ngrok.io/nextSnippet', 
    	'type' : 'GET'}).then(result => {
    		if (!startedStory && result.title != '') {
    			tellTitle(result.title);
    		}
    		if (result.text != '') {
    			tellStory(result.text);
    		}
    		console.log("get succesful");
    		console.log(result.text);
    	})
}

// setInterval(addText, 2000);
