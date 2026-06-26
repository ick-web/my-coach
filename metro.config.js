const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const wsNoop = path.resolve(__dirname, 'src/lib/ws-noop.js');

// Intercept ws and all its internal modules — ws is Node-only, React Native has native WebSocket
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws' || moduleName.startsWith('ws/')) {
    return { filePath: wsNoop, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
