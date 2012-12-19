var h = require('h')

function get(id) {
  return document.getElementById(id)
}

module.exports = function (model, name) {
  var textarea = h('textarea#ta', {rows: 32, cols: 80})
  model.text.wrap(textarea)
  return h('div.page#content',
    h('h1', name),
    textarea
  )

}
