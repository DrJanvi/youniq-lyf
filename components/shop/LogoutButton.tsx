"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/client-api";

export function LogoutButton({
  endpoint = "/api/auth/logout",
  redirectTo = "/",
}: {
  endpoint?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await apiFetch(endpoint, { method: "POST" });
        router.replace(redirectTo);
        router.refresh();
      }}
    >
      Log out
    </Button>
  );
}
