"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { CloudinaryImageUploader } from "@/components/admin/forms/ImageUploadField";
import { useAdminApi } from "@/components/admin/common/use-admin-api";
import type { AboutUsPageSettings } from "@/services/about-us";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring";

type PrincipleDraft = AboutUsPageSettings["principles"][number];
type LegacyStatDraft = AboutUsPageSettings["legacyStats"][number];

function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}

export function AboutUsEditor({
  settings,
}: {
  settings: AboutUsPageSettings;
}) {
  const { request, pending } = useAdminApi();
  const [desktopImage, setDesktopImage] = useState(settings.desktopImage ?? "");
  const [mobileImage, setMobileImage] = useState(settings.mobileImage ?? "");
  const [principles, setPrinciples] = useState(settings.principles);
  const [whoImage, setWhoImage] = useState(settings.whoImage ?? "");
  const [legacyImage, setLegacyImage] = useState(settings.legacyImage ?? "");
  const [legacyStats, setLegacyStats] = useState(settings.legacyStats);
  const [whyChooseImage, setWhyChooseImage] = useState(
    settings.whyChooseImage ?? "",
  );

  function updatePrinciple(index: number, patch: Partial<PrincipleDraft>) {
    setPrinciples((current) =>
      current.map((principle, itemIndex) =>
        itemIndex === index ? { ...principle, ...patch } : principle,
      ),
    );
  }

  function movePrinciple(index: number, direction: -1 | 1) {
    setPrinciples((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateLegacyStat(index: number, patch: Partial<LegacyStatDraft>) {
    setLegacyStats((current) =>
      current.map((stat, itemIndex) =>
        itemIndex === index ? { ...stat, ...patch } : stat,
      ),
    );
  }

  function moveLegacyStat(index: number, direction: -1 | 1) {
    setLegacyStats((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "");
    await request("/api/admin/about-us", {
      method: "PATCH",
      json: {
        heroHeading: value("heroHeading"),
        heroDescription: value("heroDescription"),
        desktopImage,
        mobileImage,
        journeyHeading: value("journeyHeading"),
        journeyDescription: value("journeyDescription"),
        principlesHeading: value("principlesHeading"),
        principles: principles.map(({ icon, title, description }) => ({
          icon,
          title,
          description,
        })),
        whoImage,
        whoHeading: value("whoHeading"),
        whoSubheading: value("whoSubheading"),
        whoParagraphs: [0, 1, 2, 3].map((index) =>
          value(`whoParagraph${index + 1}`),
        ),
        whoBadge: value("whoBadge"),
        legacyImage,
        legacyHeading: value("legacyHeading"),
        legacyIntro: value("legacyIntro"),
        legacyParagraph1: value("legacyParagraph1"),
        legacyParagraph2: value("legacyParagraph2"),
        legacyStats: legacyStats.map(({ icon, title }) => ({ icon, title })),
        whyChooseImage,
        whyChooseHeading: value("whyChooseHeading"),
        whyChooseDescription: value("whyChooseDescription"),
        whyChooseCards: settings.whyChooseCards.map((_, index) => ({
          title: value(`whyChooseCards.${index}.title`),
          description: value(`whyChooseCards.${index}.description`),
        })),
        milestones: settings.milestones.map((_, index) => ({
          year: value(`milestones.${index}.year`),
          title: value(`milestones.${index}.title`),
          description: value(`milestones.${index}.description`),
        })),
      },
      success: "About Us page saved",
    });
  }

  return (
    <form onSubmit={submit} className="flex max-w-5xl flex-col gap-6">
      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Hero content</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The title and introduction appear over the hero image.
        </p>
        <div className="mt-5 grid gap-4">
          <AdminField label="Hero heading">
            <textarea
              name="heroHeading"
              required
              maxLength={255}
              rows={3}
              defaultValue={settings.heroHeading}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Hero introduction">
            <textarea
              name="heroDescription"
              required
              maxLength={1000}
              rows={3}
              defaultValue={settings.heroDescription}
              className={inputClass}
            />
          </AdminField>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Hero images</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload separate images for desktop and mobile screens. PNG, JPEG, or
          WebP images under 2 MB are supported.
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <CloudinaryImageUploader
              value={desktopImage}
              onChange={setDesktopImage}
              label="Desktop hero image"
              description="Shown on tablet and desktop layouts."
            />
            {desktopImage ? (
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setDesktopImage("")}
              >
                Remove desktop image
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <CloudinaryImageUploader
              value={mobileImage}
              onChange={setMobileImage}
              label="Mobile hero image"
              description="Shown on small-screen layouts."
            />
            {mobileImage ? (
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setMobileImage("")}
              >
                Remove mobile image
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Our journey</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <AdminField label="Section heading">
            <input
              name="journeyHeading"
              required
              maxLength={200}
              defaultValue={settings.journeyHeading}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Section introduction">
            <textarea
              name="journeyDescription"
              required
              maxLength={1000}
              rows={3}
              defaultValue={settings.journeyDescription}
              className={inputClass}
            />
          </AdminField>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Timeline milestones</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit the four milestones displayed on the storefront.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {settings.milestones.map((milestone, index) => (
            <fieldset
              key={index}
              className="grid gap-4 rounded-2xl border border-border p-4"
            >
              <legend className="px-2 text-sm font-semibold">
                Milestone {index + 1}
              </legend>
              <AdminField label="Year or value">
                <input
                  name={`milestones.${index}.year`}
                  required
                  maxLength={40}
                  defaultValue={milestone.year}
                  className={inputClass}
                />
              </AdminField>
              <AdminField label="Title">
                <input
                  name={`milestones.${index}.title`}
                  required
                  maxLength={160}
                  defaultValue={milestone.title}
                  className={inputClass}
                />
              </AdminField>
              <AdminField label="Description">
                <textarea
                  name={`milestones.${index}.description`}
                  required
                  maxLength={500}
                  rows={3}
                  defaultValue={milestone.description}
                  className={inputClass}
                />
              </AdminField>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold">Principles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the principles section shown below the journey timeline.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPrinciples((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  icon: "/assets/about-us/mission.svg",
                  title: "",
                  description: "",
                },
              ])
            }
          >
            <Plus /> Add principle
          </Button>
        </div>
        <div className="mt-5">
          <AdminField label="Section heading">
            <input
              name="principlesHeading"
              required
              maxLength={255}
              defaultValue={settings.principlesHeading}
              className={inputClass}
            />
          </AdminField>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {principles.map((principle, index) => (
            <fieldset
              key={principle.id}
              className="grid gap-4 rounded-2xl border border-border p-4"
            >
              <legend className="px-2 text-sm font-semibold">
                Principle {index + 1}
              </legend>
              <CloudinaryImageUploader
                value={principle.icon}
                onChange={(icon) => updatePrinciple(index, { icon })}
                label="Upload principle icon"
                description="Use a transparent PNG, JPEG, or WebP icon."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Title">
                  <input
                    required
                    maxLength={160}
                    value={principle.title}
                    onChange={(event) =>
                      updatePrinciple(index, { title: event.currentTarget.value })
                    }
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="Description">
                  <textarea
                    required
                    maxLength={1000}
                    rows={3}
                    value={principle.description}
                    onChange={(event) =>
                      updatePrinciple(index, {
                        description: event.currentTarget.value,
                      })
                    }
                    className={inputClass}
                  />
                </AdminField>
              </div>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Move principle ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => movePrinciple(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Move principle ${index + 1} down`}
                    disabled={index === principles.length - 1}
                    onClick={() => movePrinciple(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={principles.length === 1}
                  onClick={() =>
                    setPrinciples((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 /> Remove
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">Who We Are</h2>
        <div className="mt-5 grid gap-5">
          <div className="grid gap-3">
            <CloudinaryImageUploader
              value={whoImage}
              onChange={setWhoImage}
              label="Who We Are image"
              description="Upload the image displayed beside this section."
            />
            {whoImage ? (
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setWhoImage("")}
              >
                Remove image
              </Button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Heading">
              <input
                name="whoHeading"
                required
                maxLength={200}
                defaultValue={settings.whoHeading}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Subheading">
              <input
                name="whoSubheading"
                required
                maxLength={255}
                defaultValue={settings.whoSubheading}
                className={inputClass}
              />
            </AdminField>
            <AdminField label="Tradition badge text">
              <input
                name="whoBadge"
                required
                maxLength={120}
                defaultValue={settings.whoBadge}
                className={inputClass}
              />
            </AdminField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {settings.whoParagraphs.map((paragraph, index) => (
              <AdminField key={index} label={`Paragraph ${index + 1}`}>
                <textarea
                  name={`whoParagraph${index + 1}`}
                  required
                  maxLength={5000}
                  rows={4}
                  defaultValue={paragraph}
                  className={inputClass}
                />
              </AdminField>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">
          A Legacy of Fragrance
        </h2>
        <div className="mt-5 grid gap-4">
          <div className="grid gap-3">
            <CloudinaryImageUploader
              value={legacyImage}
              onChange={setLegacyImage}
              label="Legacy section image"
              description="Upload the image displayed beside this section."
            />
            {legacyImage ? (
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setLegacyImage("")}
              >
                Remove image
              </Button>
            ) : null}
          </div>
          <AdminField label="Heading">
            <input
              name="legacyHeading"
              required
              maxLength={255}
              defaultValue={settings.legacyHeading}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Introduction">
            <textarea
              name="legacyIntro"
              required
              maxLength={5000}
              rows={4}
              defaultValue={settings.legacyIntro}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Paragraph below stats 1">
            <textarea
              name="legacyParagraph1"
              required
              maxLength={5000}
              rows={4}
              defaultValue={settings.legacyParagraph1}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Paragraph below stats 2">
            <textarea
              name="legacyParagraph2"
              required
              maxLength={5000}
              rows={4}
              defaultValue={settings.legacyParagraph2}
              className={inputClass}
            />
          </AdminField>
        </div>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold">Legacy stats</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, remove, reorder, and upload an icon for each stat.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setLegacyStats((current) => [
                ...current,
                {
                  id: crypto.randomUUID(),
                  icon: "/assets/about-us/stat-established.svg",
                  title: "",
                },
              ])
            }
          >
            <Plus /> Add stat
          </Button>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {legacyStats.map((stat, index) => (
            <fieldset
              key={stat.id}
              className="grid gap-4 rounded-2xl border border-border p-4"
            >
              <legend className="px-2 text-sm font-semibold">
                Stat {index + 1}
              </legend>
              <CloudinaryImageUploader
                value={stat.icon}
                onChange={(icon) => updateLegacyStat(index, { icon })}
                label="Upload stat icon"
                description="Use a small transparent icon."
              />
              <AdminField label="Label">
                <input
                  required
                  maxLength={160}
                  value={stat.title}
                  onChange={(event) =>
                    updateLegacyStat(index, { title: event.currentTarget.value })
                  }
                  className={inputClass}
                />
              </AdminField>
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Move stat ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveLegacyStat(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Move stat ${index + 1} down`}
                    disabled={index === legacyStats.length - 1}
                    onClick={() => moveLegacyStat(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={legacyStats.length === 1}
                  onClick={() =>
                    setLegacyStats((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 /> Remove
                </Button>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
        <h2 className="font-heading text-xl font-bold">
          Why Choose Buabed Banafa?
        </h2>
        <div className="mt-5 grid gap-5">
          <div className="grid gap-3">
            <CloudinaryImageUploader
              value={whyChooseImage}
              onChange={setWhyChooseImage}
              label="Why Choose section image"
              description="Upload the image displayed beside the feature cards."
            />
            {whyChooseImage ? (
              <Button
                type="button"
                variant="outline"
                className="self-start"
                onClick={() => setWhyChooseImage("")}
              >
                Remove image
              </Button>
            ) : null}
          </div>
          <AdminField label="Heading">
            <input
              name="whyChooseHeading"
              required
              maxLength={255}
              defaultValue={settings.whyChooseHeading}
              className={inputClass}
            />
          </AdminField>
          <AdminField label="Introduction">
            <textarea
              name="whyChooseDescription"
              required
              maxLength={5000}
              rows={4}
              defaultValue={settings.whyChooseDescription}
              className={inputClass}
            />
          </AdminField>
          <div className="grid gap-5 lg:grid-cols-2">
            {settings.whyChooseCards.map((card, index) => (
              <fieldset
                key={card.id}
                className="grid gap-4 rounded-2xl border border-border p-4"
              >
                <legend className="px-2 text-sm font-semibold">
                  Feature {index + 1}
                </legend>
                <AdminField label="Title">
                  <input
                    name={`whyChooseCards.${index}.title`}
                    required
                    maxLength={160}
                    defaultValue={card.title}
                    className={inputClass}
                  />
                </AdminField>
                <AdminField label="Description">
                  <textarea
                    name={`whyChooseCards.${index}.description`}
                    required
                    maxLength={1000}
                    rows={4}
                    defaultValue={card.description}
                    className={inputClass}
                  />
                </AdminField>
              </fieldset>
            ))}
          </div>
        </div>
      </section>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save About Us page"}
        </Button>
      </div>
    </form>
  );
}
