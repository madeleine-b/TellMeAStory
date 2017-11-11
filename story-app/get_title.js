const express = require('express');
const jquery = require('jquery');

const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;

const app = express();
app.use(urlencoded({extended: false}));
app.use((request, response, next) => {
  response.type('text/xml');
  next();
});  

var storyTitle = "Story Title";
var processedSnippets = [];

app.get('/', function (request, response) {
  response.sendFile(__dirname+'/index.html');
});

app.post('/voice', (request, response) => {
  const twiml = new VoiceResponse();
  twiml.say('What is the title of your story?', { voice: 'alice' });
  const gather = twiml.gather({
    timeout: '5',
    speechTimeout: 'auto',
    input: 'speech',
    action: '/getTitle'
  });
  response.type('text/xml');
  response.send(twiml.toString());
});

function repeatTitle(twiml) {
  twiml.say("Sorry, didn't quite catch that.", { voice: 'alice' });
  twiml.redirect(307, '/voice');
  return twiml;
}

app.post('/getTitle', (request, response) => {
  const twiml = new VoiceResponse();
  response.type('text/xml');
  storyTitle = request.body.SpeechResult;
  var confidence = request.body.Confidence;
  console.log('Heard the title as: ' + storyTitle + " (with confidence " + confidence.toString());
  if (confidence < 0.70) { // still need to test this branch 
    var finalResponse = repeatTitle(twiml);
    response.send(finalResponse.toString());
  }
  twiml.say("Whenever you're ready, tell the story called "+storyTitle, { voice: 'alice' });
  var finalResponse = listenToStory(twiml, storyTitle);
  response.send(finalResponse.toString());
});

function listenToStory(twiml, storyTitle){
  console.log("we are here");
  
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

  console.log(request.body.SpeechResult);
  processedSnippets += request.body.SpeechResult;

  const gatherNode = twiml2.gather({
      timeout: '10',
      speechTimeout: 'auto',
      input: 'speech',
      action: '/continueListening'
    });

  if (processedSnippets.length < 10) {
    twiml2.say("Goodbye", {voice: 'alice'});
    twiml2.hangup();
  }
    
  response.type('text/xml');
  response.send(twiml2.toString());
}); 

app.listen(3000, function() {
    console.log('System app HTTP server running at http://127.0.0.1:3000');
});

/* parent calls twilio phone number
   parent says the title
   twilio prints title on the page */