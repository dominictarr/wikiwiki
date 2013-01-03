var MuxDemux = require('mux-demux')
var through  = require('through')

//create a server that can wrap a leveldb.
//this assumes that the db already has scuttlebutt installed.


//COMBINE into one stream object...
module.exports = function (schema) {

  var db = 'function' === typeof schema ? null : schema

  var mx = MuxDemux(function (stream) {
    if(!db) return stream.error('cannot access database this end')
    if('string' === typeof stream.meta) {
      var name = stream.meta.replace(/^doc-/, '')
      var ts = through().pause()
      stream.pipe(ts)
      //load the scuttlebutt with the callback,
      //and then connect the stream to the client
      //so that the 'sync' event fires the right time,
      //and the open method works on the client too.
      db.scuttlebutt(stream.meta, function (err, doc) {
        ts.pipe(doc.createStream()).pipe(stream)
        ts.resume()
      })
    } else if(Array.isArray(stream.meta)) {
      //reduce the 10 most recently modified documents.
      db.mapReduce.view.apply(db.mapReduce.view, stream.meta)
        .pipe(through(function (data) {
          this.queue(JSON.parse(data.value))
        }))
        .pipe(stream)
    }
  })

  var clientOpen = 
    require('scuttlebutt-schema')
      .open(schema,
        function (name) {
          return mx.createStream(''+name) //force to string.
        })

  function clientView (name, opts) {
    var args = [].slice.call(arguments)
    
    //enhance this to match api of server levelup...
    //and maybe ... wrap reconnect... abstract out reloading
    //so that it is more like having the database local.

    return mx.createStream(args)
  }

  mx.open = function (name, cb) {
    return db ? db.scuttlebutt.open(name, cb) : clientOpen(name, cb)
  }
  mx.view = function () {
    var view = db && db.scuttlebutt.view
    return db ? view.apply(view, arguments) : clientView.apply(null, arguments)
  }

  return mx
}
/*
module.exports = function (db) {
  var mx = MuxDemux(function (stream) {
    if('string' === typeof stream.meta) {
      var name = stream.meta.replace(/^doc-/, '')
      var ts = through().pause()
      stream.pipe(ts)
      //load the scuttlebutt with the callback,
      //and then connect the stream to the client
      //so that the 'sync' event fires the right time,
      //and the open method works on the client too.
      db.scuttlebutt(stream.meta, function (err, doc) {
        ts.pipe(doc.createStream()).pipe(stream)
        ts.resume()
      })
    } else if(Array.isArray(stream.meta)) {
      //reduce the 10 most recently modified documents.
      db.mapReduce.view.apply(db.mapReduce.view, stream.meta)
        .pipe(through(function (data) {
          this.queue(JSON.parse(data.value))
        }))
        .pipe(stream)
    }
  })
  return mx
}*/

