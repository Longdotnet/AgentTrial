import assert from "node:assert/strict";
import test from "node:test";

import { isSupportedNodeVersion, nodeMajor } from "../../src/runtime/node-version.js";

test("node version parser accepts prefixed and plain versions", () => {
  assert.equal(nodeMajor("v24.19.0"), 24);
  assert.equal(nodeMajor("24.0.0"), 24);
});

test("real-agent support begins at Node 24", () => {
  assert.equal(isSupportedNodeVersion("v22.14.0"), false);
  assert.equal(isSupportedNodeVersion("v23.11.1"), false);
  assert.equal(isSupportedNodeVersion("v24.0.0"), true);
  assert.equal(isSupportedNodeVersion("v25.1.0"), true);
  assert.equal(isSupportedNodeVersion("not-a-version"), false);
});
