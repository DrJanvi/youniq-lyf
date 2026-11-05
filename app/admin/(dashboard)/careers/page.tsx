import { CareerImageSettings } from "@/components/admin/pages/CareerImageSettings";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { CareerApplicationsTable } from "@/components/admin/tables/CareerApplicationsTable";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import {
  getCareerPageSettings,
  listCareerApplications,
} from "@/services/career";

export default async function AdminCareersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPage();
  const params = parseListParams(await searchParams, {
    sortable: ["createdAt", "fullName"],
    defaultSort: "createdAt",
  });
  const [settings, result] = await Promise.all([
    getCareerPageSettings(),
    listCareerApplications(params.page, params),
  ]);

  return (
    <>
      <PageHeader
        title="Careers"
        description="Manage the career page image and review submitted applications."
      />
      <CareerImageSettings imageUrl={settings.imageUrl} />
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Applications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review candidate details and download each resume.
          </p>
        </div>
        <CareerApplicationsTable
          meta={{
            total: result.pagination.total,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            sort: params.sort,
            dir: params.dir,
            q: params.q,
          }}
          rows={result.data.map((application) => ({
            id: application.id,
            fullName: application.fullName,
            email: application.email,
            countryCode: application.countryCode,
            phoneNumber: application.phoneNumber,
            jobRole: application.jobRole,
            resumeFileName: application.resumeFileName,
            createdAt: application.createdAt.toISOString(),
          }))}
        />
      </section>
    </>
  );
}
