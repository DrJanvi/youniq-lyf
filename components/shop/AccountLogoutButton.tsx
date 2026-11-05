"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/button";
import { apiFetch } from "@/lib/client-api";

export function AccountLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Button
        className="rounded-md bg-[#fff4f5] text-[#c62f3a] hover:bg-[#fde9eb]"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await apiFetch("/api/auth/logout", { method: "POST" });
            router.replace("/");
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Unable to log out.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Logging out..." : "Log out"}
      </Button>
      {error ? <p role="alert" className="text-center text-xs text-badge-sale-text">{error}</p> : null}
    </div>
  );
}
