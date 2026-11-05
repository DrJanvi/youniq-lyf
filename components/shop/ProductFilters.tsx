"use client";

import { Accordion } from "@/components/ui/Accordion";
import { FilterOption, FilterOptionList } from "@/components/ui/FilterOption";
import type { ChangeEvent } from "react";
import { PriceRange } from "./PriceRange";

type Option = {
  slug: string;
  name: string;
  _count?: { products: number };
};

export type FilterValues = Record<string, string | undefined>;

const RATINGS = [4, 3, 2, 1];

function selectedValues(current?: string) {
  return (current ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value && value !== "all");
}

// GET submission keeps filtered URLs shareable and crawlable.
export function ProductFilters({
  values,
  categories,
  types,
  brands,
  productCount,
  priceRange,
  action = "/products",
  hideCategory = false,
  showHeading = true,
  showSubmitButton = true,
  defaultCategoryOpen = true,
  formId,
}: {
  values: FilterValues;
  categories: Option[];
  types: Option[];
  brands: Option[];
  productCount: number;
  priceRange: { min: number; max: number };
  action?: string;
  hideCategory?: boolean;
  showHeading?: boolean;
  showSubmitButton?: boolean;
  defaultCategoryOpen?: boolean;
  formId?: string;
}) {
  const handleMultiSelectChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const group = Array.from(input.form?.elements ?? []).filter(
      (element): element is HTMLInputElement =>
        element instanceof HTMLInputElement &&
        element.type === "checkbox" &&
        element.name === input.name,
    );
    const options = group.filter((option) => option.value !== "");
    const anyOption = group.find((option) => option.value === "");

    if (input.value === "") {
      if (input.checked) options.forEach((option) => (option.checked = false));
      else input.checked = true;
      return;
    }

    if (input.checked) {
      if (anyOption) anyOption.checked = false;
    } else if (!options.some((option) => option.checked) && anyOption) {
      anyOption.checked = true;
    }
  };

  const multiChoice = (
    name: string,
    current: string | undefined,
    anyLabel: string,
    list: Option[],
    anyCount?: number,
  ) => {
    const selected = selectedValues(current);
    return (
      <FilterOptionList>
        <FilterOption
          name={name}
          type="checkbox"
          value=""
          defaultChecked={selected.length === 0}
          label={anyLabel}
          count={anyCount}
          onChange={handleMultiSelectChange}
        />
        {list.map((o) => (
          <FilterOption
            key={o.slug}
            name={name}
            type="checkbox"
            value={o.slug}
            defaultChecked={selected.includes(o.slug)}
            label={o.name}
            count={o._count?.products}
            onChange={handleMultiSelectChange}
          />
        ))}
      </FilterOptionList>
    );
  };

  return (
    <form id={formId} action={action} method="get" className="flex flex-col">
      <input type="hidden" name="sort" value={values.sort ?? ""} />
      <div
        className={`flex items-center ${showHeading ? "justify-between pb-3" : "justify-end py-4"}`}
      >
        {showHeading ? (
          <h2 className="font-cormorant text-3xl font-semibold uppercase">
            Filters
          </h2>
        ) : null}
        <a
          href={action}
          className="text-text-muted border-b border-surface-border text-sm"
        >
          Clear all
        </a>
      </div>

      {!hideCategory ? (
        <Accordion title="Categories" defaultOpen={defaultCategoryOpen}>
          {multiChoice(
            "category",
            values.category,
            "All Products",
            categories,
            productCount,
          )}
        </Accordion>
      ) : null}

      <Accordion title="Product Type">
        {multiChoice("type", values.type, "Any", types)}
      </Accordion>

      <Accordion title="Brand">
        {multiChoice("brand", values.brand, "Any", brands)}
      </Accordion>

      <Accordion title="Availability">
        <FilterOptionList>
          <FilterOption
            type="checkbox"
            name="inStock"
            value="true"
            defaultChecked={values.inStock === "true"}
            label="In stock only"
          />
        </FilterOptionList>
      </Accordion>

      <Accordion title="Rating">
        {multiChoice(
          "minRating",
          values.minRating,
          "Any",
          RATINGS.map((n) => ({ slug: String(n), name: `${n}+ stars` })),
        )}
      </Accordion>

      <Accordion title="Price">
        <PriceRange
          min={priceRange.min}
          max={priceRange.max}
          selectedMin={values.minPrice}
          selectedMax={values.maxPrice}
        />
      </Accordion>

      {showSubmitButton ? (
        <button
          type="submit"
          className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white mt-5 cursor-pointer border px-4 py-2 text-sm font-medium"
        >
          Apply filters
        </button>
      ) : null}
    </form>
  );
}
