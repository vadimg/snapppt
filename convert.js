var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

var mktemp = require('mktemp');

function convert2pdf(filename, data, cb) {
  var extension = path.extname(filename);

  mktemp.createDir('/tmp/pres-XXXXXX', function(err, path) {
    if (err) {
      return cb(err);
    }
    var tempFilename = path + '/presentation' + extension;
    fs.writeFile(tempFilename, data, function(err) {
      if (err) {
        return cb(err);
      }
      if (extension === '.pdf') {
        return cb(null, tempFilename);
      }
      var unoprocess = spawn('unoconv', ['-f', 'pdf', tempFilename]);
      unoprocess.on('close', function(code) {
        if (code !== 0) {
          return cb(new Error('Unoconv failed: ' + code));
        }
        return cb(null, path + '/presentation.pdf');
      });
    });
  });
}

function pdf2png(pdfFilename, cb) {
  mktemp.createDir('/tmp/png-XXXXXX', function(err, path) {
    if (err) {
      return cb(err);
    }

    var process = spawn('convert', [pdfFilename, path + '/%04d.png']);
    process.on('close', function(code) {
      if (code !== 0) {
        return cb(new Error('convert failed: ' + code));
      }
      return cb(null, path);
    });
  });
}

function processFile(filename, data, cb) {
  convert2pdf(filename, data, function(err, pdfFilename) {
    if (err) {
      return cb(err);
    }
    pdf2png(pdfFilename, cb);
  });
}

module.exports = {
  processFile: processFile
};
