/** @type {import('ts-jest').JestConfigWithTsJest} */
const base = require("../../../jest.config.base.js");
base.testRegex = "int\\.spec\\.ts$" 
module.exports = base