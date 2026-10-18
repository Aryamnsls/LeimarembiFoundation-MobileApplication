const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'android-native-app/*', 'ios-native-app/*', 'node_modules/*'],
  },
];
