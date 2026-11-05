import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { DeleteButton } from "./DeleteButton";
import { RestoreButton } from "./RestoreButton";

/** Standard Edit / Delete buttons for a table row. */
export function RowActions({
  editHref,
  deleteUrl,
  restoreUrl,
  restoreDisabled,
  restoreDisabledReason,
  itemName,
  deleteDescription,
  extra,
}: {
  editHref: string;
  deleteUrl?: string;
  restoreUrl?: string;
  restoreDisabled?: boolean;
  restoreDisabledReason?: string;
  itemName: string;
  deleteDescription?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {extra}
      {!restoreUrl ? (
        <Button asChild variant="outline" size="sm">
          <Link href={editHref}>
            <Pencil /> Edit
          </Link>
        </Button>
      ) : null}
      {restoreUrl ? (
        <RestoreButton
          url={restoreUrl}
          itemName={itemName}
          disabled={restoreDisabled}
          disabledReason={restoreDisabledReason}
        />
      ) : deleteUrl ? (
        <DeleteButton url={deleteUrl} itemName={itemName} description={deleteDescription} />
      ) : null}
    </div>
  );
}
