/** @type {import('ts-jest').JestConfigWithTsJest} */
const baseTestDir = '<rootDir>/src/test/*auth.test.ts'
module.exports = {

  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [`${baseTestDir}`]
};