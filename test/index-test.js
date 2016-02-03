import { writeFileSync } from 'fs';
import { join } from 'path';
import sinon from 'sinon';
import expect from 'expect';
import dora from 'dora';
import EventEmitter from 'events';

const oldCwd = process.cwd();
const expects = join(oldCwd, 'test/expect');
const fixtures = join(oldCwd, 'test/fixtures');

describe('index - get config in plugin', () => {
  before(done => {
    process.chdir(fixtures);
    done();
  });
  it('get custom _global_', done => {
    dora({
      port: 12347,
      plugins: ['../../src/index.js?path=./config.js|a-b', {
        'middleware.after': function after() {
          const { get } = this;
          expect(get('_global_a')).toEqual(true);
          expect(get('_global_b')).toEqual('hello');
          expect(get('_global_xxxx')).toBe(undefined);
        },
      }],
      cwd: fixtures,
      verbose: true,
    }, done);
  });

  it('get _global_config', (done) => {
    dora({
      port: 12348,
      plugins: ['../../src/index.js?path=./config.js', {
        'middleware.after': function after() {
          const { get } = this;
          expect(get('_global_config')).toEqual(require(join(expects, './config.js')));
        },
      }],
      cwd: fixtures,
      verbose: true,
    }, done);
  });
});

describe('index - get eventEmmiter in plugin', () => {
  before(done => {
    process.chdir(fixtures);
    done();
  });
  after(done => {
    writeFileSync(join(fixtures, './extend.config.js'),
      'var extend = {x: 1};module.exports = extend;');
    done();
  });
  it('get emmit _global_extend', (done) => {
    dora({
      port: 12349,
      plugins: ['../../src/index.js?path=./config.js|extend', {
        'middleware.after': function after() {
          const spy = sinon.spy();
          const emitter = new EventEmitter();
          emitter.on('_global_extend', spy);
          writeFileSync(join(fixtures, './extend.config.js'),
            'var extend = {x: 2};module.exports = extend;');
          setTimeout(() => {
            sinon.assert.calledOnce(spy);
          }, 300);
        },
      }],
      cwd: fixtures,
      verbose: true,
    }, done);
  });
});
