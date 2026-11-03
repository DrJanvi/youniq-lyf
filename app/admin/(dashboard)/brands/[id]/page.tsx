import { TaxonomyFormPage } from "@/components/admin/pages/TaxonomyFormPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <TaxonomyFormPage kind="brand" id={(await params).id} />;
}
