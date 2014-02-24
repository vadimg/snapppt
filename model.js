var fs = require('fs.extra');
var crypto = require('crypto');

var DATA_DIR = './data/'; // with trailing slash

fs.mkdirp(DATA_DIR, function(err) {
  if (err) {
    throw err;
  }
});

function getData() {
  // TODO: hack
  var filename = DATA_DIR + '/data.json';
  try {
    fs.readFileSync(filename);
  } catch(e) {
    fs.writeFileSync(filename, JSON.stringify({snaps: {}}));
  }
  return JSON.parse(fs.readFileSync(filename));
}

function setData(data) {
  // TODO: hack
  var filename = DATA_DIR + '/data.json';
  fs.writeFileSync(filename, JSON.stringify(data));
}

function Presentation(id) {
  this.id = id;
  this._db = DATA_DIR + this.id + '/data.json';
}

Presentation.prototype._data = function(cb) {
  fs.readFile(this._db, function(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, JSON.parse(data));
  });
};

Presentation.prototype.save = function(cb) {
  var str = JSON.stringify(this.data);
  fs.writeFile(this._db, str, cb);
};

Presentation.prototype.createSnap = function(cb) {
  var self = this;
  createID(function(err, id) {
    if (err) {
      return cb(err);
    }

    self.data.snaps[id] = {
      // an array of falses
      seen: Array.apply(null, Array(self.data.slides.length)).map(function() { return false; })
    };

    var data = getData();
    data.snaps[id] = self.id; // pointer to presentation
    setData(data);

    self.save(function(err) {
      cb(err, id);
    });
  });
};

Presentation.prototype.getDeck = function(cb) {
  var self = this;
  var images = {};
  var names = [];
  var errored = false;
  self.data.slides.forEach(function(file) {
    var filename = DATA_DIR + self.id + '/' + file;
    fs.readFile(filename, function(err, buf) {
      if (err) {
        if (!errored) {
          errored = true;
          cb(err);
        }
        return;
      }
      images[filename] = buf;
      names.push(filename);
      if (names.length === self.data.slides.length) {
        names.sort();
        var ret = [];
        names.forEach(function(name) {
          ret.push(images[name]);
        });
        cb(null, ret);
      }
    });
  });
};

function createID(cb) {
  crypto.randomBytes(16, function(err, buf) {
    if (err) {
      return cb(err);
    }
    var id = buf.toString('base64').replace('/', '-').slice(0, -2);
    cb(null, id);
  });
}

function createPresentation(pngDir, cb) {
  createID(function(err, id) {
    if (err) {
      return cb(err);
    }
    var datadir = DATA_DIR + id;

    fs.copyRecursive(pngDir, datadir, function(err) {
      if (err) {
        return cb(err);
      }

      fs.readdir(datadir, function(err, files) {
        if (err) {
          return cb(err);
        }
        var data = {
          slides: files,
          snaps: {}
        };
        var pres = new Presentation(id);
        pres.data = data;
        pres.save(function(err) {
          return cb(err, pres);
        });
      });
    });
  });
}

function getPresentation(id, cb) {
  var pres = new Presentation(id);

  // try to get data as a way to check if it's valid
  pres._data(function(err, data) {
    if (err) {
      return cb(new Error('Invalid presentation id: ' + id));
    }
    pres.data = data;
    return cb(null, pres);
  });
}

function getPresentationForSnap(id, cb) {
  var data = getData();
  if (!data.snaps[id]) {
    cb(new Error('Invalid snap id: ' + id));
  }
  getPresentation(data.snaps[id], cb);
}

function markSnapAsSeen(id, cb) {
  var data = getData();
  if (!data.snaps[id]) {
    return cb(null);
  }
  getPresentation(data.snaps[id], function(err, pres) {
    pres.data.snaps[id].seen = true;
    pres.save(cb);
  });
  delete data.snaps[id];
  setData(data);
}

module.exports = {
  createPresentation: createPresentation,
  getPresentation: getPresentation,
  getPresentationForSnap: getPresentationForSnap,
  markSnapAsSeen: markSnapAsSeen,
};
