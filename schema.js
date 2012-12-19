var Document = require('./document')
var schema   = require('scuttlebutt-schema')

module.exports = schema({
  doc: function () {
    return Document()
  }
})
