const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb');

config.resolver.extraNodeModules = {
  buffer: require.resolve('buffer/'),
};

config.resolver.sourceExts.push('cjs');

module.exports = config;