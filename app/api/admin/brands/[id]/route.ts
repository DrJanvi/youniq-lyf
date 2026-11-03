import { adminTaxonomyRoutes } from "@/services/taxonomy-routes";
import { nameInputSchema } from "@/lib/validation";

export const { PATCH, DELETE } = adminTaxonomyRoutes("brand", nameInputSchema).item;
