import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getHighlightedPostMediaType,
  hasValidHighlightedPostMediaSignature,
  isHighlightedPostVideoUrl,
} from "../lib/highlighted-post-media";
import { isHighlightedPostLimitReached, MAX_HIGHLIGHTED_POSTS } from "../lib/highlighted-post-limit";

test("accepts only supported highlighted-post media types", () => {
  assert.equal(getHighlightedPostMediaType("image/png"), "image");
  assert.equal(getHighlightedPostMediaType("image/jpeg"), "image");
  assert.equal(getHighlightedPostMediaType("image/webp"), "image");
  assert.equal(getHighlightedPostMediaType("video/mp4"), "video");
  assert.equal(getHighlightedPostMediaType("video/quicktime"), "video");
  assert.equal(getHighlightedPostMediaType("video/webm"), "video");
  assert.equal(getHighlightedPostMediaType("application/octet-stream"), null);
});

test("validates the file signature for each supported media type", () => {
  assert.equal(
    hasValidHighlightedPostMediaSignature(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    hasValidHighlightedPostMediaSignature(
      Uint8Array.from([0xff, 0xd8, 0xff]),
      "image/jpeg",
    ),
    true,
  );
  assert.equal(
    hasValidHighlightedPostMediaSignature(
      Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]),
      "image/webp",
    ),
    true,
  );
  assert.equal(
    hasValidHighlightedPostMediaSignature(
      Uint8Array.from([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
      "video/mp4",
    ),
    true,
  );
  assert.equal(
    hasValidHighlightedPostMediaSignature(
      Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3]),
      "video/webm",
    ),
    true,
  );
  assert.equal(
    hasValidHighlightedPostMediaSignature(Uint8Array.from([0, 0, 0, 0]), "video/webm"),
    false,
  );
});

test("recognizes Cloudinary video URLs and common video extensions", () => {
  assert.equal(
    isHighlightedPostVideoUrl(
      "https://res.cloudinary.com/rjlowvm0/video/upload/v1794465674/storefront/518407d1-5f3b-4750-a057-eba07868e192.mp4",
    ),
    true,
  );
  assert.equal(isHighlightedPostVideoUrl("https://cdn.example.com/reel.MOV?download=1"), true);
  assert.equal(isHighlightedPostVideoUrl("https://cdn.example.com/post.webp"), false);
});

test("enforces a maximum of ten active highlighted posts", () => {
  assert.equal(MAX_HIGHLIGHTED_POSTS, 10);
  assert.equal(isHighlightedPostLimitReached(9), false);
  assert.equal(isHighlightedPostLimitReached(10), true);
  assert.equal(isHighlightedPostLimitReached(11), true);
});
