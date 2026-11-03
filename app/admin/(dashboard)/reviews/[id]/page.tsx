import { ReviewFormPage } from "@/components/admin/pages/ReviewFormPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ReviewFormPage id={(await params).id} />;
}
