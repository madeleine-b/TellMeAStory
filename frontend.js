// Mustache template stuff
var data = {
  title: "The Three Little Pigs",
  text: "Once upon a time"
};

var template = $("#template").html();

// Updating the template.
var output = Mustache.render(template, data);
$('#result').html(output);