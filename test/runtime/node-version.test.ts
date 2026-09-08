import assert from "node:assert/strict";
import test from "node:test";

import { isSupportedNodeVersion, nodeMajor } from "../../src/runtime/node-version.js";

test("node version parser accepts prefixed and plain versions", () => {
  assert.equal(nodeMajor("v24.19.0"), 24);
  assert.equal(nodeMajor("22.0.0"), 22);
});

test("real-agent support begins at Node 22", () => {
  assert.equal(isSupportedNodeVersion("v20.19.0"), false);
  assert.equal(isSupportedNodeVersion("v21.7.3"), false);
  assert.equal(isSupportedNodeVersion("v22.0.0"), true);
  assert.equal(isSupportedNodeVersion("v24.1.0"), true);
  assert.equal(isSupportedNodeVersion("not-a-version"), false);
});
