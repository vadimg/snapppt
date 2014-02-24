var express = require('express');

var model = require('./model');
var convert = require('./convert');

var app = express();

app.use(express.bodyParser());

app.get('/', function(req, res) {
 res.sendfile('./index.html');
});

app.post('/upload', function(req, res) {
  convert.processFile(req.files.file.path, function(err, path) {
    if (err) {
      return res.send(500);
    }
    model.createPresentation(path, function(err, pres) {
      if (err) {
        return res.send(500);
      }
      return res.send({
        id: pres.id,
        pres: pres.data
      });
    });
  });
});

app.post('/new_snap/*', function(req, res) {
 var deckid = req.params[0];
 model.getPresentation(deckid, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   pres.createSnap(function(err, snapid) {
     if (err) {
       return res.send(500);
     }
     return res.send({snapid: snapid});
   });
 });
});


app.get('/deck/*', function(req, res) {
 var id = req.params[0];
 model.getPresentation(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   return res.send(pres.data);
 });
});

app.get('/num_slides/*', function(req, res) {
 var id = req.params[0];
 model.getPresentationForSnap(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   res.send({
     numSlides: pres.data.slides.length,
   });
 });
});

app.get('/snap/*', function(req, res) {
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

app.get('/image/*/*.png', function(req, res) {
 var id = req.params[0];
 var n = req.params[1] - 0;
 model.getPresentationForSnap(id, function(err, pres) {
   if (err) {
     return res.send(404);
   }
   console.log(n ,pres.data.snaps[id].seen[n]);
   if (pres.data.snaps[id].seen[n]) {
     // seen already
     return res.send(410);
   }
   pres.data.snaps[id].seen[n] = true;
   pres.save();
   pres.getDeck(function(err, deck) {
     if (err) {
       return res.send(404);
     }
     res.type('png');
     res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1
     res.setHeader('Pragma', 'no-cache'); // HTTP 1.0
     res.setHeader('Expires', '0'); // Proxies
     res.send(deck[n]);
   });
 });
});


app.listen(8000);
