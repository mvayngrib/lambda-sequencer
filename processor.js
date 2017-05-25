const wrap = require('./wrap')

exports.handler = wrap.sync(function (event, context) {
  console.log('hopefully in-order event', JSON.stringify(event, null, 2))
})
