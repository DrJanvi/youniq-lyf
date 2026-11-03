import { api } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";

export const GET = api(async () => ({ user: await getCurrentUser() }));
