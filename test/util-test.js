import { isExistedAFile, getCfg, getPathKeyPair, getRealKey, isReservedWord } from '../src/util';
import { join } from 'path';
import expect from 'expect';

const oldCwd = process.cwd();
const expects = join(oldCwd, 'test/expect');
const fixtures = join(oldCwd, 'test/fixtures');

describe('util', () => {
  before((done) => {
    process.chdir(fixtures);
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
    const queryWithKey = './config.js|a-b-x';
    expect(getPathKeyPair(fixtures, queryWithKey)).toEqual({
      path: join(fixtures, './config.js'),
      keys: ['a', 'b', 'x'],
    });

    const queryWithoutKey = './config.js';
    expect(getPathKeyPair(fixtures, queryWithoutKey)).toEqual({
      path: join(fixtures, './config.js'),
      keys: [],
    });
  });

  it('getCfg', () => {
    const queryWithKey = './config.js|a-b-x';
    const withKey = getPathKeyPair(fixtures, queryWithKey);
    expect(getCfg(withKey)).toEqual({
      _global_a: true,
      _global_b: 'hello',
    });
    const queryWithoutKey = './config.js';
    const withoutKey = getPathKeyPair(fixtures, queryWithoutKey);
    const obj = {
      _global_config: require(join(expects, './config.js')),
    };
    expect(getCfg(withoutKey)).toEqual(obj);
  });
});
