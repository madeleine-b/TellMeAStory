const express = require('express');
const jquery = require('jquery');

const VoiceResponse = require('twilio').twiml.VoiceResponse;
//const urlencoded = require('body-parser').urlencoded;

const app = express();
/*app.use(urlencoded({extended: false}));
app.use((request, response, next) => {
  response.type('text/xml');
  next();
});  */

var storyTitle = "Story Title";

app.get('/', function (request, response) {
  res.sendFile(__dirname+'/index.html');
});

app.post('/voice', (request, response) => {
  const twiml = new VoiceResponse();
  twiml.say('What is the title of the story?', { voice: 'alice' });
  const gather = twiml.gather({
    timeout: '5',
    speechTimeout: 'auto',
    input: 'speech',
    action: '/gettitle'
  });
  response.type('text/xml');
  response.send(twiml.toString());
});

app.post('/gettitle', (request, response) => {
  storyTitle = request.SpeechResult;
  console.log(storyTitle);
  
  response.sendFile(__dirname+'/index.html');
});

app.listen(3000, function() {
    console.log('System app HTTP server running at http://127.0.0.1:3000');
});

/* parent calls twilio phone number
   parent says the title
   twilio prints title on the page */