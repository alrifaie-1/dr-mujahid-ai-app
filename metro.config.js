const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add support for certificate templates
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Add support for audio files
  'mp3',
  'wav',
  'aac',
  // Add support for video files
  'mp4',
  'mov',
  'avi'
);

// Add support for JSZip and other Node.js modules
config.resolver.alias = {
  ...config.resolver.alias,
  'crypto': require.resolve('expo-crypto'),
  'stream': require.resolve('readable-stream'),
  'buffer': require.resolve('buffer'),
};

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Optimize for production builds
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;

