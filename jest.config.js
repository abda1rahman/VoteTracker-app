/** @type {import('ts-jest').JestConfigWithTsJest} */
const baseTestDir = '<rootDir>/src/test/**/*.test.ts'
module.exports = {

  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [`${baseTestDir}`],
};