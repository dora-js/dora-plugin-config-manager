import { isExistedAFile, getCfg, getPathKeyPair,
  getChangedPairsAndCache, setAndEmitter } from './util';
import EventEmitter from 'events';

const changeEmitter = new EventEmitter();
let timer;
let cache = '';

function fileChangedTriggerEvent(watchKeys, configFilePath, set) {
  const { changedPairs, cacheNow } = getChangedPairsAndCache(cache, watchKeys, configFilePath);
  if (changedPairs.length) {
    setAndEmitter(changedPairs, changeEmitter, set);
  }
  cache = cacheNow;
}

export default {
  'middleware.before'() {
    const { log, query, set } = this;

    set('configManagerEmitter', changeEmitter);
    global.configManagerEmitter = changeEmitter;

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
    timer = setInterval(
      fileChangedTriggerEvent(Object.keys(config), pathKeyPair.path, set),
      clearCacheDelay
    );
  },
};
