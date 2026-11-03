import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

export function AddButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild>
      <Link href={href}>
        <Plus /> {label}
      </Link>
    </Button>
  );
}
