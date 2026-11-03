"use client";

import { useState } from "react";
import type { Control, ControllerRenderProps } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/admin/ui/form";
import { highlightedCategoryFormSchema } from "@/lib/validation/admin";
import { Input } from "@/components/admin/ui/input";
import { FormSection, SwitchField, TextField, TextareaField } from "./Fields";
import { FormActions } from "./FormActions";
import { ImageUploadField } from "./ImageUploadField";
import { useEntityForm } from "./use-entity-form";

type Values = {
  image: string;
  title: string;
  description: string;
  buttonLink: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnabled: boolean;
  autoRestart: boolean;
};

type TimerFieldName = "days" | "hours" | "minutes" | "seconds";

function TimerNumberField({
  control,
  name,
  label,
  max,
}: {
  control: Control<Values>;
  name: TimerFieldName;
  label: string;
  max: number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field: { name: fieldName, value, onChange, onBlur } }) => (
        <TimerNumberInput
          name={fieldName}
          initialValue={value}
          onChange={onChange}
          onBlur={onBlur}
          label={label}
          max={max}
        />
      )}
    />
  );
}

function TimerNumberInput({
  name,
  initialValue,
  onChange,
  onBlur,
  label,
  max,
}: {
  name: TimerFieldName;
  initialValue: number | undefined;
  onChange: ControllerRenderProps<Values, TimerFieldName>["onChange"];
  onBlur: ControllerRenderProps<Values, TimerFieldName>["onBlur"];
  label: string;
  max: number;
}) {
  const [draft, setDraft] = useState(() => String(initialValue ?? ""));

  return (
    <FormItem>
      <FormLabel>
        {label}
        <span className="text-destructive">*</span>
      </FormLabel>
      <FormControl>
        <Input
          type="number"
          min={0}
          max={max}
          step={1}
          name={name}
          value={draft}
          onBlur={(event) => {
            onBlur();
            const value = event.currentTarget.value;
            if (value && Number.isInteger(Number(value))) {
              setDraft(String(Number(value)));
            }
          }}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setDraft(value);
            onChange(value === "" ? undefined : Number(value));
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function HighlightedCategoryForm({ initial }: { initial: Values }) {
  const { form, onSubmit, pending } = useEntityForm<Values>({
    schema: highlightedCategoryFormSchema as never,
    defaultValues: initial,
    url: "/api/admin/highlighted-category",
    method: "PATCH",
    redirectTo: "/admin/highlighted-category",
    successMessage: "Highlighted category settings saved",
    toPayload: ({ days, hours, minutes, seconds, ...values }) => ({
      ...values,
      durationSeconds: days * 86400 + hours * 3600 + minutes * 60 + seconds,
    }),
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="flex max-w-3xl flex-col gap-5">
        <FormSection title="Highlighted category">
          <div className="full">
            <ImageUploadField control={form.control} name="image" label="Upload highlighted category image" />
            <TextField control={form.control} name="image" label="Image URL" required type="url" />
          </div>
          <div className="full">
            <TextField control={form.control} name="title" label="Title" required />
          </div>
          <div className="full">
            <TextareaField control={form.control} name="description" label="Description" required rows={4} />
          </div>
          <div className="full">
            <TextField
              control={form.control}
              name="buttonLink"
              label="Button link"
              required
              description="Enter a storefront path such as /category/fragrances or an HTTP(S) URL."
            />
          </div>
        </FormSection>
        <FormSection
          title="Visibility and timer"
          description="The timer starts when you enable the section or change its duration."
        >
          <TimerNumberField control={form.control} name="days" label="Days" max={3650} />
          <TimerNumberField control={form.control} name="hours" label="Hours" max={23} />
          <TimerNumberField control={form.control} name="minutes" label="Minutes" max={59} />
          <TimerNumberField control={form.control} name="seconds" label="Seconds" max={59} />
          <div className="full">
            <SwitchField
              control={form.control}
              name="isEnabled"
              label="Enable section"
              description="When enabled, the section is shown until the timer completes."
            />
          </div>
          <div className="full">
            <SwitchField
              control={form.control}
              name="autoRestart"
              label="Restart timer automatically"
              description="After each countdown, start the next cycle and keep the section visible."
            />
          </div>
        </FormSection>
        <FormActions submitLabel="Save settings" pending={pending} cancelHref="/admin" />
      </form>
    </Form>
  );
}
