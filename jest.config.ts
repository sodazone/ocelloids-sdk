import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/js-with-ts-esm',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  testMatch: [ "<rootDir>/src/**/?(*.)+(spec|test).[jt]s" ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
}

export default jestConfig