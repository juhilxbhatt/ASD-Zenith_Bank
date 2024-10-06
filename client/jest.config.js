module.exports = {
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    testMatch: ['<rootDir>/src/tests/**/*.test.{js,jsx,ts,tsx}'],
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
  };  