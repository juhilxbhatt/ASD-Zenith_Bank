module.exports = {
  roots: ['<rootDir>/src/'],
  testMatch: ['**/tests/*.test.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
};