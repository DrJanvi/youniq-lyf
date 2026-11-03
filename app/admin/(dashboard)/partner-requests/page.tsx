import { PageHeader } from "@/components/admin/common/PageHeader";
import { PartnerRequestsTable } from "@/components/admin/tables/PartnerRequestsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { listPartnerRequests } from "@/services/partner-request";

export default async function AdminPartnerRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();
  const params = parseListParams(await searchParams, {
    sortable: ["createdAt", "fullName"],
    defaultSort: "createdAt",
  });
  const result = await listPartnerRequests(params.page, params);

  return (
    <>
      <PageHeader
        title="Partner Request"
        description="Review partnership enquiries submitted from the storefront."
      />
      <PartnerRequestsTable
        meta={{
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          sort: params.sort,
          dir: params.dir,
          q: params.q,
        }}
        rows={result.data.map((request) => ({
          ...request,
          createdAt: request.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
