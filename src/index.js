import { isExistedAFile, getCfg, getPathKeyPair, getRealKey } from './util';
import cdeps from './cdeps';
import EventEmitter from 'events';
import isEqual from 'lodash.isequal';

const changeEmitter = new EventEmitter();
let cache;
let timer;

function loadFile(watchKeys, configFile, get, set) {
  const depList = cdeps(configFile);
  depList.forEach(dep => delete require.cache[require.resolve(dep)]);
  cache = require(configFile);
  watchKeys.forEach(_key => {
    const key = getRealKey(_key);

    if ((key !== '_global_config' && !isEqual(cache[key], get(key)))
      || (key === '_global_config' && !isEqual(cache, get(key)))) {
      const value = key === '_global_config' ? cache : cache[key];
      set(`${_key}`, value);
      changeEmitter.emit(_key);
    }
  });
}

export default {
  'middleware.before'() {
    const { log, query, set, get } = this;

    const clearCacheDelay = query.watchDelay || 300;
    const cwd = process.cwd();
    const pathTrial = query.path;
    const pathKeyPair = getPathKeyPair(cwd, pathTrial);
    if (!isExistedAFile(pathKeyPair.path)) {
      log.debug(`${pathKeyPair.path} is not existed`);

      return;
    }

    const config = getCfg(pathKeyPair);
    Object.keys(config).forEach((_key) => {
      const key = _key;
      const value = config[key];
      set(`${key}`, value);
    });
    if (timer) clearTimeout(timer);
    timer = setInterval(loadFile(Object.keys(config), pathKeyPair.path, get, set), clearCacheDelay);
  },
};
