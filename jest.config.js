module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    "transform": {
      ".(ts|tsx)": "<rootDir>/node_modules/ts-jest/preprocessor.js"
    },
    "testRegex": "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    testEnvironment: 'node',
    testRunner: 'jest-circus/runner',
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    verbose: true,
    collectCoverage: true,
    coverageReporters: ["json", "html"],
    setupFilesAfterEnv: ['./jest.setup.js']
  }