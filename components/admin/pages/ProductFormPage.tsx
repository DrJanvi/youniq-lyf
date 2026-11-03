import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { ProductForm } from "@/components/admin/forms/ProductForm";
import { requireAdminPage } from "@/lib/auth/session";
import { getProductById } from "@/services/product";
import { listTaxonomy } from "@/services/taxonomy";

export async function ProductFormPage({ id }: { id?: string }) {
  await requireAdminPage();
  const [product, categories, brands, types] = await Promise.all([
    id ? getProductById(id) : null,
    listTaxonomy("category"),
    listTaxonomy("brand"),
    listTaxonomy("productType"),
  ]);
  if (id && !product) notFound();
  const opts = (l: { id: string; name: string }[]) => l.map((o) => ({ value: o.id, label: o.name }));
  return (
    <>
      <PageHeader title={product ? "Edit product" : "New product"} description={product?.title} backHref="/admin/products" />
      <ProductForm
        id={id}
        categories={opts(categories)}
        brands={opts(brands)}
        types={opts(types)}
        product={
          product
            ? {
                title: product.title, slug: product.slug, description: product.description, images: product.images, price: product.price,
                aboutPoints: product.aboutPoints, aboutIntro: product.aboutIntro,
                currency: product.currency, stock: product.stock, gender: product.gender, isActive: product.isActive,
                categoryId: product.category.id, brandId: product.brand?.id ?? "", productTypeId: product.productType?.id ?? "",
                tags: product.tags, seoTitle: product.seoTitle ?? "", seoDescription: product.seoDescription ?? "",
              }
            : undefined
        }
      />
    </>
  );
}
