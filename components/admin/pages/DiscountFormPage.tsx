import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { DiscountForm } from "@/components/admin/forms/DiscountForm";
import { toLocalInput } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getDiscount } from "@/services/discount";

export async function DiscountFormPage({ id }: { id?: string }) {
  await requireAdminPage();
  const [discount, products, categories] = await Promise.all([
    id ? getDiscount(id) : null,
    prisma.product.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" }, take: 500 }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (id && !discount) notFound();
  return (
    <>
      <PageHeader title={discount ? "Edit discount" : "New discount"} backHref="/admin/discounts" />
      <DiscountForm
        id={id}
        products={products.map((p) => ({ value: p.id, label: p.title }))}
        categories={categories.map((c) => ({ value: c.id, label: c.name }))}
        initial={
          discount
            ? {
                name: discount.name,
                type: discount.type,
                value: discount.value,
                target: discount.productId ? "PRODUCT" : discount.categoryId ? "CATEGORY" : "STORE",
                productId: discount.productId ?? "",
                categoryId: discount.categoryId ?? "",
                startsAt: toLocalInput(discount.startsAt),
                endsAt: toLocalInput(discount.endsAt),
                isActive: discount.isActive,
              }
            : undefined
        }
      />
    </>
  );
}
