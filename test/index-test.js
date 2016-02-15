import { join } from 'path';
import { writeFileSync } from 'fs';

import expect from 'expect';
import dora from 'dora';
import sinon from 'sinon';

const oldCwd = process.cwd();
const expects = join(oldCwd, 'test/expect');
const fixtures = join(oldCwd, 'test/fixtures');

describe('index - get config in plugin', () => {
  before(done => {
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

  it('get custom _global_', done => {
    dora({
      port: 12347,
      plugins: ['../../src/index.js?path=./not-change-extend/config.js|x-y', {
        'middleware.after': function after() {
          const { get } = this;
          expect(get('_global_x')).toEqual({
            a: 'hello',
          });
          expect(get('_global_y')).toEqual({
            b: 'world',
          });
          expect(get('_global_xxxx')).toBe(undefined);
        },
      }],
      cwd: fixtures,
      verbose: true,
    }, done);
  });

  it('get _global_config', done => {
    dora({
      port: 12348,
      plugins: ['../../src/index.js?path=./not-change-extend/config.js', {
        'middleware.after': function after() {
          const { get } = this;
          expect(get('_global_config')).toEqual(
            require(join(expects, './not-change-extend/config.js'))
          );
        },
      }],
      cwd: fixtures,
      verbose: true,
    }, done);
  });

  it('get event trigger', function ev(done) {
    this.timeout(5000);
    const spy = sinon.spy();
    dora({
      port: 12349,
      plugins: ['../../src/index.js?path=./change-extend/change.config.js', {
        'server.after': function after() {
          const { get } = this;
          const configManagerEmitter = get('configManagerEmitter');
          configManagerEmitter.on('_global_config', spy);
        },
      }],
      cwd: fixtures,
      verbose: true,
    });

    setTimeout(() => {
      const randomNum = Math.floor(Math.random() * 1.0e6);
      writeFileSync(
        join(fixtures, './change-extend/extend.config.js'),
        `var extend = {ooxx: ${randomNum}};module.exports = extend;`,
        'utf-8'
      );
    }, 1000);
    setTimeout(() => {
      expect(spy.called).toEqual(true);
      done();
    }, 2000);
  });
});
