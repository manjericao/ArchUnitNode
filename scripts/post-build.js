#!/usr/bin/env node

/**
 * Post-build script to create ESM bundle
 * This script creates an ES module version from the CommonJS build
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const esmDir = path.join(distDir, 'esm');
const indexJs = path.join(distDir, 'index.js');
const indexMjs = path.join(distDir, 'index.mjs');

console.log('📦 Post-build: Creating ESM bundle...');

// Check if dist/index.js exists
if (!fs.existsSync(indexJs)) {
  console.error('❌ Error: dist/index.js not found. Build TypeScript first.');
  process.exit(1);
}

try {
  // Read the CommonJS bundle
  let content = fs.readFileSync(indexJs, 'utf8');

  // Simple transformation: convert require/module.exports to ESM
  // For a more robust solution, consider using a bundler like rollup
  // This is a basic approach that works for simple cases

  // Replace module.exports with export
  content = content.replace(/module\.exports\s*=/g, 'export default');
  content = content.replace(/exports\./g, 'export ');

  // Write the ESM version
  fs.writeFileSync(indexMjs, content, 'utf8');

  console.log('✅ ESM bundle created successfully!');
  console.log(`   Generated: ${indexMjs}`);

  // Log file sizes
  const cjsSize = (fs.statSync(indexJs).size / 1024).toFixed(2);
  const esmSize = (fs.statSync(indexMjs).size / 1024).toFixed(2);

  console.log(`   CommonJS: ${cjsSize} KB`);
  console.log(`   ESM: ${esmSize} KB`);

} catch (error) {
  console.error('❌ Error creating ESM bundle:', error.message);
  process.exit(1);
}

console.log('✨ Post-build complete!');
