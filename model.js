var fs = require('fs.extra');
var crypto = require('crypto');

var pg = require('pg');
var DB_URL = 'postgres://snapppt:x8PSrT6Zvpq8@localhost/snapppt';

function db(cb) {
  return pg.connect(DB_URL, cb);
}

var DATA_DIR = './data/'; // with trailing slash

fs.mkdirp(DATA_DIR, function(err) {
  if (err) {
    throw err;
  }
});

function createID(cb) {
  crypto.randomBytes(16, function(err, buf) {
    if (err) {
      return cb(err);
    }
    var id = buf.toString('base64').replace('/', '-', 'g').slice(0, -2);
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

        db(function(err, client, done) {
          if(err) {
            return cb(err);
          }

          client.query('insert into deck (name) values ($1) RETURNING id;', [id], function(err, result) {
            if (err) {
              done();
              return cb(err);
            }

            var deck_id = result.rows[0].id;
            var values = [];
            files.forEach(function(file, i) {
              values.push(i);
              values.push(deck_id);
              values.push(datadir + '/' + file);
            });
            var query = 'insert into slide (num, deck_id, data_path) values ' + placeholder(3, files.length) + ';';
            client.query(query, values, function(err) {
              done();
              if (err) {
                return cb(err);
              }
              cb(null, id);
            });
          });
        });
      });
    });
  });
}

function placeholder(cols, rows, n) {
  n = n || 1;
  rows = rows || 1;

  var placeholders = [];
  for(var i=0; i < rows; ++i) {
    var c = [];
    for(var j=0; j < cols; ++j) {
      c.push('$' + n);
      ++n;
    }
    placeholders.push('(' + c.join(',') + ')');
  }
  return placeholders.join(',');
}

function createSnap(deck_name, cb) {
  createID(function(err, snap_name) {
    if (err) {
      return cb(err);
    }

    db(function(err, client, done) {
      if(err) {
        return cb(err);
      }
      client.query('select deck.id as deck_id, slide.id as slide_id ' +
                   ' from deck, slide where deck.name = $1 ' +
                   ' and deck.id = slide.deck_id',
                   [deck_name], function(err, result) {
        if(err) {
          done();
          return cb(err);
        }
        var slides = result.rows;
        var deck_id = result.rows[0].deck_id;

        client.query('insert into snap (name, deck_id) values ($1, $2) RETURNING id;',
                     [snap_name, deck_id], function(err, result) {
          if(err) {
            done();
            return cb(err);
          }
          var snap_id = result.rows[0].id;

          var values = [];
          slides.forEach(function(slide) {
            values.push(snap_id);
            values.push(slide.slide_id);
          });

          var query = 'insert into snap_slide (snap_id, slide_id) values ' + placeholder(2, slides.length);
          client.query(query, values, function(err) {
            done();
            if (err) {
              return cb(err);
            }
            cb(null, snap_id);
          });
        });
      });
    });
  });
}

function getSnapsForDeck(deck_name, cb) {
  db(function(err, client, done) {
    if(err) {
      return cb(err);
    }
    client.query('select snap.name as name, ' +
                 ' sum(cast(snap_slide.seen as int))/count(*) as seen_ratio ' +
                 ' from deck, snap, snap_slide where deck.name = $1 and ' +
                 ' snap.deck_id = deck.id and snap_slide.snap_id = snap.id ' +
                 ' group by snap.id order by snap.id desc',
                 [deck_name], function(err, result) {
      done();
      if(err) {
        return cb(err);
      }
      cb(null, result.rows);
    });
  });
}

function getNumSlides(snap_name, cb) {
  db(function(err, client, done) {
    if(err) {
      return cb(err);
    }
    client.query('select count(*) as count, ' +
                 ' sum(cast(snap_slide.seen as int)) as seen ' +
                 ' from snap, snap_slide where snap_slide.snap_id = snap.id ' +
                 ' and snap.name = $1',
                 [snap_name], function(err, result) {
      done();
      if(err) {
        return cb(err);
      }
      var seen = result.rows[0].seen;
      var count = result.rows[0].count;
      if (seen != 0) {
        return cb(new Error('Some slides were already seen!'));
      }
      cb(null, count - 0);
    });
  });
}

function viewSnap(snap_name, n, cb) {
  db(function(err, client, done) {
    if(err) {
      return cb(err);
    }
    client.query('update snap_slide set seen=true from snap, slide ' +
                 ' where snap.id = snap_slide.snap_id and snap.name = $1 ' +
                 ' and snap_slide.slide_id=slide.id and slide.num = $2 ' +
                 ' and snap_slide.seen=false returning slide.data_path',
                 [snap_name, n], function(err, result) {
      done();
      if(err) {
        return cb(err);
      }
      if (result.rows.length === 0) {
        return cb(new Error('Not found!'));
      }
      var filepath = result.rows[0].data_path;
      fs.readFile(filepath, function(err, data) {
        if(err) {
          return cb(err);
        }
        cb(null, data);
      });
    });
  });
}



module.exports = {
  createPresentation: createPresentation,
  createSnap: createSnap,
  getSnapsForDeck: getSnapsForDeck,
  getNumSlides: getNumSlides,
  viewSnap: viewSnap,
};
