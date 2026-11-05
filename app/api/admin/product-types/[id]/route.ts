import { adminTaxonomyRoutes } from "@/services/taxonomy-routes";
import { nameInputSchema } from "@/lib/validation";

export const { PATCH, DELETE, POST } = adminTaxonomyRoutes("productType", nameInputSchema).item;
