var express = require('express');

var model = require('./model');
var convert = require('./convert');

var app = express();

app.use(express.bodyParser());

// static routes
app.use('/scripts', express.static('frontend/dist/scripts'));
app.use('/styles', express.static('frontend/dist/styles'));
app.use('/views', express.static('frontend/dist/views'));
app.use('/bower_components', express.static('frontend/dist/bower_components'));
app.get('/', function(req, res) {
 res.sendfile('frontend/dist/index.html');
});

app.post('/upload', function(req, res) {
  convert.processFile(req.files.file.path, function(err, path) {
    if (err) {
      console.trace(err);
      return res.send(500);
    }
    model.createPresentation(path, function(err, id) {
      if (err) {
        console.trace(err);
        return res.send(500);
      }
      return res.send({
        id: id
      });
    });
  });
});

app.post('/new_snap/*', function(req, res) {
 var deckid = req.params[0];
 model.createSnap(deckid, function(err, snapid) {
   if (err) {
     console.trace(err);
     return res.send(500);
   }
   return res.send({snapid: snapid});
 });
});


app.get('/deck/*', function(req, res) {
 var id = req.params[0];
 model.getSnapsForDeck(id, function(err, data) {
   if (err) {
     return res.send(404);
   }
   return res.send({snaps: data});
 });
});

app.get('/num_slides/*', function(req, res) {
 var id = req.params[0];
 model.getNumSlides(id, function(err, num) {
   if (err) {
     return res.send(404);
   }
   res.send({
     numSlides: num
   });
 });
});

app.get('/image/*/*.png', function(req, res) {
 var id = req.params[0];
 var n = req.params[1] - 0;
 model.viewSnap(id, n, function(err, imgData) {
   if (err) {
     return res.send(404);
   }
   res.type('png');
   res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1
   res.setHeader('Pragma', 'no-cache'); // HTTP 1.0
   res.setHeader('Expires', '0'); // Proxies
   res.send(imgData);
 });
});


console.log('listening on port 8000');
app.listen(8000);
