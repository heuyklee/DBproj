var http=require('http');
var https = require('https');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

var options = {
	key: fs.readFileSync('/home/ec2-user/keyandcert/giyo.pem'),
	cert: fs.readFileSync('/home/ec2-user/keyandcert/giyo.be.pem'),
};

var port1 = 8000;
var port2 = 8008;

app.use(bodyParser.json());

http.createServer(app).listen(port1, function(){
  console.log("Http server listening on port " + port1);
});
https.createServer(options, app).listen(port2, function(){
  console.log("Https server listening on port " + port2);
});

app.get('/', function (req, res) {
  res.send('Hello world!!');
});
//app.get('/webhook/', function (req, res) {
//  if (req.query['hub.verify_token'] === 'rjazhd') {
//    res.send(req.query['hub.challenge']);
//  }
//  res.send('Error, wrong validation token');
//});

//--------------------------------------------------------------
var token = fs.readFileSync('/home/ec2-user/facebook/token.txt');
var request = require('request')

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      console.log('message come : ' + text);
      if (text === 'Generic') {
         sendGenericMessage(sender);
         continue;
      }
      sendTextMessage(sender, " I got the text, echo: "+ text.substring(0, 200));
    }
    if (event.postback) {
       text = JSON.stringify(event.postback);
       sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token);
       continue;
    }
  }
  res.sendStatus(200);
});

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}



