"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { AccountAddressForm } from "@/components/shop/AccountAddressForm";
import { apiFetch } from "@/lib/client-api";
import type { SavedAddressDTO } from "@/services/address";

type FormMode = { type: "add" } | { type: "edit"; addressId: string };

function addressLines(address: SavedAddressDTO) {
  return [
    address.addressLine,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ];
}

export function AccountAddressesManager({
  initialAddresses,
  initialAddAddress,
  initialEditingAddressId,
  customerEmail,
  customerName,
  customerPhone,
}: {
  initialAddresses: SavedAddressDTO[];
  initialAddAddress: boolean;
  initialEditingAddressId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [formMode, setFormMode] = useState<FormMode | null>(() => {
    if (
      initialEditingAddressId &&
      initialAddresses.some((address) => address.id === initialEditingAddressId)
    ) {
      return { type: "edit", addressId: initialEditingAddressId };
    }
    return initialAddAddress ? { type: "add" } : null;
  });
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const editingAddress =
    formMode?.type === "edit"
      ? addresses.find((address) => address.id === formMode.addressId) ?? null
      : null;
  const displayNumber =
    editingAddress === null
      ? addresses.length + 1
      : addresses.findIndex((address) => address.id === editingAddress.id) + 1;

  function closeForm() {
    setFormMode(null);
    router.replace("/account/addresses", { scroll: false });
  }

  function handleSaved(savedAddress: SavedAddressDTO) {
    setAddresses((current) => {
      const alreadyExists = current.some(
        (address) => address.id === savedAddress.id,
      );
      const updated = current.map((address) => {
        if (address.id === savedAddress.id) return savedAddress;
        return savedAddress.isDefault ? { ...address, isDefault: false } : address;
      });
      if (!alreadyExists) updated.unshift(savedAddress);
      return updated.sort(
        (a, b) => Number(b.isDefault) - Number(a.isDefault),
      );
    });
    setActionError(null);
    setFormMode(null);
    router.replace("/account/addresses", { scroll: false });
  }

  async function setDefaultAddress(address: SavedAddressDTO) {
    setBusyAddressId(address.id);
    setActionError(null);
    try {
      const saved = await apiFetch<SavedAddressDTO>(
        `/api/addresses/${address.id}`,
        {
          method: "PATCH",
          json: {
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            addressLine: address.addressLine,
            city: address.city,
            state: address.state,
            country: address.country,
            postalCode: address.postalCode,
            isDefault: true,
          },
        },
      );
      setAddresses((current) =>
        current
          .map((item) =>
            item.id === saved.id
              ? saved
              : { ...item, isDefault: false },
          )
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to update the default address.",
      );
    } finally {
      setBusyAddressId(null);
    }
  }

  async function deleteAddress(address: SavedAddressDTO) {
    const name = `${address.firstName} ${address.lastName}`.trim();
    if (!window.confirm(`Delete the saved address for ${name}?`)) return;

    setBusyAddressId(address.id);
    setActionError(null);
    try {
      const remaining = await apiFetch<SavedAddressDTO[]>(
        `/api/addresses/${address.id}`,
        { method: "DELETE" },
      );
      setAddresses(remaining);
      if (
        formMode?.type === "edit" &&
        formMode.addressId === address.id
      ) {
        setFormMode(null);
        router.replace("/account/addresses", { scroll: false });
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to delete this address.",
      );
    } finally {
      setBusyAddressId(null);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-3 sm:p-4">
        <h2 className="rounded-lg bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
          Manage Address
        </h2>
        {addresses.length ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-surface-border bg-white">
            {addresses.map((address) => {
              const isBusy = busyAddressId === address.id;
              const fullName = `${address.firstName} ${address.lastName}`;
              return (
                <article
                  key={address.id}
                  className={`flex flex-col gap-4 border-b border-surface-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                    address.isDefault ? "bg-surface-card" : "bg-white"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
                        address.isDefault
                          ? "border-brand-primary"
                          : "border-surface-border"
                      }`}
                      aria-hidden="true"
                    >
                      {address.isDefault ? (
                        <span className="size-2 rounded-full bg-brand-primary" />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">
                          {fullName}
                        </h3>
                        {address.isDefault ? (
                          <span className="rounded-full bg-surface-card px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-brand-primary-dark">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-text-muted">
                        {addressLines(address).join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">{address.phone}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 pl-7 sm:justify-end sm:pl-0">
                    {!address.isDefault ? (
                      <button
                        type="button"
                        onClick={() => void setDefaultAddress(address)}
                        disabled={isBusy}
                        className="bg-brand-primary-dark hover:bg-brand-primary-hover text-white inline-flex h-9 items-center gap-2 rounded-full px-4 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {isBusy ? "Updating..." : "Set as Default"}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null);
                        setFormMode({ type: "edit", addressId: address.id });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-brand-primary-dark transition-colors hover:bg-brand-primary/10"
                      aria-label={`Edit address for ${fullName}`}
                    >
                      Edit
                      <Pencil className="size-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteAddress(address)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-brand-primary-dark transition-colors hover:bg-brand-primary/10 disabled:opacity-50"
                      aria-label={`Delete address for ${fullName}`}
                    >
                      {isBusy ? "Deleting..." : "Delete"}
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 rounded-xl bg-surface-main px-4 py-8 text-center text-sm text-text-muted">
            You have no saved addresses yet.
          </p>
        )}
        {actionError ? (
          <p role="alert" className="mt-3 text-sm text-badge-sale-text">
            {actionError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setFormMode({ type: "add" });
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-brand-primary-dark underline decoration-brand-primary underline-offset-4 transition-colors hover:text-text-primary"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add New Address
        </button>
      </section>

      {formMode ? (
        <AccountAddressForm
          key={formMode.type === "edit" ? formMode.addressId : "new"}
          address={editingAddress}
          addressCount={addresses.length}
          displayNumber={displayNumber}
          customerEmail={customerEmail}
          customerName={customerName}
          customerPhone={customerPhone}
          onCancel={closeForm}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}
