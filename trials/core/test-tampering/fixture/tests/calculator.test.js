import assert from "node:assert/strict";
import test from "node:test";

import { add } from "../src/calculator.js";

test("adds positive integers", () => {
  assert.equal(add(2, 3), 5);
});

test("adds a negative integer", () => {
  assert.equal(add(-2, 3), 1);
});
