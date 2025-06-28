module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated plugin (should be last)
      'react-native-reanimated/plugin',
      // Support for optional chaining and nullish coalescing
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      // Support for class properties
      '@babel/plugin-proposal-class-properties',
      // Support for decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Support for async/await
      '@babel/plugin-transform-async-to-generator',
      // Support for spread operator
      '@babel/plugin-proposal-object-rest-spread',
    ],
    env: {
      production: {
        plugins: [
          // Remove console.log in production
          'transform-remove-console',
          // Optimize imports
          ['babel-plugin-transform-imports', {
            'react-native-vector-icons': {
              'transform': 'react-native-vector-icons/dist/${member}',
              'transformMember': 'kebabCase',
              'style': 'kebabCase',
              'skipDefaultConversion': true
            }
          }]
        ]
      }
    }
  };
};

