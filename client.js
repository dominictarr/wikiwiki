var reconnect = require('reconnect')
var reloader  = require('client-reloader')
var page      = require('page')

//var SbClient  = require('./scuttlebutt-client')
var SbClient  = require('./scuttlebutt-remote')

var view      = require('./view')
var schema    = require('./schema')

var udid = require('udid')('wikiwiki')

var h = require('h')
var rWidget

function log() {
  function s (e) {
    return JSON.stringify(e)
  }
  document.body.appendChild(h('pre', [].map.call(arguments, s)))  
}

/*
  Wrap this all into something that decides whether to connect to local db,
  or to stream db owned by other tab, or to stream to server db.

  also, expose liveStream via this interface...
*/

var recent = h('div')
document.body.appendChild(recent)

page('/:name?', function (ctx) {

var name = ctx.params.name

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

var r = reconnect(reloader(function (stream) {
  console.log('connection')
  var client = SbClient(schema)
  stream.pipe(client).pipe(stream)

  client.view('latest10', [])
    .on('data', function (d) {
    recent.innerHTML = ''
    recent.appendChild(h('ul', d.map(function (e) {
        return h('li',
          h('a', {href: '/'+e.name}, e.name, ':', e.time)
        )
      })
    ))
  })

  //create a new item...
  client.open('doc-'+name, function (_, doc) {
    DOC = doc
    
    var content = document.getElementById('content')
    
    if(content)
      document.body.removeChild(content)
    
    document.body.appendChild(view(doc, name))

    stream.once('close', function () {
      doc.dispose()
    })
  })

})).connect('/shoe')

if(!rWidget)
  document.body.appendChild(rWidget = r.widget())

})
page.start()



