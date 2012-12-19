var Scuttlebucket = require('scuttlebucket')
var REdit = require('r-edit')
var Model = require('scuttlebutt/model')

var udid = require('./udid')

module.exports = function (name) {
  var m = new Scuttlebucket(udid)
  m .add('meta', m.meta = new Model())
    .add('text', m.text = new REdit())
  return m
}
