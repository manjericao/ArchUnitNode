const importAll = require('import-all.macro');

const imports = importAll.sync('./*/index.js');

module.exports = Object.keys(imports)
  .map(key => imports[key])
  .reduce((acc, matcher) => ({ ...acc, ...matcher.default }), {});
