const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');

// 1. Patch @expo/cli createDebugMiddleware.js
const expoDebugMiddlewarePath = path.join(
  appRoot,
  'node_modules/@expo/cli/build/src/start/server/metro/debugging/createDebugMiddleware.js'
);

if (fs.existsSync(expoDebugMiddlewarePath)) {
  let content = fs.readFileSync(expoDebugMiddlewarePath, 'utf8');
  if (content.includes('enableStandaloneFuseboxShell: !(0, _env.envIsHeadless)()')) {
    content = content.replace(
      'enableStandaloneFuseboxShell: !(0, _env.envIsHeadless)()',
      'enableStandaloneFuseboxShell: false'
    );
    fs.writeFileSync(expoDebugMiddlewarePath, content, 'utf8');
    console.log('[patch-devtools] Patched @expo/cli createDebugMiddleware.js');
  }
}

// 2. Patch @react-native/debugger-shell to prevent dotslash spawn error on Windows
const debuggerShellPath = path.join(
  appRoot,
  'node_modules/@react-native/debugger-shell/dist/node/index.js'
);

if (fs.existsSync(debuggerShellPath)) {
  let content = fs.readFileSync(debuggerShellPath, 'utf8');
  const target = '} = {}) {\n  try {';
  if (content.includes(target)) {
    content = content.replace(
      target,
      '} = {}) {\n  return { code: "not_implemented" }; // Patched for Windows\n  try {'
    );
    fs.writeFileSync(debuggerShellPath, content, 'utf8');
    console.log('[patch-devtools] Patched @react-native/debugger-shell index.js');
  }
}
