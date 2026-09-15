module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // zod v4 ships `export * as ns from '...'` syntax that RN's default
  // preset doesn't transform on its own — without this, Metro fails to
  // bundle node_modules/zod with a SyntaxError.
  plugins: ['@babel/plugin-transform-export-namespace-from'],
};
