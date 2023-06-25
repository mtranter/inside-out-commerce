/** @type {import('ts-jest').JestConfigWithTsJest} */
const base = require("../../../jest.config.base.js");
base.testPathIgnorePatterns = ["/node_modules/", "\\.int\\.spec\\.ts$"];
module.exports = base