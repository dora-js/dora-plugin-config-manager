var config = {};
config.x = {
  a: 'hello'
}

config.y = {
  b: 'world'
}
config.extend = require('./extend.config');
module.exports = config;