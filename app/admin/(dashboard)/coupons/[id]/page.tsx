import { CouponFormPage } from "@/components/admin/pages/CouponFormPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CouponFormPage id={(await params).id} />;
}
