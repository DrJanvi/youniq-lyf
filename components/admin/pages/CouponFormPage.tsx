import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { CouponForm } from "@/components/admin/forms/CouponForm";
import { toLocalInput } from "@/lib/admin/format";
import { requireAdminPage } from "@/lib/auth/session";
import { getCoupon } from "@/services/coupon";

export async function CouponFormPage({ id }: { id?: string }) {
  await requireAdminPage();
  const coupon = id ? await getCoupon(id) : null;
  if (id && !coupon) notFound();

  return (
    <>
      <PageHeader title={coupon ? "Edit coupon" : "New coupon"} backHref="/admin/coupons" />
      <CouponForm
        id={id}
        initial={
          coupon
            ? {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minimumSubtotal: coupon.minimumSubtotal ?? undefined,
                maxDiscount: coupon.maxDiscount ?? undefined,
                startsAt: toLocalInput(coupon.startsAt),
                endsAt: toLocalInput(coupon.endsAt),
                isActive: coupon.isActive,
              }
            : undefined
        }
      />
    </>
  );
}
