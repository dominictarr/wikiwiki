
var join     = require('path').join
var config   = require('./config')

var Document = require('./document')

var fs = require('fs')
var indexHtml = fs.readFileSync(__dirname + '/static/index.html')

function parse (s) {
  try {
    return JSON.parse(s)
  } catch (_) {
    return []
  }
}

require('rumours/server')({
  name: 'wikiwiki',
  root:'/tmp/wikiwiki',
  schema: require('./schema'),
  static: './static',
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
}).listen(3000, function () {
  console.log('listening on 3000')
})

