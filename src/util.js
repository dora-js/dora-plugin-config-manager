import { join } from 'path';
import { statSync } from 'fs';
import log from 'spm-log';
import cdeps from './cdeps';
import isEqual from 'lodash.isequal';

export function isExistedAFile(path) {
  let isAFile = false;
  try {
    if (statSync(path).isFile()) {
      isAFile = true;
    }
  } catch (err) {
    log.debug('error', `${path} is not exist`);
  }

  return isAFile;
}

export function getCfg({ path, keys }) {
  const cfg = require(path);
  if (keys.length) {
    return keys.reduce((_prev, _key) => {
      const prev = _prev;
      const key = _key;
      if (cfg.hasOwnProperty(key)) prev[`_global_${key}`] = cfg[key];

      return prev;
    }, {});
  }
  const baseName = 'config';
  return {
    [`_global_${baseName}`]: cfg,
  };
}

export function isReservedWord(key) {
  if (key.indexOf('config') > -1) throw new Error('config is reserved word!');
}

export function getPathKeyPair(cwd, pathTrail) {
  let path = '';
  let keys = [];
  if (pathTrail.indexOf('|') > 0) {
    path = join(cwd, pathTrail.split('|')[0]);
    keys = pathTrail.split('|')[1].split('-');
  } else {
    path = join(cwd, pathTrail);
  }
  isReservedWord(keys);

  return {
    path,
    keys,
  };
}

export function getRealKey(key) {
  if (key.indexOf('_global_config') > -1) {
    return key;
  }

  return key.replace('_global_', '');
}

export function getChangedPairsAndCache(cachePrev, watchKeys, configFilePath) {
  let cache = cachePrev;
  const depList = cdeps(configFilePath);
  depList.forEach(dep => delete require.cache[require.resolve(dep)]);
  const cacheNow = require(configFilePath);
  if (!cache) {
    cache = cacheNow;
  }
  const changedPairs = watchKeys.reduce((prev, globalKey) => {
    const key = getRealKey(globalKey);

    if ((key !== '_global_config' && !isEqual(cacheNow[key], cache[key]))
      || (key === '_global_config' && !isEqual(cacheNow, cache))) {
      const value = key === '_global_config' ? cacheNow : cacheNow[key];

      const changeItem = {
        globalKey,
        value,
      };

      prev.push(changeItem);
      return prev;
    }
    return prev;
  }, []);

  return {
    changedPairs,
    cacheNow,
  };
}

export function setAndEmitter(changedPairs, changeEmitter, set) {
  changedPairs.forEach(changedPair => {
    set(changedPair.globalKey, changedPair.value);
    changeEmitter.emit(`${changedPair.globalKey}`);
  });
}
