const express = require('express');

const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;

const app = express();
app.use(urlencoded({extended: false}));
app.use((request, response, next) => {
	response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	response.type('text/xml');
	next();
});  

var storyTitle = "Story Title";
var processedSnippets = [];
var snippetQueue = ["a", "b", "c"];

app.get('/', function (request, response) {
	response.sendFile(__dirname+'/index.html');
});

app.post('/entry', (request, response) => {
  const twiml = new VoiceResponse();
  twiml.say('Are you the speaker or the listener', { voice: 'alice' });
  const gather = twiml.gather({
    timeout: '10',
    speechTimeout: 'auto',
    input: 'speech',
    action: '/getRole'
  });
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/getRole', (request, response) => {
  const twiml2 = new VoiceResponse();
  response.type('text/xml');
  const role = request.body.SpeechResult.toLowerCase();
  console.log(role);
  if (role == 'speaker') {
  	var finalResponse = askForTitle(twiml2);
    response.send(finalResponse.toString());
  } else {
  	const dial = twiml2.dial();
  	dial.conference('Room 1234');
  	response.send(twiml2.toString());
  }
});

function askForTitle() {
	const twiml = new VoiceResponse();
	processedSnippets = [];  // clear out any old snippets 
	snippetQueue = [];
	twiml.say('What is the title of your story?', { voice: 'alice' });
	const gather = twiml.gather({
    timeout: '10',
    speechTimeout: 'auto',
    input: 'speech',
    action: '/getTitle'
  });

  return twiml;
}

// app.post('/voice', (request, response) => {
//   const twiml = new VoiceResponse();
//   twiml.say('What is the title of your story?', { voice: 'alice' });
//   const gather = twiml.gather({
//     timeout: '5',
//     speechTimeout: 'auto',
//     input: 'speech',
//     action: '/getTitle'
//   });
//   response.type('text/xml');
//   response.send(twiml.toString());
// });

/*function repeatTitle(twiml) {
  twiml.say("Sorry, didn't quite catch that.", { voice: 'alice' });
  twiml.redirect(307, '/voice');
  return twiml;
} */

app.post('/getTitle', (request, response) => {
  const twiml = new VoiceResponse();
  response.type('text/xml');
  storyTitle = request.body.SpeechResult;
  var confidence = request.body.Confidence;
  console.log('Heard the title as: ' + storyTitle + " (with confidence " + confidence.toString() + ")");
  if (confidence < 0.70) { // still need to test this branch 
    const twiml_temp = new VoiceResponse();
    twiml_temp.say("Sorry, didn't quite catch that.", { voice: 'alice' });
    twiml.redirect(307, '/getTitle');
  }
  const dial = twiml.dial();
  dial.conference('Room 1234');
  twiml.say("Whenever you're ready, tell the story called "+storyTitle, { voice: 'alice' });
  var finalResponse = listenToStory(twiml, storyTitle);
  response.send(finalResponse.toString());
});

app.get('/nextSnippet', (request, response) => {
	var snippetToSend = snippetQueue[0] ? snippetQueue[0] : '';
	var jsonSnippets = JSON.stringify({'title' : storyTitle, 'text' : snippetToSend});
	snippetQueue.splice(0, 1);  // remove first element
	console.log(snippetQueue);
	response.setHeader('Content-Type', 'application/json');
	response.send(jsonSnippets);
});

function listenToStory(twiml, storyTitle){
	console.log("Beginning to listen to the story");  
	const gatherNode = twiml.gather({
			timeout: '10',
			speechTimeout: 'auto',
			input: 'speech', 
			action: '/continueListening'
	});
	return twiml;
} 

app.post('/continueListening', (request, response) => {
	const twiml2 = new VoiceResponse();

	console.log("Story snippet: " + request.body.SpeechResult);
	processedSnippets.push(request.body.SpeechResult);
	snippetQueue.push(request.body.SpeechResult);

	if (processedSnippets.length > 10) {
		twiml2.say("Goodbye", {voice: 'alice'});
		twiml2.hangup();
		response.send(twiml2.toString());
	}

	const gatherNode = twiml2.gather({
			timeout: '10',
			speechTimeout: 'auto',
			input: 'speech',
			action: '/continueListening'
		});

	response.type('text/xml');
	response.send(twiml2.toString());
 }); 

app.listen(3000, function() {
		console.log('System app HTTP server running at http://127.0.0.1:3000');
});
