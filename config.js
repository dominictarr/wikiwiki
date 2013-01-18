
var join     = require('path').join
var Document = require('./document')

//used by map-reduce
function parse (s) {
  try {
    return JSON.parse(s)
  } catch (_) {
    return []
  }
}

module.exports = {
  db: 'wikiwiki',
  schema: {
    doc: function () {
      return Document()
    }
  },
  views: [{
    name: 'latest10',
    map: function (key, value) {
      var name = (value.name || 'no_name').replace('doc-', '')
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
  }]
}

