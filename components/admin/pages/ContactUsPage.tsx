"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Edit2, Mail, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { DataTable, type Column, type TableFilter } from "@/components/admin/common/DataTable";
import type { TableMeta } from "@/components/admin/tables/types";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import { RestoreButton } from "@/components/admin/common/RestoreButton";
import { StatusBadge } from "@/components/admin/common/StatusBadge";
import { CloudinaryImageUploader } from "@/components/admin/forms/ImageUploadField";
import type { ContactPageSetting } from "@prisma/client";

type Location = {
  id: string;
  city: string;
  country: string;
  company: string | null;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
};

type Submission = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

type Section = "details" | "locations" | "messages";
type LocationDraft = Omit<Location, "id" | "deletedAt"> & { id?: string };

const tabs: { key: Section; label: string; icon: typeof Mail }[] = [
  { key: "details", label: "Page details", icon: Mail },
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "messages", label: "Messages", icon: Mail },
];

function AdminField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

const fieldClass = "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring";

function ContactSettingsEditor({ settings }: { settings: ContactPageSetting | Omit<ContactPageSetting, "updatedAt"> }) {
  const { request, pending } = useAdminApi();
  const [image, setImage] = useState(settings.image ?? "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await request("/api/admin/contact-us", {
      method: "PATCH",
      json: {
        heading: form.get("heading"),
        tagline: form.get("tagline"),
        contactHeading: form.get("contactHeading"),
        contactIntro: form.get("contactIntro"),
        email: form.get("email"),
        alternateEmail: form.get("alternateEmail"),
        phone: form.get("phone"),
        whatsapp: form.get("whatsapp"),
        supportTitle: form.get("supportTitle"),
        supportDescription: form.get("supportDescription"),
        image,
        imageAlt: form.get("imageAlt"),
      },
      success: "Contact page details saved",
    });
  }

  return (
    <form onSubmit={submit} className="flex max-w-4xl flex-col gap-6">
      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Page heading</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField label="Main heading">
            <input name="heading" required maxLength={120} defaultValue={settings.heading} className={fieldClass} />
          </AdminField>
          <AdminField label="Intro text">
            <input name="tagline" required maxLength={500} defaultValue={settings.tagline} className={fieldClass} />
          </AdminField>
          <AdminField label="Contact details heading">
            <input name="contactHeading" required maxLength={200} defaultValue={settings.contactHeading} className={fieldClass} />
          </AdminField>
          <AdminField label="Contact details introduction">
            <textarea name="contactIntro" required maxLength={5000} rows={3} defaultValue={settings.contactIntro} className={fieldClass} />
          </AdminField>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Contact details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField label="Primary email">
            <input name="email" type="email" required maxLength={190} defaultValue={settings.email} className={fieldClass} />
          </AdminField>
          <AdminField label="Alternate email">
            <input name="alternateEmail" type="email" maxLength={190} defaultValue={settings.alternateEmail ?? ""} className={fieldClass} />
          </AdminField>
          <AdminField label="Phone number">
            <input name="phone" type="tel" required maxLength={30} defaultValue={settings.phone} className={fieldClass} />
          </AdminField>
          <AdminField label="WhatsApp number">
            <input name="whatsapp" type="tel" maxLength={40} defaultValue={settings.whatsapp ?? ""} className={fieldClass} />
          </AdminField>
          <AdminField label="Support section heading">
            <input name="supportTitle" required maxLength={120} defaultValue={settings.supportTitle} className={fieldClass} />
          </AdminField>
          <AdminField label="Support section text">
            <textarea name="supportDescription" required maxLength={500} rows={3} defaultValue={settings.supportDescription} className={fieldClass} />
          </AdminField>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Page image</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use an absolute HTTP(S) URL or a path to an image in the public folder.</p>
        <div className="mt-5">
          <CloudinaryImageUploader
            value={image}
            onChange={setImage}
            label="Upload contact page image"
          />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField label="Image URL">
            <input name="image" type="text" maxLength={1000} value={image} onChange={(event) => setImage(event.currentTarget.value)} className={fieldClass} placeholder="https://…" />
          </AdminField>
          <AdminField label="Image alternative text">
            <input name="imageAlt" maxLength={255} defaultValue={settings.imageAlt} className={fieldClass} />
          </AdminField>
        </div>
        {image ? (
          <div className="mt-4 max-w-lg overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={settings.imageAlt} className="h-48 w-full object-cover" />
          </div>
        ) : null}
      </section>

      <div>
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save page details"}</Button>
      </div>
    </form>
  );
}

function LocationDialog({ initial, close }: { initial: LocationDraft; close: () => void }) {
  const { request, pending } = useAdminApi();
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      city: String(form.get("city") ?? ""),
      country: String(form.get("country") ?? ""),
      company: String(form.get("company") ?? ""),
      address: String(form.get("address") ?? ""),
      phone: String(form.get("phone") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      sortOrder: Number(form.get("sortOrder") ?? 0),
      isActive: form.get("isActive") === "on",
    };
    const result = await request(initial.id ? `/api/admin/contact-us/locations/${initial.id}` : "/api/admin/contact-us/locations", {
      method: initial.id ? "PATCH" : "POST",
      json: payload,
      success: initial.id ? "Location updated" : "Location added",
    });
    if (result) {
      router.refresh();
      close();
    }
  }
  return (
    <EditorDialog title={initial.id ? "Edit location" : "Add location"} close={close}>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <AdminField label="City"><input name="city" required maxLength={120} defaultValue={initial.city} className={fieldClass} /></AdminField>
        <AdminField label="Country"><input name="country" required maxLength={120} defaultValue={initial.country} className={fieldClass} /></AdminField>
        <AdminField label="Company / branch"><input name="company" maxLength={190} defaultValue={initial.company ?? ""} className={fieldClass} /></AdminField>
        <AdminField label="Address"><textarea name="address" required maxLength={2000} rows={3} defaultValue={initial.address} className={fieldClass} /></AdminField>
        <AdminField label="Phone"><input name="phone" type="tel" maxLength={40} defaultValue={initial.phone ?? ""} className={fieldClass} /></AdminField>
        <AdminField label="WhatsApp"><input name="whatsapp" type="tel" maxLength={40} defaultValue={initial.whatsapp ?? ""} className={fieldClass} /></AdminField>
        <AdminField label="Display order"><input name="sortOrder" type="number" min={0} max={10000} step={1} defaultValue={initial.sortOrder} className={fieldClass} /></AdminField>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input name="isActive" type="checkbox" defaultChecked={initial.isActive} /> Visible on contact page</label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save location"}</Button>
        </div>
      </form>
    </EditorDialog>
  );
}

function EditorDialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="sr-only">Edit contact page content.</DialogDescription>
        </DialogHeader>
        <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={close} className="absolute top-4 right-12">
          <X />
        </Button>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function ContentList({
  locations,
}: {
  locations: Location[];
}) {
  const { request, pending } = useAdminApi();
  const [locationDraft, setLocationDraft] = useState<LocationDraft | null>(null);
  const router = useRouter();

  async function remove(url: string, label: string) {
    if (!window.confirm(`Delete this ${label}? It will be removed from the storefront and can be restored from this page.`)) return;
    const result = await request(url, { method: "DELETE", success: `${label} deleted` });
    if (result !== undefined) router.refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex items-start justify-between gap-3">
          <div><h2 className="font-heading text-xl font-bold">Locations</h2><p className="mt-1 text-sm text-muted-foreground">Add, edit, reorder, or hide store locations.</p></div>
          <Button size="sm" onClick={() => setLocationDraft({ city: "", country: "", company: "", address: "", phone: "", whatsapp: "", sortOrder: locations.length, isActive: true })}><Plus /> Add location</Button>
        </div>
        <div className="mt-5 divide-y divide-border">
          {locations.map((location) => (
            <div key={location.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <MapPin className="mt-1 size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  {location.city}, {location.country}
                  {location.deletedAt ? <StatusBadge status="DELETED" label="Deleted" /> : !location.isActive ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Hidden</span> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{location.company ? `${location.company} · ` : ""}{location.address}</p>
                <p className="text-xs text-muted-foreground">{[location.phone, location.whatsapp].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex gap-1">
                {location.deletedAt ? (
                  <RestoreButton url={`/api/admin/contact-us/locations/${location.id}`} itemName="Location" />
                ) : (
                  <>
                    <Button variant="ghost" size="icon" aria-label={`Edit ${location.city}`} onClick={() => setLocationDraft(location)}><Edit2 /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${location.city}`} disabled={pending} onClick={() => remove(`/api/admin/contact-us/locations/${location.id}`, "location")}><X /></Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!locations.length ? <p className="py-6 text-sm text-muted-foreground">No locations yet. Add one to show it on the storefront.</p> : null}
        </div>
      </section>

      {locationDraft ? <LocationDialog initial={locationDraft} close={() => setLocationDraft(null)} /> : null}
    </div>
  );
}

function SubmissionActions({ item }: { item: Submission }) {
  const { request, pending } = useAdminApi();
  const router = useRouter();
  const read = Boolean(item.readAt);
  async function toggle() {
    const result = await request(`/api/admin/contact-us/submissions/${item.id}`, {
      method: "PATCH",
      json: { read: !read },
      success: read ? "Message marked unread" : "Message marked read",
    });
    if (result !== undefined) router.refresh();
  }
  return (
    <Button type="button" size="sm" variant="outline" disabled={pending} onClick={toggle}>
      <Check /> Mark {read ? "unread" : "read"}
    </Button>
  );
}

function Inbox({ rows, meta, unreadCount, readFilter }: { rows: Submission[]; meta: TableMeta; unreadCount: number; readFilter?: string }) {
  const columns: Column<Submission>[] = [
    {
      id: "sender",
      header: "Customer",
      sortKey: "fullName",
      cell: (row) => <div className="min-w-36"><p className="font-medium">{row.fullName}</p><a href={`mailto:${row.email}`} className="text-xs text-muted-foreground hover:underline">{row.email}</a><a href={`tel:${row.phone}`} className="block text-xs text-muted-foreground hover:underline">{row.phone}</a></div>,
    },
    { id: "subject", header: "Subject", sortKey: "subject", cell: (row) => <span className="text-sm">{row.subject}</span> },
    {
      id: "message",
      header: "Message",
      cell: (row) => <details className="max-w-sm"><summary className="cursor-pointer text-sm text-primary">{row.message.length > 90 ? `${row.message.slice(0, 90)}…` : row.message}</summary><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{row.message}</p></details>,
    },
    { id: "status", header: "Status", cell: (row) => <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.readAt ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{row.readAt ? "Read" : "Unread"}</span> },
    { id: "createdAt", header: "Received", sortKey: "createdAt", cell: (row) => <time dateTime={row.createdAt} className="whitespace-nowrap text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</time> },
    { id: "actions", header: "", className: "text-right", cell: (row) => <SubmissionActions item={row} /> },
  ];
  const filters: TableFilter[] = [{ param: "read", label: "Status", value: readFilter, options: [{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }] }];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-2xl bg-tint-warm p-4 text-sm">
        <Mail className="size-4 text-primary" />
        <span><strong>{unreadCount}</strong> unread {unreadCount === 1 ? "message" : "messages"}</span>
      </div>
      <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} {...meta} searchValue={meta.q} searchPlaceholder="Search contact messages…" filters={filters} emptyTitle="No contact messages yet" />
    </div>
  );
}

export function ContactUsPage({
  section,
  settings,
  locations,
  submissions,
  unreadCount,
  readFilter,
}: {
  section: Section;
  settings: ContactPageSetting | Omit<ContactPageSetting, "updatedAt">;
  locations: Location[];
  submissions: { rows: Submission[]; meta: TableMeta };
  unreadCount: number;
  readFilter?: string;
}) {
  const activeSection = tabs.some((tab) => tab.key === section) ? section : "details";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-sm text-muted-foreground">Manage your storefront contact page, locations, and customer messages.</p>
      </div>
      <nav aria-label="Contact page management" className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = activeSection === key;
          return (
            <Link
              key={key}
              href={`/admin/contact-us?section=${key}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {label}
              {key === "messages" && unreadCount ? <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-primary/10 text-primary"}`}>{unreadCount}</span> : null}
            </Link>
          );
        })}
      </nav>

      {activeSection === "details" ? <ContactSettingsEditor settings={settings} /> : null}
      {activeSection === "locations" ? <ContentList locations={locations} /> : null}
      {activeSection === "messages" ? <Inbox rows={submissions.rows} meta={submissions.meta} unreadCount={unreadCount} readFilter={readFilter} /> : null}
    </div>
  );
}
