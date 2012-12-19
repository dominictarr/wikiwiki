
var shoe     = require('shoe')
var ecstatic = require('ecstatic')
var http     = require('http')
var join     = require('path').join
var reloader = require('client-reloader')
var stack    = require('stack')
var MuxDemux = require('mux-demux')
var through  = require('through')

var Document = require('./document')

var PORT     = 3000

var udid = require('udid')('wikiwiki')
//var edit = require('r-edit')(udid)
var fs = require('fs')
var indexHtml = fs.readFileSync(__dirname + '/static/index.html')

require('./db')(function (err, db) {

  shoe(reloader(function (stream) {

    console.log('connection')
    //echo server
    var mx = MuxDemux(function (stream) {
      if('string' === typeof stream.meta) {

        var name = stream.meta.replace(/^doc-/, '')
        var ts = through().pause()
        stream.pipe(ts)

        db.scuttlebutt(stream.meta, function (err, doc) {
          if(doc.meta.get('name') != name) {
            doc.meta.set('name', name)
          }

          ts.pipe(doc.createStream()).pipe(stream)
          ts.resume()
        })
      } else if(Array.isArray(stream.meta)) {
        db.mapReduce
          .view('latest10', stream.meta)
          .pipe(through(function (data) {
            this.queue(JSON.parse(data.value))
          }))
          .pipe(stream)
      }
    })

    stream.pipe(mx).pipe(stream)

  })).install(http.createServer(
    stack(
      ecstatic(join(__dirname, 'static')),
      function (_, res) {
        res.end(indexHtml)
      }
    )
  ).listen(PORT, function () {
    console.log( 'listening on', PORT)
  }), '/shoe')
  
})
