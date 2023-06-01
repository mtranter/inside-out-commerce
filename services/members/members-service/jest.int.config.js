/** @type {import('ts-jest').JestConfigWithTsJest} */
const base = require("../../../jest.config.base.js");
base.testRegex = "ispec\\.ts$" 
module.exports = base