var renderWidget = require('r-edit/widget')

var h = require('h')

//config code, schema, etc used on CLIENT and SERVER
var client = require('rumours')(require('./config'))

var content, textarea, recent, title

function replace (el, withEl) {
  el.parentElement.replaceChild(withEl, el)
  return withEl
}

function get(el) {
  if('string' === typeof el)
    return document.getElementById(el)
  return el
}

function toggle (label, checked, element) {
  var input
  function change () {
    var el = get(element)
    el && el.style.setProperty('display', input.checked ? 'block' : 'none')
  }
  return h('div.toggelable', label, 
    {style: {display: 'inline-block'}},
    input = h('input', {
      type: 'checkbox', 
      change: change,
      checked: checked
    })
  )
}

document.body.appendChild(
  h('div#content', 
    client.widget(),
    recent = h('div'),
    title = h('h1'),
    h('div#text', 
      //edit text...
      h('div', toggle('editor',  true, 'edit_container')),
      h('div#edit_container',
        {style: {float: 'left'}},
        textarea = h('textarea', {rows: 32, cols: 80})
      ),
      h('div#render_container', render = h('div'))
    )
  )
)

//display recent documents...

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

//display current document.

var doc
function openDoc () {
  //get document name from the location hash. 
  var name = window.location.hash.substring(1) || 'hello'

  //remove old doc from memory...
  if(doc) doc.dispose() 

  client.open('doc-'+name, function (_, _doc) {
    doc = _doc

    var _textarea = h('textarea#ta', {rows: 32, cols: 80})
    doc.text.wrap(_textarea)
    
    textarea = replace(textarea, _textarea)
    render   = replace(render, renderWidget(doc.text))
    title.innerText = doc.name.replace('doc-', '')
  })
}

window.addEventListener('hashchange', openDoc)
openDoc()

