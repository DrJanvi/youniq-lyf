"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/button";
import { apiFetch } from "@/lib/client-api";

export function AccountLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await apiFetch("/api/auth/logout", { method: "POST" });
          router.replace("/");
          router.refresh();
        } catch {
          setBusy(false);
        }
      }}
    >
      {busy ? "Logging out..." : "Log out"}
    </Button>
  );
}
