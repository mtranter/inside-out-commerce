/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  passWithNoTests: true,
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/", "<rootDir>/test/"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/", "<rootDir>/infra/"],
};