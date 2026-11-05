export function getVariantGalleryImages(
  productImages: string[],
  variantImages: string[],
  variantImagesFirst = true,
) {
  if (!variantImages.length) return productImages;
  const images = variantImagesFirst
    ? [...variantImages, ...productImages]
    : [...productImages, ...variantImages];
  return [...new Set(images)];
}
