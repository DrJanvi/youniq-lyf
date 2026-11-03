import { TaxonomyListPage } from "@/components/admin/pages/TaxonomyListPage";
import type { SearchParams } from "@/lib/admin/list-params";

export default function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <TaxonomyListPage kind="productType" searchParams={searchParams} />;
}
