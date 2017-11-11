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
  response.redirect(307, '/listenToStory');
});

/*function listenToStory(twiml, storyTitle){
  console.log("we are here");
  twiml.say("Whenever you're ready, tell the story called "+storyTitle, { voice: 'alice' });
  processedSnippets += request.body.SpeechResult;
  if (processedSnippets.length > 10) {
    twiml.say("Goodbye", {voice: 'alice'});
    twiml.hangup();
    return twiml;
  }
  const gather = twiml.gather({
    timeout: '5',
    speechTimeout: 'auto',
    input: 'speech'
  // continue listening... 
  });
  return twiml;
} */

app.get('/listenToStory', (request, response) => {
  const twiml = new VoiceResponse();
  twiml.say("Whenever you're ready, tell the story called "+storyTitle, { voice: 'alice' });
  
  function gather() {
    const gatherNode = twiml.gather({
      timeout: '10',
      speechTimeout: 'auto',
      input: 'speech'
    });

    twiml.redirect('/listenToStory');
  }

  while (processedSnippets.length < 10) {
    gather();
    console.log(request.body.SpeechResult);
    if (request.body.SpeechResult) {
      processedSnippets += request.body.SpeechResult;
    }
  }
  twiml.say("Goodbye", {voice: 'alice'});
  twiml.hangup();
    
  response.type('text/xml');
  response.send(twiml.toString());
}); 

app.listen(3000, function() {
    console.log('System app HTTP server running at http://127.0.0.1:3000');
});

/* parent calls twilio phone number
   parent says the title
   twilio prints title on the page */