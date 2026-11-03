import { PageHeader } from "@/components/admin/common/PageHeader";
import { HighlightedPostForm } from "@/components/admin/forms/HighlightedPostForm";
import { requireAdminPage } from "@/lib/auth/session";

export default async function Page() {
  await requireAdminPage();
  return (
    <>
      <PageHeader title="New highlighted post" backHref="/admin/highlighted-posts" />
      <HighlightedPostForm />
    </>
  );
}
