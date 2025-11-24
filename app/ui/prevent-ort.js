// prevent-ort.js
// This file is preloaded into Node (via NODE_OPTIONS --require).
// It creates harmless stubs for packages that would otherwise load native ONNX bindings.

console.log('[prevent-ort.js] ✅ PRELOAD SCRIPT EXECUTING - Stubbing ONNX packages...');

function stubModule(moduleName) {
  try {
    // If already resolved, replace its exports
    const resolved = require.resolve(moduleName);
    if (require.cache[resolved]) {
      require.cache[resolved].exports = {};
    } else {
      // Create a synthetic module entry in require.cache
      const m = new module.constructor();
      m.filename = moduleName;
      m.id = moduleName;
      m.exports = {};
      require.cache[moduleName] = m;
    }
  } catch (e) {
    // If resolve fails, inject a cache entry anyway
    const m = new module.constructor();
    m.filename = moduleName;
    m.id = moduleName;
    m.exports = {};
    require.cache[moduleName] = m;
  }
}

// List modules to stub to prevent ONNX native initialization.
// Add any other package names you suspect.
const modulesToStub = [
  "onnxruntime-node",
  "onnxruntime",
  "@xenova/transformers",
  "onnxruntime-node-gpu",
];

for (const name of modulesToStub) {
  try {
    stubModule(name);
    console.log(`[prevent-ort.js] ✅ Stubbed: ${name}`);
    // also provide a fallback global marker
    global.__STUBBED_MODULES__ = global.__STUBBED_MODULES__ || {};
    global.__STUBBED_MODULES__[name] = true;
  } catch (err) {
    console.log(`[prevent-ort.js] ⚠️ Failed to stub ${name}:`, err.message);
  }
}
