export type ProductGalleryImage = {
  id: string;
  src: string;
  variantId: string | null;
  variantName?: string;
};

export function reorderImageUrls(
  imageUrls: readonly string[],
  sourceIndex: number,
  targetIndex: number,
): string[] {
  if (
    !Number.isInteger(sourceIndex) ||
    !Number.isInteger(targetIndex) ||
    sourceIndex < 0 ||
    targetIndex < 0 ||
    sourceIndex >= imageUrls.length ||
    targetIndex >= imageUrls.length
  ) {
    return [...imageUrls];
  }

  const reorderedUrls = [...imageUrls];
  const [movedUrl] = reorderedUrls.splice(sourceIndex, 1);
  if (movedUrl === undefined) return reorderedUrls;
  reorderedUrls.splice(targetIndex, 0, movedUrl);
  return reorderedUrls;
}

type GalleryVariant = {
  id: string;
  name: string;
  images: readonly unknown[];
};

function usableImageUrls(images: readonly unknown[]) {
  return images.flatMap((image) =>
    typeof image === "string" && image.trim() ? [image.trim()] : [],
  );
}

function productGalleryEntries(images: readonly unknown[]): ProductGalleryImage[] {
  return usableImageUrls(images).map((src, index) => ({
    id: `product:${index}`,
    src,
    variantId: null,
  }));
}

export function getProductGalleryImages(
  productImages: readonly unknown[],
  variants: readonly GalleryVariant[],
  selectedVariantId: string | null,
): ProductGalleryImage[] {
  const productEntries = productGalleryEntries(productImages);
  const variantEntries = variants.flatMap((variant) =>
    usableImageUrls(variant.images).map((src, index) => ({
      id: `variant:${variant.id}:${index}`,
      src,
      variantId: variant.id,
      variantName: variant.name,
    })),
  );

  if (!variants.length) return productEntries;

  const selectedVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  );
  if (!selectedVariant) {
    return variantEntries.length ? variantEntries : productEntries;
  }

  if (variantEntries.some((image) => image.variantId === selectedVariant.id)) {
    return variantEntries;
  }

  const fallbackEntries = productEntries.map((image, index) => ({
    ...image,
    id: `fallback:${selectedVariant.id}:${index}`,
    variantId: selectedVariant.id,
    variantName: selectedVariant.name,
  }));
  return [...variantEntries, ...fallbackEntries];
}

export function getProductCardImage(
  productImages: readonly unknown[],
  variants: readonly GalleryVariant[],
): string | null {
  for (const variant of variants) {
    const image = usableImageUrls(variant.images)[0];
    if (image) return image;
  }
  return usableImageUrls(productImages)[0] ?? null;
}

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
