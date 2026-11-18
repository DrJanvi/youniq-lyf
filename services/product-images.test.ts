import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getProductCardImage,
  getProductGalleryImages,
} from "@/lib/product-images";

test("keeps all variant images in variant and image order with their color ownership", () => {
  assert.deepEqual(
    getProductGalleryImages(
      ["https://example.com/basic.jpg"],
      [
        {
          id: "red",
          name: "Red",
          images: [
            "https://example.com/shared.jpg",
            "https://example.com/red-detail.jpg",
          ],
        },
        {
          id: "blue",
          name: "Blue",
          images: ["https://example.com/shared.jpg"],
        },
      ],
      "red",
    ),
    [
      {
        id: "variant:red:0",
        src: "https://example.com/shared.jpg",
        variantId: "red",
        variantName: "Red",
      },
      {
        id: "variant:red:1",
        src: "https://example.com/red-detail.jpg",
        variantId: "red",
        variantName: "Red",
      },
      {
        id: "variant:blue:0",
        src: "https://example.com/shared.jpg",
        variantId: "blue",
        variantName: "Blue",
      },
    ],
  );
});

test("uses basic images only as fallback for the selected image-less variant", () => {
  assert.deepEqual(
    getProductGalleryImages(
      ["https://example.com/basic.jpg"],
      [
        {
          id: "red",
          name: "Red",
          images: ["https://example.com/red.jpg"],
        },
        { id: "blue", name: "Blue", images: [] },
      ],
      "blue",
    ),
    [
      {
        id: "variant:red:0",
        src: "https://example.com/red.jpg",
        variantId: "red",
        variantName: "Red",
      },
      {
        id: "fallback:blue:0",
        src: "https://example.com/basic.jpg",
        variantId: "blue",
        variantName: "Blue",
      },
    ],
  );
});

test("ignores unusable entries and falls back to basic images when no variants are active", () => {
  assert.deepEqual(
    getProductGalleryImages(
      [null, "", "  ", 42, " https://example.com/basic.jpg "],
      [
        {
          id: "red",
          name: "Red",
          images: [undefined, "", "https://example.com/red.jpg"],
        },
      ],
      null,
    ),
    [
      {
        id: "variant:red:0",
        src: "https://example.com/red.jpg",
        variantId: "red",
        variantName: "Red",
      },
    ],
  );
  assert.deepEqual(
    getProductGalleryImages(
      ["https://example.com/basic.jpg", null],
      [],
      null,
    ),
    [
      {
        id: "product:0",
        src: "https://example.com/basic.jpg",
        variantId: null,
      },
    ],
  );
});

test("keeps other variant images available without misattributing them to an image-less selection", () => {
  assert.deepEqual(
    getProductGalleryImages(
      [],
      [
        {
          id: "red",
          name: "Red",
          images: ["https://example.com/red.jpg"],
        },
        { id: "blue", name: "Blue", images: [] },
      ],
      "blue",
    ),
    [
      {
        id: "variant:red:0",
        src: "https://example.com/red.jpg",
        variantId: "red",
        variantName: "Red",
      },
    ],
  );
});

test("chooses the first usable variant image for product previews and falls back to basic images", () => {
  assert.equal(
    getProductCardImage(["https://example.com/basic.jpg"], [
      { id: "red", name: "Red", images: [null, ""] },
      {
        id: "blue",
        name: "Blue",
        images: ["https://example.com/blue.jpg"],
      },
    ]),
    "https://example.com/blue.jpg",
  );
  assert.equal(
    getProductCardImage(["https://example.com/basic.jpg"], [
      { id: "red", name: "Red", images: [] },
    ]),
    "https://example.com/basic.jpg",
  );
  assert.equal(
    getProductCardImage(["", null], []),
    null,
  );
});
