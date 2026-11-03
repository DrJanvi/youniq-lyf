import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/common/PageHeader";
import { TaxonomyForm } from "@/components/admin/forms/TaxonomyForm";
import { type TaxonomyKind, taxonomyConfig } from "@/lib/admin/taxonomy-config";
import { requireAdminPage } from "@/lib/auth/session";
import { getTaxonomyById } from "@/services/taxonomy";

/** Shared new/edit page for categories, brands and product types (omit `id` to create). */
export async function TaxonomyFormPage({ kind, id }: { kind: TaxonomyKind; id?: string }) {
  await requireAdminPage();
  const cfg = taxonomyConfig[kind];
  const row = id ? await getTaxonomyById(kind, id) : null;
  if (id && !row) notFound();
  return (
    <>
      <PageHeader title={id ? `Edit ${cfg.singular.toLowerCase()}` : `New ${cfg.singular.toLowerCase()}`} backHref={`/admin/${cfg.path}`} />
      <TaxonomyForm
        id={id}
        singular={cfg.singular}
        withDetails={cfg.withDetails}
        endpoint={`/api/admin/${cfg.path}`}
        listHref={`/admin/${cfg.path}`}
        initial={
          row
            ? { name: row.name ?? "", slug: row.slug ?? "", image: row.image ?? "", description: row.description ?? "", seoTitle: row.seoTitle ?? "", seoDescription: row.seoDescription ?? "" }
            : undefined
        }
      />
    </>
  );
}
