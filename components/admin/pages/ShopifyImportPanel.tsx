"use client";

import { Button } from "@/components/admin/ui/button";
import { ClientApiError, apiFetch } from "@/lib/client-api";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { CloudUpload, LoaderCircle, Pause } from "lucide-react";

type ImportBatchResult = {
  total: number;
  processed: number;
  alreadyImported: number;
  remaining: number;
  complete: boolean;
};

const BATCH_SIZE = 10;

export function ShopifyImportPanel() {
  const [running, setRunning] = useState(false);
  const [pauseRequested, setPauseRequested] = useState(false);
  const [progress, setProgress] = useState<{
    total: number;
    processed: number;
    remaining: number;
    complete: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);
  const pauseRef = useRef(false);

  async function startImport() {
    if (runningRef.current) return;
    runningRef.current = true;
    pauseRef.current = false;
    setRunning(true);
    setPauseRequested(false);
    setError(null);

    try {
      let completed = false;
      while (!pauseRef.current) {
        const result = await apiFetch<ImportBatchResult>(
          `/api/admin/import/shopify?limit=${BATCH_SIZE}`,
          { method: "POST" },
        );
        const processed = result.total - result.remaining;
        setProgress({
          total: result.total,
          processed,
          remaining: result.remaining,
          complete: result.complete,
        });

        if (result.complete) {
          completed = true;
          toast.success(`Shopify import complete: ${processed} of ${result.total} products.`);
          break;
        }
        if (result.processed === 0) {
          throw new Error("The import did not process any products. Try again to resume.");
        }
      }

      if (pauseRef.current && !completed) {
        toast.info("Import paused. Start it again to resume with unprocessed products.");
      }
    } catch (caught) {
      const message =
        caught instanceof ClientApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Could not import Shopify products.";
      setError(message);
      toast.error(message);
    } finally {
      runningRef.current = false;
      pauseRef.current = false;
      setRunning(false);
      setPauseRequested(false);
    }
  }

  function pauseImport() {
    pauseRef.current = true;
    setPauseRequested(true);
  }

  return (
    <section className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">Import product catalogue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Products are processed in batches of {BATCH_SIZE}. You can pause after
          the current batch and resume later; completed products will be skipped.
          Import progress and failures are also written to the server console.
        </p>
      </div>

      {progress ? (
        <div className="space-y-2" aria-live="polite">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span>
              {progress.complete ? "Import complete" : "Import progress"}
            </span>
            <span className="text-muted-foreground">
              {progress.processed} of {progress.total} products
              {progress.remaining > 0 ? ` · ${progress.remaining} remaining` : ""}
            </span>
          </div>
          <progress
            className="h-2 w-full accent-primary"
            value={progress.processed}
            max={Math.max(progress.total, 1)}
            aria-label="Shopify import progress"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Start the import to process products that have not yet been added.
        </p>
      )}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error} You can start again to resume.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={running} onClick={() => void startImport()}>
          {running ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <CloudUpload />
          )}
          {running
            ? "Importing..."
            : progress?.complete
              ? "Run import again"
              : progress
                ? "Resume import"
                : "Start import"}
        </Button>
        {running ? (
          <Button
            type="button"
            variant="outline"
            disabled={pauseRequested}
            onClick={pauseImport}
          >
            <Pause />
            {pauseRequested ? "Pausing after this batch..." : "Pause import"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
