module.exports = 'node' == process.title 
  ? require('udid')('wikiwiki')  //generate an ID.
  : require('count-tabs')().id   //generate an ID for this tab.

