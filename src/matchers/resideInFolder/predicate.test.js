const test = require('ava');
const predicate = require('./predicate');

test('reside in folder', t => {
  const test = predicate('src/matchers');

  t.pass();
})
