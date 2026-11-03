import { adminTaxonomyRoutes } from "@/services/taxonomy-routes";
import { categoryInputSchema } from "@/lib/validation";

export const { PATCH, DELETE } = adminTaxonomyRoutes("category", categoryInputSchema).item;
