"use client";

import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";
import { ProductFilters } from "./ProductFilters";

type Props = Parameters<typeof ProductFilters>[0];

export function MobileProductFilterSheet(props: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label="Open product filters"
        onClick={() => dialogRef.current?.showModal()}
        className="text-text-muted flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#ece5e2] px-3 py-2 text-xs font-medium transition-colors hover:border-brand-taupe hover:text-brand-taupe md:hidden"
      >
        <AdjustmentsHorizontalIcon aria-hidden="true" className="size-4" />
        Filter
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-product-filter-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            event.currentTarget.close();
          }
        }}
        className="fixed inset-x-0 bottom-0 m-0 h-[90dvh] max-h-[48rem] w-full max-w-none overflow-hidden rounded-t-2xl border-0 bg-white p-0 text-text-primary shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[1px] md:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-[#ece5e2] px-5 py-4">
            <h2
              id="mobile-product-filter-title"
              className="font-cormorant text-2xl font-semibold uppercase"
            >
              Filters
            </h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => dialogRef.current?.close()}
              className="text-text-muted flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#f8f5f4] hover:text-text-primary"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
            <ProductFilters
              {...props}
              formId="mobile-product-filters"
              showHeading={false}
              showSubmitButton={false}
              defaultCategoryOpen={false}
            />
          </div>
          <div className="shrink-0 border-t border-[#ece5e2] bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              type="submit"
              form="mobile-product-filters"
              className="bg-brand-taupe hover:bg-brand-taupe-dark w-full cursor-pointer rounded-lg border px-4 py-3 text-sm font-semibold text-white transition-colors"
            >
              Apply filters
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
