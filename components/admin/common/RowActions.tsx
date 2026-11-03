import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DeleteButton } from "./DeleteButton";

/** Standard Edit / Delete buttons for a table row. */
export function RowActions({
  editHref,
  deleteUrl,
  itemName,
  deleteDescription,
  extra,
}: {
  editHref: string;
  deleteUrl?: string;
  itemName: string;
  deleteDescription?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {extra}
      <Button asChild variant="outline" size="sm">
        <Link href={editHref}>
          <Pencil /> Edit
        </Link>
      </Button>
      {deleteUrl ? <DeleteButton url={deleteUrl} itemName={itemName} description={deleteDescription} /> : null}
    </div>
  );
}
