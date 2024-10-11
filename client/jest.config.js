module.exports = {
  // Other configurations...
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Transform JavaScript files using Babel
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/', // Transform axios module
  ],
};