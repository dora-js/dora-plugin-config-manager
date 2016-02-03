var x = {
  a: true,
  b: 'hello',
  c: {
    d:1
  },
  e: function(){
    return 'fucntion';
  }
}

var y = {
  a: 2,
  b: 'world',
  c: {
    d:2
  },
  e: function(){
    return 'fucntion';
  }
}
module.exports.extend = require('./extend.config');
module.exports = x;
module.exports.y = y;