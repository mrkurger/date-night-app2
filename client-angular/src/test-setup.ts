import 'jasmine-core/lib/jasmine-core/jasmine.js';
import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot0.js';
import 'jasmine-core/lib/jasmine-core/boot1.js';

declare global {
  const jasmine: any;
  const describe: Function;
  const it: Function;
  const expect: Function;
  const spyOn: Function;
  const beforeEach: Function;
  const afterEach: Function;
  function fail(error?: Error | string): void;
}
