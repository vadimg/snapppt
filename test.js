var fs = require('fs');

var convert = require('./convert');
var model = require('./model');

var filename = process.argv[2];

var data = fs.readFileSync(filename);
convert.processFile(filename, data, function(err, path) {
  console.log(err);
  console.log(path);
  model.createPresentation(path, function(err, pres) {
    console.log(err);
    console.log(pres);
    pres.createSnap(function(err, id) {
      console.log(err);
      console.log(id);
      pres.getDeck(function(err, slides) {
        console.log(err);
        console.log(slides);
      });
    });
  });
});
