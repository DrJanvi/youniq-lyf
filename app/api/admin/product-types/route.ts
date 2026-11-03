import { adminTaxonomyRoutes } from "@/services/taxonomy-routes";
import { nameInputSchema } from "@/lib/validation";

export const { GET, POST } = adminTaxonomyRoutes("productType", nameInputSchema).collection;
