// rollup.config.js
const typescript = require("@rollup/plugin-typescript");
const nodeResolve = require("@rollup/plugin-node-resolve");
const commonJs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");

const entryPoints = ["src/api/api-handler.ts", "src/tx-outbox/tx-outbox-handler.ts"];
const configs = entryPoints.map((entryPoint) => ({
  input: entryPoint,
  output: {
    dir: "dist",
    format: "cjs",
    sourcemap: true,
    globals: {crypto: 'crypto'},
  },
  external: ['crypto'],
  plugins: [typescript(), commonJs(), nodeResolve({ preferBuiltins: true }), json()],
}));
module.exports = configs;
