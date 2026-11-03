import "server-only";
import type { ZodType } from "zod";
import { api, readJson, type IdCtx } from "@/lib/http";
import { requireAdminApi } from "@/lib/auth/session";
import { createTaxonomy, deleteTaxonomy, listTaxonomy, updateTaxonomy } from "./taxonomy";

type Kind = "category" | "brand" | "productType";

/** Builds admin route handlers for a taxonomy (category / brand / product type). */
export function adminTaxonomyRoutes(kind: Kind, schema: ZodType<{ name: string; slug?: string }>) {
  return {
    collection: {
      GET: api(async () => {
        await requireAdminApi();
        return { data: await listTaxonomy(kind) };
      }),
      POST: api(async (req) => {
        await requireAdminApi();
        const input = schema.parse(await readJson(req));
        return Response.json(await createTaxonomy(kind, input), { status: 201 });
      }),
    },
    item: {
      PATCH: api<IdCtx>(async (req, { params }) => {
        await requireAdminApi();
        const input = schema.parse(await readJson(req));
        return updateTaxonomy(kind, (await params).id, input);
      }),
      DELETE: api<IdCtx>(async (_req, { params }) => {
        await requireAdminApi();
        await deleteTaxonomy(kind, (await params).id);
      }),
    },
  };
}

export function publicTaxonomyList(kind: Kind) {
  return api(async () => ({ data: await listTaxonomy(kind) }));
}
