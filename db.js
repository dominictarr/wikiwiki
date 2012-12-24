
var levelup = require('levelup')
var lScuttlebutt = require('level-scuttlebutt')
var udid = require('udid')('wikiwiki')

function parse (s) {
  try {
    return JSON.parse(s)
  } catch (_) {
    return []
  }
}

function setup (db) {

  lScuttlebutt(db, udid, require('./schema'))

  db.scuttlebutt.addMapReduce({
    name: 'latest10',
    map: function (key, value) {
      var name = value.meta.get('name') || 'no_name'
      this.emit([], JSON.stringify({name: name, time: Date.now(), length: value.text.length}))
    },
    reduce: function (big, little) {
      var all = parse(big).concat(parse(little))
      //sort by time, decending.
      all.sort(function (a, b) {
        return b.time - a.time
      })
      //top ten most recent
      var all = all.slice(0, 10)
      return JSON.stringify(all)
    },
    initial: '[]'
  })

//  lScuttlebutt
}

var DB, cbs = []

levelup(process.env.HOME + '/.wikiwiki', {createIfMissing: true}, function (err, db) {
  if(err) throw err
  
  setup(db) 

  DB = db

  cbs.forEach(function (cb) {
    cb(null, DB)
  })

})

module.exports = function (cb) {
  if(DB) cb(null, DB)
  else cbs.push(cb)
}

