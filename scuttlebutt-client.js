
var MuxDemux = require('mux-demux')

/*
other tricky thing here...

when running on client, the client needs to check whether it is the central db or not,
if the first tab closes, it needs to connect straight to the database.

so, simplest, is just connect the databases together, and connect the scuttlebutt to that by streams.
May also want to replicate per document.

otherwise, connect through the stream.

... this will mean reconnecting the live scuttlebutts when the first tab closes?

so, the real thing here is to decide whether you are the leader or not.

and to transit from leader to follower gracefully...
hmm, so I kinda want to be able to reconnect a live scuttlebutt too,
rather than just open a scuttlebutt...

like, pass a scuttlebutt into open(sb)
hmm, so, this means a good way to track the scuttlebutts that are in use.
what about:

// return an identical instance, which is in sync with original. (streamed together)
`var b = a.clone()`

Then dispose of `b` by calling `b.dispose()`.
That will deregister all listeners & streams,
but leave `a` connected to whatever it was connected to.

Keep `a` alive while there are living clones.
Also... make open(a.name) clone a if a is already opened.

----------------------------------------------

So, autonode emits 'listening' if you are the leader (server),
and 'connecting' if you are the follower (client)

On 'listening' open the database, and serve connections?
cancelling that operation if you are not the leader?

on('listening',...)
open database, connect all open scuttlebutts to the db.
connect the db to the home server... (with reconnect)

on 'connecting', when connected, connect any open scuttlebutts to the server.
(if you are the server, just attach the server stream [mx])

or -- lazily open database when someone connects, or opens a document?

what about when the server closes?
and then you become the server?
the server closes, that breaks all the client streams,
so, you start listening, open the database,
and then connect all the open scuttlebutts to the db.
if the server errors or you tell it to stop,
THEN you must dispose of the database...

The client/server it self, should present the same api to user,
whether it is the client or the server.

open(name, cb)

view(name, range...)

put, del, get etc?

these commands should just get deferred when the database is not open, or not connected to the server...
*/

module.exports = function (schema) {

  var mx = MuxDemux()

  var open = 
    require('scuttlebutt-schema')
      .open(schema,
        function (name) {
          return mx.createStream(''+name) //force to string.
        })

  function view (name, opts) {
    var args = [].slice.call(arguments)
    
    //enhance this to match api of server levelup...
    //and maybe ... wrap reconnect... abstract out reloading
    //so that it is more like having the database local.

    return mx.createStream(args)
  }

  mx.open = open
  mx.view = view

  return mx
}
