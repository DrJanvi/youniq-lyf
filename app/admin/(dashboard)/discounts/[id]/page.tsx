import { DiscountFormPage } from "@/components/admin/pages/DiscountFormPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <DiscountFormPage id={(await params).id} />;
}
