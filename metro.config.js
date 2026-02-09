const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');

// Agregar polyfill para Buffer
config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

module.exports = config;