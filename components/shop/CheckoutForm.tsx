"use client";

import { formatMoney } from "@/components/ui/PriceTag";
import { apiFetch } from "@/lib/client-api";
import type { SavedAddressDTO } from "@/services/address";
import type { CartDTO } from "@/services/cart";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type PaymentMethod = "CASH_ON_DELIVERY" | "RAZORPAY" | "PAYU";
type CouponQuote = { code: string; discountAmount: number; total: number };
type Props = {
  addresses: SavedAddressDTO[];
  cart: CartDTO;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  initialCouponCode?: string;
};

const fieldClass =
  "h-11 w-full rounded-md border border-[#e8e4e1] bg-white px-3 text-sm text-[#3d3530] outline-none placeholder:text-[#aaa19d] focus:border-[#b48d7d] focus:ring-1 focus:ring-[#b48d7d]";

const paymentOptions: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    description: "Pay when your order arrives.",
  },
  {
    value: "RAZORPAY",
    label: "Razorpay",
    description: "Demo selection only; no payment is processed.",
  },
  {
    value: "PAYU",
    label: "PayU",
    description: "Demo selection only; no payment is processed.",
  },
];

function addressText(address: SavedAddressDTO) {
  return [
    address.addressLine,
    `${address.city}, ${address.state}`,
    `${address.country} ${address.postalCode}`,
  ].join(", ");
}

export function CheckoutForm({
  addresses: initialAddresses,
  cart,
  customerEmail,
  customerName,
  customerPhone,
  initialCouponCode,
}: Props) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    initialAddresses.find((address) => address.isDefault)?.id ??
      initialAddresses[0]?.id ??
      "",
  );
  const [addressMode, setAddressMode] = useState<"add" | "edit" | null>(
    initialAddresses.length ? null : "add",
  );
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [addressBusy, setAddressBusy] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const [couponCode, setCouponCode] = useState(initialCouponCode ?? "");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponQuote | null>(null);
  const [couponBusy, setCouponBusy] = useState(Boolean(initialCouponCode));
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const currency = cart.items[0]?.product.currency ?? "AED";
  const orderTotal = appliedCoupon?.total ?? cart.total;
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );
  const editingAddress = addresses.find(
    (address) => address.id === editingAddressId,
  );
  const visibleAddresses = showAllAddresses ? addresses : addresses.slice(0, 1);
  const visibleItems = showAllItems ? cart.items : cart.items.slice(0, 3);

  useEffect(() => {
    if (!initialCouponCode) return;

    let active = true;
    apiFetch<CouponQuote>("/api/coupons/validate", {
      method: "POST",
      json: { code: initialCouponCode },
    })
      .then((quote) => {
        if (!active) return;
        setCouponCode(quote.code);
        setAppliedCoupon(quote);
        setCouponMessage("Coupon applied successfully.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAppliedCoupon(null);
        setCouponError(
          error instanceof Error
            ? error.message
            : "Could not apply this coupon.",
        );
      })
      .finally(() => {
        if (active) setCouponBusy(false);
      });

    return () => {
      active = false;
    };
  }, [initialCouponCode]);

  function startAddingAddress() {
    setAddressError(null);
    setEditingAddressId(null);
    setAddressMode("add");
  }

  function startEditingAddress(address: SavedAddressDTO) {
    setAddressError(null);
    setEditingAddressId(address.id);
    setAddressMode("edit");
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressBusy(true);
    setAddressError(null);
    const formData = new FormData(event.currentTarget);
    const field = (name: string) => String(formData.get(name) ?? "");
    const input = {
      firstName: field("firstName"),
      lastName: field("lastName"),
      phone: field("phone"),
      addressLine: field("addressLine"),
      city: field("city"),
      state: field("state"),
      country: field("country"),
      postalCode: field("postalCode"),
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      const isEditing = addressMode === "edit" && editingAddressId;
      const saved = await apiFetch<SavedAddressDTO>(
        isEditing ? `/api/addresses/${editingAddressId}` : "/api/addresses",
        { method: isEditing ? "PATCH" : "POST", json: input },
      );
      setAddresses((current) =>
        [saved, ...current.filter((address) => address.id !== saved.id)].sort(
          (a, b) => Number(b.isDefault) - Number(a.isDefault),
        ),
      );
      setSelectedAddressId(saved.id);
      setAddressMode(null);
      setEditingAddressId(null);
      router.refresh();
    } catch (error) {
      setAddressError(
        error instanceof Error ? error.message : "Could not save this address.",
      );
    } finally {
      setAddressBusy(false);
    }
  }

  async function changeQuantity(productId: string, quantity: number) {
    setBusyProductId(productId);
    setCartError(null);
    try {
      if (quantity < 1) {
        await apiFetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
        });
      } else {
        await apiFetch("/api/cart", {
          method: "POST",
          json: { productId, quantity },
        });
      }
      if (appliedCoupon) {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMessage(
          "Cart changed. Apply the coupon again to refresh the discount.",
        );
      }
      router.refresh();
    } catch (error) {
      setCartError(
        error instanceof Error ? error.message : "Could not update your cart.",
      );
    } finally {
      setBusyProductId(null);
    }
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    setCouponMessage(null);
    try {
      const quote = await apiFetch<CouponQuote>("/api/coupons/validate", {
        method: "POST",
        json: { code: couponCode },
      });
      setCouponCode(quote.code);
      setAppliedCoupon(quote);
      setCouponMessage("Coupon applied successfully.");
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : "Could not apply this coupon.",
      );
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    setCouponMessage(null);
    router.replace("/checkout", { scroll: false });
  }

  async function placeOrder() {
    if (!agreedToTerms) {
      setOrderError("Please agree to the terms and conditions to continue.");
      return;
    }
    if (!selectedAddress) {
      setOrderError(
        "Choose or add a shipping address before placing your order.",
      );
      return;
    }

    setOrderBusy(true);
    setOrderError(null);
    try {
      await apiFetch("/api/orders", {
        method: "POST",
        json: {
          addressId: selectedAddress.id,
          paymentMethod,
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        },
      });
      router.push("/orders");
      router.refresh();
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "Could not place your order.",
      );
      setOrderBusy(false);
    }
  }

  const addressForm = addressMode ? (
    <form
      key={`${addressMode}-${editingAddressId ?? "new"}`}
      onSubmit={saveAddress}
      className="mt-4 rounded-lg border border-[#eee7e3] bg-white p-4 sm:p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-[#4c403b]">
        {addressMode === "edit" ? "Edit address" : "Add a new address"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="sr-only" htmlFor="address-first-name">
          First name
        </label>
        <input
          id="address-first-name"
          name="firstName"
          autoComplete="given-name"
          placeholder="First name*"
          defaultValue={
            editingAddress?.firstName ?? customerName?.split(/\s+/)[0] ?? ""
          }
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-last-name">
          Last name
        </label>
        <input
          id="address-last-name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Last name*"
          defaultValue={
            editingAddress?.lastName ??
            customerName?.split(/\s+/).slice(1).join(" ") ??
            ""
          }
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-email">
          Account email
        </label>
        <input
          id="address-email"
          type="email"
          value={customerEmail ?? ""}
          placeholder="Email"
          readOnly
          className={`${fieldClass} bg-[#faf9f8] text-[#8b837e]`}
        />
        <label className="sr-only" htmlFor="address-phone">
          Phone
        </label>
        <input
          id="address-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone*"
          defaultValue={editingAddress?.phone ?? customerPhone ?? ""}
          required
          minLength={5}
          maxLength={30}
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-line">
          Street address
        </label>
        <textarea
          id="address-line"
          name="addressLine"
          autoComplete="street-address"
          placeholder="Address*"
          defaultValue={editingAddress?.addressLine ?? ""}
          required
          minLength={5}
          maxLength={1000}
          rows={3}
          className={`${fieldClass} h-auto min-h-20 resize-y py-3 sm:col-span-2`}
        />
        <label className="sr-only" htmlFor="address-city">
          City
        </label>
        <input
          id="address-city"
          name="city"
          autoComplete="address-level2"
          placeholder="City*"
          defaultValue={editingAddress?.city ?? ""}
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-state">
          State or region
        </label>
        <input
          id="address-state"
          name="state"
          autoComplete="address-level1"
          placeholder="State / region*"
          defaultValue={editingAddress?.state ?? ""}
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-country">
          Country
        </label>
        <input
          id="address-country"
          name="country"
          autoComplete="country-name"
          placeholder="Country*"
          defaultValue={editingAddress?.country ?? ""}
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor="address-postal-code">
          Postal code
        </label>
        <input
          id="address-postal-code"
          name="postalCode"
          autoComplete="postal-code"
          placeholder="PIN / postal code*"
          defaultValue={editingAddress?.postalCode ?? ""}
          required
          minLength={2}
          maxLength={20}
          className={fieldClass}
        />
      </div>
      <label className="mt-4 inline-flex items-center gap-2 text-xs text-[#766d69]">
        <input
          name="isDefault"
          type="checkbox"
          defaultChecked={editingAddress?.isDefault ?? addresses.length === 0}
          className="accent-[#b48d7d]"
        />
        Save as my default address
      </label>
      {addressError ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {addressError}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={addressBusy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#b48d7d] px-5 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#a77f70] disabled:opacity-50"
        >
          {addressBusy ? "Saving…" : "Save address"}
          <span aria-hidden="true">→</span>
        </button>
        {addresses.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setAddressMode(null);
              setEditingAddressId(null);
              setAddressError(null);
            }}
            className="px-3 py-2 text-xs font-medium text-[#514944] hover:underline"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  ) : null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5">
        <section className="rounded-xl border border-[#eee7e3] bg-white p-3 sm:p-4">
          <h2 className="rounded-lg bg-[#f5f4f3] px-4 py-3 text-sm font-semibold text-[#433b37]">
            Shipping Address
          </h2>
          <div className="pt-4">
            {addresses.length ? (
              <div className="space-y-3">
                {visibleAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                      selectedAddressId === address.id
                        ? "border-[#c9a99a] bg-[#fdfaf9]"
                        : "border-[#eee7e3] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => {
                        setSelectedAddressId(address.id);
                        setAddressMode(null);
                        setEditingAddressId(null);
                      }}
                      aria-label={`Ship to ${address.firstName} ${address.lastName}`}
                      className="mt-1 accent-[#b48d7d]"
                    />
                    <div className="min-w-0 flex-1 text-xs leading-5 text-[#766d69]">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#5b4035]">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-[#f3eae6] px-2 py-0.5 text-[10px] font-medium text-[#8b6252]">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words">{addressText(address)}</p>
                      <p>{address.phone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditingAddress(address)}
                      className="shrink-0 px-1 text-xs font-medium text-[#a67e6e] underline underline-offset-2"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {addresses.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setShowAllAddresses((show) => !show)}
                    className="text-xs text-[#766d69] underline underline-offset-2"
                  >
                    {showAllAddresses
                      ? "Show fewer addresses"
                      : "View all addresses"}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="py-2 text-sm text-[#766d69]">
                Add a shipping address to continue.
              </p>
            )}
            {addressForm}
            {addressMode === null ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={startAddingAddress}
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#8a6b5e] hover:text-[#573124]"
                >
                  <span className="text-lg leading-none" aria-hidden="true">
                    +
                  </span>
                  Add a New Address
                </button>
                {customerEmail ? (
                  <p className="text-xs text-[#9a928d]">
                    Signed in as {customerEmail}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-[#eee7e3] bg-white p-3 sm:p-4">
          <h2 className="rounded-lg bg-[#f5f4f3] px-4 py-3 text-sm font-semibold text-[#433b37]">
            Select a Payment Mode
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 transition-colors ${
                  paymentMethod === option.value
                    ? "border-[#c9a99a] bg-[#fdfaf9]"
                    : "border-[#eee7e3] hover:border-[#d8c7bf]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className="mt-0.5 accent-[#b48d7d]"
                />
                <span>
                  <span className="block text-xs font-medium text-[#514944]">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[10px] leading-4 text-[#9a928d]">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#9a928d]">
            Demo checkout only. No payment provider will be charged.
          </p>
        </section>
      </div>

      <aside className="rounded-xl border border-[#eee7e3] bg-[#fffdfc] p-5 sm:p-6 lg:sticky lg:top-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-cormorant text-2xl font-semibold text-[#573124]">
            Order Summary
          </h2>
          <Link
            href="/cart"
            className="text-xs font-medium text-[#a67e6e] underline underline-offset-2"
          >
            Edit Cart
          </Link>
        </div>

        <div className="mt-5 divide-y divide-[#f0eeed]">
          {visibleItems.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 py-3 first:pt-0"
            >
              <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded border border-[#f0eeed] bg-white">
                {item.product.images[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="size-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[9px] text-[#9a928d]">No image</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs leading-4 font-medium text-[#514944]">
                  {item.product.title}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#433b37]">
                  {formatMoney(item.lineTotal, item.product.currency)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#eee7e3] px-1 py-1">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.product.title}`}
                  disabled={busyProductId === item.product.id}
                  onClick={() =>
                    changeQuantity(item.product.id, item.quantity - 1)
                  }
                  className="grid size-6 place-items-center rounded-full text-sm text-[#766d69] hover:bg-[#f8f3f1] disabled:opacity-50"
                >
                  −
                </button>
                <span className="min-w-4 text-center text-xs">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.product.title}`}
                  disabled={
                    busyProductId === item.product.id ||
                    item.quantity >= item.product.stock
                  }
                  onClick={() =>
                    changeQuantity(item.product.id, item.quantity + 1)
                  }
                  className="grid size-6 place-items-center rounded-full text-sm text-[#766d69] hover:bg-[#f8f3f1] disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        {cart.items.length > 3 ? (
          <button
            type="button"
            onClick={() => setShowAllItems((show) => !show)}
            className="mt-2 text-xs text-[#a67e6e] underline underline-offset-2"
          >
            {showAllItems
              ? "Show fewer items"
              : `See ${cart.items.length - 3} more item${cart.items.length - 3 === 1 ? "" : "s"}`}
          </button>
        ) : null}
        {cartError ? (
          <p role="alert" className="mt-3 text-xs text-red-700">
            {cartError}
          </p>
        ) : null}

        <div className="mt-5 border-t border-dashed border-[#e8e1dd] pt-4">
          <h3 className="text-xs font-semibold tracking-wide text-[#514944]">
            Discount Code
          </h3>
          {appliedCoupon ? (
            <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-[#d6e8d5] bg-[#f5faf4] px-3 py-2">
              <p className="min-w-0 truncate text-xs text-[#376b3b]">
                <span className="font-semibold">{appliedCoupon.code}</span>{" "}
                applied
              </p>
              <button
                type="button"
                disabled={orderBusy}
                onClick={removeCoupon}
                className="shrink-0 text-xs font-medium text-[#766d69] underline underline-offset-2 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                aria-label="Discount code"
                autoCapitalize="characters"
                autoCorrect="off"
                maxLength={64}
                value={couponCode}
                disabled={couponBusy || orderBusy}
                onChange={(event) => {
                  setCouponCode(event.currentTarget.value);
                  setCouponError(null);
                  setCouponMessage(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void applyCoupon();
                  }
                }}
                placeholder="Enter coupon code"
                className="h-10 min-w-0 flex-1 rounded-md border border-[#e8e4e1] bg-white px-3 text-xs text-[#3d3530] outline-none placeholder:text-[#aaa19d] focus:border-[#b48d7d]"
              />
              <button
                type="button"
                disabled={couponBusy || orderBusy || !couponCode.trim()}
                onClick={() => void applyCoupon()}
                className="h-10 rounded-md bg-[#b48d7d] px-4 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {couponBusy ? "Applying…" : "Apply"}
              </button>
            </div>
          )}
          {couponError ? (
            <p role="alert" className="mt-2 text-xs text-red-700">
              {couponError}
            </p>
          ) : null}
          {couponMessage ? (
            <p aria-live="polite" className="mt-2 text-xs text-[#4d8c52]">
              {couponMessage}
            </p>
          ) : null}
        </div>

        <dl className="mt-5 space-y-2 border-t border-dashed border-[#e8e1dd] pt-4 text-xs">
          <div className="flex justify-between gap-3">
            <dt className="text-[#8b837e]">Subtotal</dt>
            <dd className="text-[#514944]">
              {formatMoney(cart.subtotal, currency)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#8b837e]">Automatic discounts</dt>
            <dd className="text-[#514944]">
              −{formatMoney(cart.discountTotal, currency)}
            </dd>
          </div>
          {appliedCoupon ? (
            <div className="flex justify-between gap-3">
              <dt className="text-[#8b837e]">Coupon ({appliedCoupon.code})</dt>
              <dd className="text-[#514944]">
                −{formatMoney(appliedCoupon.discountAmount, currency)}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3">
            <dt className="text-[#8b837e]">Shipping Cost</dt>
            <dd className="font-medium text-[#4d8c52]">Free</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-lg bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-cormorant text-xl font-semibold text-[#a67e6e]">
                Total
              </p>
              <p className="text-[10px] text-[#9a928d]">Including taxes</p>
            </div>
            <p className="text-lg font-semibold text-[#a67e6e]">
              {formatMoney(orderTotal, currency)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 text-xs leading-5 text-[#8b837e]">
          <input
            id="checkout-terms"
            type="checkbox"
            checked={agreedToTerms}
            disabled={orderBusy}
            onChange={(event) => {
              setAgreedToTerms(event.currentTarget.checked);
              setOrderError(null);
            }}
            className="mt-1 size-4 shrink-0 accent-[#b48d7d]"
          />
          <p>
            <label htmlFor="checkout-terms" className="cursor-pointer">
              I have read and agree to the website{" "}
            </label>
            <Link
              href="/terms-and-conditions"
              className="text-[#4d83df] hover:underline"
            >
              terms and conditions
            </Link>
          </p>
        </div>

        {orderError ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {orderError}
          </p>
        ) : null}
        <button
          type="button"
          onClick={placeOrder}
          disabled={
            orderBusy ||
            !agreedToTerms ||
            !selectedAddress ||
            cart.items.length === 0
          }
          className="font-cormorant mt-4 inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-[#b48d7d] px-5 text-base font-semibold tracking-[0.08em] text-white uppercase transition-colors hover:bg-[#a77f70] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {orderBusy ? "Processing…" : "Pay Now"}
          <ArrowRight aria-hidden="true" className="size-5" />
        </button>
        <p className="mt-3 text-center text-[10px] leading-4 text-[#9a928d]">
          Demo checkout only. No payment is processed.
        </p>
        <div
          aria-label="Checkout guarantees"
          className="mt-5 grid grid-cols-2 gap-3 text-[#827a76]"
        >
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck
              aria-hidden="true"
              className="size-7 shrink-0 text-[#c99887]"
              strokeWidth={1.5}
            />
            <span className="text-sm leading-5">
              Satisfied
              <br />
              Guaranteed
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <LockKeyhole
              aria-hidden="true"
              className="size-7 shrink-0 text-[#c99887]"
              strokeWidth={1.5}
            />
            <span className="text-sm leading-5">
              Secure
              <br />
              Checkout
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
