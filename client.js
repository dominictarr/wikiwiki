var view      = require('./view')
var schema    = require('./schema')

var h = require('h')

function log() {
  function s (e) {
    return JSON.stringify(e)
  }
  document.body.appendChild(h('pre', [].map.call(arguments, s)))  
}

var recent = h('div')
document.body.appendChild(recent)

//putting this inside of page is wrong actually...
//the pushState and the stream are orthagonal.

var client = require('rumours/client')({
  name: 'wikiwiki', schema: require('./schema')
})

//show a connection status widget...
document.body.appendChild(client.widget())

client.view('latest10', [])
  .on('data', function (d) {
  recent.innerHTML = ''
  recent.appendChild(h('ul', d.map(function (e) {
      return h('li',
        h('a', {href: '/#'+e.name.replace('doc-','')}, e.name, ':', e.time)
      )
    })
  ))
})


//create a new item...
function parseHash () { 
  return window.location.hash.substring(1) || 'hello'
}

var doc

function openDoc () {
  //get document name from the location hash. 
  var name = window.location.hash.substring(1) || 'hello'

  //remove old doc from memory...
  if(doc) doc.dispose() 

  client.open('doc-'+name, function (_, _doc) {
    doc = _doc

    var content = document.getElementById('content')
  
    if(content)
      document.body.removeChild(content)
  
    document.body.appendChild(view(doc, name))
  })
}

window.addEventListener('hashchange', openDoc)

openDoc()

