import { AddButton } from "@/components/admin/common/AddButton";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { ProductsTable } from "@/components/admin/tables/ProductsTable";
import { formatMoney } from "@/lib/admin/format";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listProducts } from "@/services/product";
import { listTaxonomy } from "@/services/taxonomy";

const sortable = [
  "title",
  "price",
  "stock",
  "soldCount",
  "createdAt",
  "isActive",
] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();
  const p = parseListParams(await searchParams, {
    sortable,
    defaultSort: "createdAt",
    filters: {
      category: true,
      gender: ["MALE", "FEMALE", "UNISEX"],
      status: ["active", "hidden"],
      deleted: ["active", "deleted"],
    },
  });
  const [result, categories] = await Promise.all([
    listProducts(
      {
        q: p.q,
        category: p.filters.category,
        gender: p.filters.gender,
        status: p.filters.status as "active" | "hidden" | undefined,
        deleted: p.filters.deleted as "active" | "deleted" | undefined,
        includeInactive: true,
        adminSort: { field: p.sort as (typeof sortable)[number], dir: p.dir },
      },
      p.page,
    ),
    listTaxonomy("category"),
  ]);
  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your catalogue, prices and stock."
        actions={
          <>
            {/* <Button asChild variant="outline">
              <Link href="/admin/import/shopify">Import from Shopify</Link>
            </Button> */}
            <AddButton href="/admin/products/new" label="Add product" />
          </>
        }
      />
      <ProductsTable
        meta={{
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          sort: p.sort,
          dir: p.dir,
          q: p.q,
        }}
        filters={[
          {
            param: "category",
            label: "Category",
            value: p.filters.category,
            options: categories.map((c) => ({ value: c.slug, label: c.name })),
          },
          {
            param: "status",
            label: "Status",
            value: p.filters.status,
            options: [
              { value: "active", label: "Active" },
              { value: "hidden", label: "Hidden" },
            ],
          },
          {
            param: "deleted",
            label: "Record",
            value: p.filters.deleted,
            options: [
              { value: "active", label: "Not deleted" },
              { value: "deleted", label: "Deleted" },
            ],
          },
          {
            param: "gender",
            label: "Gender",
            value: p.filters.gender,
            options: [
              { value: "UNISEX", label: "Unisex" },
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ],
          },
        ]}
        rows={result.data.map((x) => ({
          id: x.id,
          title: x.title,
          image: x.images[0] ?? null,
          category: x.category.name,
          price: x.discountAmount
            ? `${formatMoney(x.finalPrice, x.currency)} (was ${formatMoney(x.price, x.currency)})`
            : formatMoney(x.price, x.currency),
          discounted: Boolean(x.discountAmount),
          stock: x.stock,
          soldCount: x.soldCount,
          isActive: x.isActive,
          deletedAt: x.deletedAt,
          deletedByTaxonomy: x.deletedByTaxonomy,
        }))}
      />
    </>
  );
}
