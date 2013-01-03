var MuxDemux = require('mux-demux')
var through  = require('through')

//create a server that can wrap a leveldb.
//this assumes that the db already has scuttlebutt installed.

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
        /*if(doc.meta.get('name') != name) {
          doc.meta.set('name', name)
        }*/
        ts.pipe(doc.createStream()).pipe(stream)
        ts.resume()
      })
    } else if(Array.isArray(stream.meta)) {
      //reduce the 10 most recently modified documents.
      db.mapReduce.view.apply(db.mapReduce.view, stream.meta)

/*      db.mapReduce
        .view('latest10', stream.meta)
*/
        .pipe(through(function (data) {
          this.queue(JSON.parse(data.value))
        }))
        .pipe(stream)
    }
  })
  return mx
}
