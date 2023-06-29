/** @type {import('ts-jest').JestConfigWithTsJest} */

const tsPreset = require('ts-jest/jest-preset')
const jestPreset = require('@shelf/jest-dynamodb/jest-preset')
const base = require("../../../jest.config.base.js");
base.testPathIgnorePatterns = ["\\.int\\.spec\\.ts$", "<rootDir>/node_modules/", "<rootDir>/dist/", "<rootDir>/infra/"];
module.exports = {
    ...base,
    ...tsPreset,
    ...jestPreset,
}