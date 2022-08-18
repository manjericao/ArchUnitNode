const detective = require('detective');
const fs = require('fs');
const test = require('ava');

const src = fs.readFileSync(__dirname + '/test.js');

test('foo', t => {
  const requires = detective(src);
  requires.map((req) => {
    console.log(req);
  })
  t.pass();
});
