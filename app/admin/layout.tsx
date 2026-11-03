import { Toaster } from "@/components/admin/ui/sonner";
import { TooltipProvider } from "@/components/admin/ui/tooltip";
import "./admin-theme.css";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="admin-root min-h-screen bg-backdrop text-foreground">
        {children}
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}
