"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { InternationalPhoneField } from "@/components/shop/InternationalPhoneField";
import { apiFetch } from "@/lib/client-api";
import type { SavedAddressDTO, SavedAddressInput } from "@/services/address";

const fieldClass =
  "h-11 w-full rounded-full border border-[#e8e4e1] bg-white px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-taupe focus:ring-2 focus:ring-brand-taupe/20";

export function AccountAddressForm({
  address,
  addressCount,
  displayNumber,
  customerEmail,
  customerName,
  customerPhone,
  onCancel,
  onSaved,
}: {
  address: SavedAddressDTO | null;
  addressCount: number;
  displayNumber: number;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  onCancel: () => void;
  onSaved: (address: SavedAddressDTO) => void;
}) {
  const [phone, setPhone] = useState(address?.phone ?? customerPhone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameParts = customerName?.trim().split(/\s+/) ?? [];
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    if (!phone.trim()) {
      setError("Enter a phone number.");
      setBusy(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const input: SavedAddressInput = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phone,
      addressLine: String(formData.get("addressLine") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      country: String(formData.get("country") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      isDefault: address?.isDefault ?? addressCount === 0,
    };

    try {
      const saved = await apiFetch<SavedAddressDTO>(
        address ? `/api/addresses/${address.id}` : "/api/addresses",
        {
          method: address ? "PATCH" : "POST",
          json: input,
        },
      );
      onSaved(saved);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save this address.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-3 sm:p-4">
      <h2 className="rounded-lg bg-[#f3f3f3] px-4 py-3 text-sm font-medium text-text-primary">
        Shipping Address ({displayNumber})
      </h2>
      <form
        onSubmit={submit}
        className="mt-2 rounded-xl bg-[#fafafa] p-4 sm:p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="sr-only" htmlFor="saved-address-first-name">
            First name
          </label>
          <input
            id="saved-address-first-name"
            name="firstName"
            autoComplete="given-name"
            placeholder="First Name*"
            defaultValue={address?.firstName ?? firstName}
            required
            maxLength={80}
            className={fieldClass}
          />
          <label className="sr-only" htmlFor="saved-address-last-name">
            Last name
          </label>
          <input
            id="saved-address-last-name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Last Name*"
            defaultValue={address?.lastName ?? lastName}
            required
            maxLength={80}
            className={fieldClass}
          />
          <label className="sr-only" htmlFor="saved-address-email">
            Email address
          </label>
          <input
            id="saved-address-email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={customerEmail ?? ""}
            readOnly
            className={`${fieldClass} bg-[#f3f3f3] text-text-muted`}
          />
          <label className="sr-only" htmlFor="saved-address-phone">
            Phone number
          </label>
          <InternationalPhoneField
            id="saved-address-phone"
            name="phone"
            value={phone}
            onChange={setPhone}
            onBlur={() => undefined}
            inputRef={null}
            autoComplete="tel"
            placeholder="Phone*"
            className="rounded-full"
          />
          <label className="sr-only" htmlFor="saved-address-line">
            Street address
          </label>
          <textarea
            id="saved-address-line"
            name="addressLine"
            autoComplete="street-address"
            placeholder="Enter your address*"
            defaultValue={address?.addressLine ?? ""}
            required
            minLength={5}
            maxLength={1000}
            rows={3}
            className="min-h-20 w-full resize-y rounded-2xl border border-[#e8e4e1] bg-white px-4 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-brand-taupe focus:ring-2 focus:ring-brand-taupe/20 sm:col-span-2"
          />
          <label className="sr-only" htmlFor="saved-address-city">
            City
          </label>
          <input
            id="saved-address-city"
            name="city"
            autoComplete="address-level2"
            placeholder="City*"
            defaultValue={address?.city ?? ""}
            required
            maxLength={100}
            className={fieldClass}
          />
          <label className="sr-only" htmlFor="saved-address-country">
            Country
          </label>
          <input
            id="saved-address-country"
            name="country"
            autoComplete="country-name"
            placeholder="Country*"
            defaultValue={address?.country ?? ""}
            required
            minLength={2}
            maxLength={100}
            className={fieldClass}
          />
          <label className="sr-only" htmlFor="saved-address-state">
            State or region
          </label>
          <input
            id="saved-address-state"
            name="state"
            autoComplete="address-level1"
            placeholder="State / region*"
            defaultValue={address?.state ?? ""}
            required
            maxLength={100}
            className={fieldClass}
          />
          <label className="sr-only" htmlFor="saved-address-postal-code">
            PIN or postal code
          </label>
          <input
            id="saved-address-postal-code"
            name="postalCode"
            autoComplete="postal-code"
            placeholder="PIN Code*"
            defaultValue={address?.postalCode ?? ""}
            required
            minLength={2}
            maxLength={20}
            className={fieldClass}
          />
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-badge-sale-text">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-brand-taupe px-5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-taupe-dark disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-4 py-2 text-xs font-medium uppercase text-text-muted transition-colors hover:bg-white hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
