
var shoe     = require('shoe')
var ecstatic = require('ecstatic')
var http     = require('http')
var join     = require('path').join
var reloader = require('client-reloader')
var stack    = require('stack')
var SbServer = require('./scuttlebutt-server')
var config   = require('./config')

var Document = require('./document')

var udid = require('udid')('wikiwiki')

var fs = require('fs')
var indexHtml = fs.readFileSync(__dirname + '/static/index.html')

require('./db')(function (err, db) {

  shoe(reloader(function (stream) {

    console.log('connection')
    //echo server
    stream.pipe(SbServer(db)).pipe(stream)

  })).install(http.createServer(
    stack(
      ecstatic(join(__dirname, 'static')),
      //send the index page for any url - then the client opens the right scuttlebutt doc.
      function (_, res) {
        res.end(indexHtml)
      }
    )
  ).listen(config.port, function () {
    console.log( 'listening on', config.port)
  }), '/shoe')
  
})
