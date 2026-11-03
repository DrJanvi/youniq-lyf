import { FaqsPage } from "@/components/admin/pages/FaqsPage";
import { requireAdminPage } from "@/lib/auth/session";
import { listContactFaqs } from "@/services/contact";

export default async function AdminFaqsPage() {
  await requireAdminPage();
  const faqs = await listContactFaqs();

  return (
    <FaqsPage
      faqs={faqs.map(({ id, question, answer, page, sortOrder, isActive }) => ({
        id,
        question,
        answer,
        page,
        sortOrder,
        isActive,
      }))}
    />
  );
}
