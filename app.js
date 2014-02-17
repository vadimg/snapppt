var express = require('express');

var model = require('./model');

var app = express();

app.get('/', function(req, res) {
 res.sendfile('./index.html');
});

app.get('/d/*', function(req, res) {
 var id = req.params[0];
 model.getPresentation(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   return res.send(pres.data);
 });
});

app.get('/s/*', function(req, res) {
 var id = req.params[0];
 model.getPresentationForSnap(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   pres.getDeck(function(err, deck) {
     if (err) {
       return res.send(404);
     }

     var ret = [];
     deck.forEach(function(slide) {
       var b64 = slide.toString('base64');
       ret.push('data:image/png;base64,' + b64);
     });
     res.send(ret);
   });
 });
});

app.get('/i/*/*.png', function(req, res) {
 var id = req.params[0];
 var n = req.params[1] - 0;
 model.getPresentationForSnap(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   pres.getDeck(function(err, deck) {
     if (err) {
       return res.send(404);
     }
     res.type('png');
     res.send(deck[n]);
   });
 });
});


app.listen(8000);