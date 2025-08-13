// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push("cjs");

// 👇 Esta es la línea mágica para que funcione con firebase/auth
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
