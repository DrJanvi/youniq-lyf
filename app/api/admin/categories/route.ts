import { adminTaxonomyRoutes } from "@/services/taxonomy-routes";
import { categoryInputSchema } from "@/lib/validation";

export const { GET, POST } = adminTaxonomyRoutes("category", categoryInputSchema).collection;
