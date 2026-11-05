import { Badge } from "@/components/admin/ui/badge";
import { orderStatusLabels } from "@/lib/order-status";
import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

const map: Record<string, keyof typeof tones> = {
  ACTIVE: "success", APPROVED: "success", DELETED: "danger", PERCENT: "neutral", FIXED: "neutral",
  DELIVERED: "success", DISPATCHED: "warning", OUT_FOR_DELIVERY: "warning",
  DELIVERY_ATTEMPT_FAILED: "danger", PENDING: "warning", HIDDEN: "neutral", INACTIVE: "neutral", REJECTED: "danger",
};

export function StatusBadge({ status, label, tone }: { status: string; label?: string; tone?: keyof typeof tones }) {
  const text = label ?? orderStatusLabels[status] ?? status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <Badge variant="outline" className={cn("font-medium", tones[tone ?? map[status] ?? "neutral"])}>
      {text}
    </Badge>
  );
}
