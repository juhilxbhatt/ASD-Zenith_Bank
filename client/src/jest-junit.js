const jestJunit = require('jest-junit');

jestJunit({
  outputDirectory: './junit',
  outputName: 'test-results-react.xml'
});