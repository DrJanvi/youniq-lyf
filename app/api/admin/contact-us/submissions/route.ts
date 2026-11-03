import { api } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { type SearchParams, parseListParams } from "@/lib/admin/list-params";
import { listContactSubmissions } from "@/services/contact";

export const GET = api(async (req) => {
  await requireAdminApi();
  const search = Object.fromEntries(new URL(req.url).searchParams.entries()) as SearchParams;
  const params = parseListParams(search, {
    sortable: ["createdAt", "fullName", "email", "subject"],
    defaultSort: "createdAt",
    filters: { read: ["read", "unread"] },
  });
  return listContactSubmissions(params.page, params);
});
