# dora-plugin-config-manager

[![NPM version](https://img.shields.io/npm/v/dora-plugin-config-manager.svg?style=flat)](https://npmjs.org/package/dora-plugin-config-manager)
[![Build Status](https://img.shields.io/travis/dora-js/dora-plugin-config-manager.svg?style=flat)](https://travis-ci.org/dora-js/dora-plugin-config-manager)
[![Coverage Status](https://img.shields.io/coveralls/dora-js/dora-plugin-config-manager.svg?style=flat)](https://coveralls.io/r/dora-js/dora-plugin-config-manager)
[![NPM downloads](http://img.shields.io/npm/dm/dora-plugin-config-manager.svg?style=flat)](https://npmjs.org/package/dora-plugin-config-manager)

dora plugin for config manager。

---

## Usage

```bash
$ npm i dora dora-plugin-config-manager -SD
$ ./node_modules/.bin/dora --plugins 'atool-build,config-manager?path=./config.js|exports-exports&watchDelay=300'
```

## Param - path

It is the path to your global *.config.js file. If you do not specify `exports` would export `default`, otherwise would  export exports which you specify after `|`.

Multiple `exports` please the connector `-` to connect them one by one.

**Note: `config` is the reserved word!**

The `exports` will be seted by  [`Dora.set`](https://github.com/dora-js/dora/blob/master/docs/How-To-Write-A-Dora-Plugin.md#setkey-value)

So you can use the value in other plugins, just by [`Dora.get`](https://github.com/dora-js/dora/blob/master/docs/How-To-Write-A-Dora-Plugin.md#getkey)

If the `exports` named `a` , then the way to get the configure is `this.get('_global_a')`

If you dont use `exports` the `default` configure is under `this.get('_global_config')`

## Param - watchDelay

Your `*.config.js` is alive!

If  `exports` which named `a` e.x. changed during servering. You can receive the event by `event.on('_global_a',callback)`.

## Test

```bash
$ npm test
```

## LICENSE

MIT