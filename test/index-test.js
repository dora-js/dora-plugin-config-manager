import { join } from 'path';
import expect from 'expect';
import dora from 'dora';

const oldCwd = process.cwd();
const expects = join(oldCwd, 'test/expect');
const fixtures = join(oldCwd, 'test/fixtures');

describe('index - get config in plugin', () => {
  before(done => {
    process.chdir(fixtures);
    done();
  });

  after(done => {
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

  it('get _global_config', (done) => {
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
});
