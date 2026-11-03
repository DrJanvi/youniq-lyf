import { ContactUsPage } from "@/components/admin/pages/ContactUsPage";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { requireAdminPage } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { defaultContactSettings, listContactLocations, listContactSubmissions } from "@/services/contact";

export default async function AdminContactUsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdminPage();
  const search = await searchParams;
  const requestedSection = Array.isArray(search.section) ? search.section[0] : search.section;
  if (requestedSection === "faqs") redirect("/admin/faqs");
  const section = requestedSection === "details" || requestedSection === "locations" || requestedSection === "messages"
    ? requestedSection
    : "details";
  const params = parseListParams(search, {
    sortable: ["createdAt", "fullName", "email", "subject"],
    defaultSort: "createdAt",
    filters: { read: ["read", "unread"] },
  });
  const [settings, locations, result, unreadCount] = await Promise.all([
    prisma.contactPageSetting.findUnique({ where: { id: "contact-us" } }),
    listContactLocations(),
    listContactSubmissions(params.page, params),
    prisma.contactSubmission.count({ where: { readAt: null } }),
  ]);

  return (
    <ContactUsPage
      section={section}
      settings={settings ?? defaultContactSettings}
      locations={locations.map(({ id, city, country, company, address, phone, whatsapp, sortOrder, isActive }) => ({
        id, city, country, company, address, phone, whatsapp, sortOrder, isActive,
      }))}
      submissions={{
        rows: result.data.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null })),
        meta: {
          total: result.pagination.total,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          sort: params.sort,
          dir: params.dir,
          q: params.q,
        },
      }}
      unreadCount={unreadCount}
      readFilter={params.filters.read}
    />
  );
}
