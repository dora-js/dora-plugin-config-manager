import { isExistedAFile, getCfg, getPathKeyPair,
  getRealKey, isReservedWord, getChangedPairsAndCache, setAndEmitter } from '../src/util';
import { join } from 'path';
import { writeFileSync } from 'fs';
import expect from 'expect';
import sinon from 'sinon';

const oldCwd = process.cwd();
const expects = join(oldCwd, 'test/expect');
const fixtures = join(oldCwd, 'test/fixtures');
const cache = {};

describe('util', () => {
  before((done) => {
    process.chdir(fixtures);
    done();
  });

  after(done => {
    writeFileSync(
      join(fixtures, './change-extend/extend.config.js'),
      'var extend = {ooxx: 1};module.exports = extend;',
      'utf-8'
    );
    process.chdir(oldCwd);
    done();
  });

  it('isExistedAFile', () => {
    const notExistFilePath = join(fixtures, 'notExistFile.js');
    const existDirPath = join(fixtures, 'dir-test');
    const existFile = join(fixtures, 'package.json');
    expect(isExistedAFile(notExistFilePath)).toBe(false);
    expect(isExistedAFile(existDirPath)).toBe(false);
    expect(isExistedAFile(existFile)).toBe(true);
  });

  it('getReal', () => {
    expect(getRealKey('_global_config')).toEqual('_global_config');
    expect(getRealKey('_global_a')).toEqual('a');
  });

  it('isReservedWord', () => {
    expect(isReservedWord).withArgs('config').toThrow(/reserved/);
  });

  it('getPathKeyPair', () => {
    const queryWithKey = './not-change-extend/config.js|a-b-x';
    expect(getPathKeyPair(fixtures, queryWithKey)).toEqual({
      path: join(fixtures, './not-change-extend/config.js'),
      keys: ['a', 'b', 'x'],
    });

    const queryWithoutKey = './not-change-extend/config.js';
    expect(getPathKeyPair(fixtures, queryWithoutKey)).toEqual({
      path: join(fixtures, './not-change-extend/config.js'),
      keys: [],
    });
  });

  it('getCfg', () => {
    const queryWithKey = './not-change-extend/config.js|x-o';
    const withKey = getPathKeyPair(fixtures, queryWithKey);
    expect(getCfg(withKey)).toEqual({
      _global_x: {
        a: 'hello',
      },
    });
    const queryWithoutKey = './not-change-extend/config.js';
    const withoutKey = getPathKeyPair(fixtures, queryWithoutKey);
    const obj = {
      _global_config: require(join(expects, './not-change-extend/config.js')),
    };
    expect(getCfg(withoutKey)).toEqual(obj);
  });

  it('getChangedPairs', done => {
    const configFilePath = join(fixtures, './change-extend/change.config');
    const randomNum = Math.floor(Math.random() * 1.0e6);
    const watchKeys = ['_global_extend'];
    writeFileSync(
      join(fixtures, './change-extend/extend.config.js'),
      `var extend = {ooxx: ${randomNum}};module.exports = extend;`,
      'utf-8'
    );
    const changedPairsAndCache = getChangedPairsAndCache(cache, watchKeys, configFilePath);
    expect(changedPairsAndCache).toEqual({
      cacheNow: {
        extend: {
          ooxx: randomNum,
        },
        x: {
          a: 'hello',
        },
        y: {
          b: 'world',
        },
      },
      changedPairs: [{
        globalKey: '_global_extend',
        value: {
          ooxx: randomNum,
        },
      }],
    });
    done();
  });

  it('set', () => {
    const changedPairs = [{
      globalKey: '_global_extend',
      value: {
        ooxx: '123456789',
      },
    }];
    function set(key, value) {
      global[key] = value;
    }
    const spy = sinon.spy();
    global.configManagerEmitter.on('_global_extend', spy);
    setAndEmitter(changedPairs, global.configManagerEmitter, set);
    expect(spy.called).toEqual(true);
  });
});
