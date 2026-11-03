import { api } from "@/lib/http";
import { endSession } from "@/lib/auth/session";

export const POST = api(async () => {
  await endSession("customer");
});
