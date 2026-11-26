import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_IMAGE_SIZE,
  MAX_PRODUCT_IMAGE_SIZE,
  isValidImageSize,
} from "@/lib/image-upload";

test("keeps the existing general image size limit", () => {
  assert.equal(isValidImageSize(MAX_IMAGE_SIZE - 1), true);
  assert.equal(isValidImageSize(MAX_IMAGE_SIZE), false);
  assert.equal(isValidImageSize(0), false);
});

test("allows product images up to 15 MB inclusive", () => {
  assert.equal(isValidImageSize(MAX_PRODUCT_IMAGE_SIZE, "product"), true);
  assert.equal(isValidImageSize(MAX_PRODUCT_IMAGE_SIZE + 1, "product"), false);
  assert.equal(isValidImageSize(0, "product"), false);
});
