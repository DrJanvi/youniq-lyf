import { PageHeader } from "@/components/admin/common/PageHeader";
import { PolicyPagesEditor } from "@/components/admin/pages/PolicyPagesEditor";
import { requireAdminPage } from "@/lib/auth/session";
import { listPolicyPages } from "@/services/policy-pages";

export default async function AdminPoliciesPage() {
  await requireAdminPage();
  const pages = await listPolicyPages();

  return (
    <>
      <PageHeader
        title="Policies"
        description="Edit the legal and store policy pages shown on the storefront."
      />
      <PolicyPagesEditor pages={pages} />
    </>
  );
}
