const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

// Configure port for Metro bundler
config.server = {
  port: 8091,
};

module.exports = withNativeWind(config, { input: './global.css' });