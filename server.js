
require('rumours/server')(require('./config'))
  .listen(3000, function () {
    console.log('listening on 3000')
  })

