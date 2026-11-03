"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

export function FormActions({ submitLabel, pending, cancelHref }: { submitLabel: string; pending: boolean; cancelHref: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? "Saving…" : submitLabel}
      </Button>
      <Button asChild variant="outline" disabled={pending}>
        <Link href={cancelHref}>Cancel</Link>
      </Button>
    </div>
  );
}
