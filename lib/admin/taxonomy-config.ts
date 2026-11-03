export type TaxonomyKind = "category" | "brand" | "productType";

export const taxonomyConfig = {
  category: { path: "categories", singular: "Category", plural: "Categories", withDetails: true },
  brand: { path: "brands", singular: "Brand", plural: "Brands", withDetails: false },
  productType: { path: "product-types", singular: "Product type", plural: "Product types", withDetails: false },
} as const;
