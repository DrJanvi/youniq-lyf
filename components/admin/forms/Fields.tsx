"use client";

import type { Control, ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Checkbox } from "@/components/admin/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/admin/ui/form";
import { Input } from "@/components/admin/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/ui/select";
import { Switch } from "@/components/admin/ui/switch";
import { Textarea } from "@/components/admin/ui/textarea";

type Base<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
};

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <FormLabel>
      {label}
      {required ? <span className="text-destructive">*</span> : null}
    </FormLabel>
  );
}

export function TextField<T extends FieldValues>({
  control, name, label, description, required, ...input
}: Base<T> & Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "ref">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} required={required} />
          <FormControl>
            <Input {...input} {...field} value={field.value ?? ""} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function NumberInput<T extends FieldValues>({
  fieldName,
  value,
  onChange,
  onBlur,
  inputRef,
  input,
}: {
  fieldName: ControllerRenderProps<T, Path<T>>["name"];
  value: ControllerRenderProps<T, Path<T>>["value"];
  onChange: ControllerRenderProps<T, Path<T>>["onChange"];
  onBlur: ControllerRenderProps<T, Path<T>>["onBlur"];
  inputRef: ControllerRenderProps<T, Path<T>>["ref"];
  input: Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "ref" | "type">;
}) {
  const [draft, setDraft] = useState(() => value == null ? "" : String(value));
  const previousValue = useRef(value);

  useEffect(() => {
    if (Object.is(previousValue.current, value)) return;
    previousValue.current = value;
    setDraft(value == null ? "" : String(value));
  }, [value]);

  return (
    <Input
      {...input}
      type="number"
      name={fieldName}
      ref={inputRef}
      onBlur={onBlur}
      value={draft}
      onChange={(event) => {
        const value = event.target.value;
        setDraft(value);
        onChange(value === "" ? undefined : Number(value));
      }}
    />
  );
}

/** Number input; stores `undefined` when empty so validation can report "required". */
export function NumberField<T extends FieldValues>({
  control, name, label, description, required, ...input
}: Base<T> & Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "ref" | "type">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} required={required} />
          <FormControl>
            <NumberInput
              fieldName={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              input={input}
            />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  control, name, label, description, required, ...input
}: Base<T> & Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange" | "onBlur" | "ref">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} required={required} />
          <FormControl>
            <Textarea {...input} {...field} value={field.value ?? ""} />
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const NONE = "__none";

export function SelectField<T extends FieldValues>({
  control, name, label, description, required, options, placeholder = "Select…", allowNone,
}: Base<T> & {
  options: { value: string; label: string }[];
  placeholder?: string;
  /** Adds a "None" entry that stores an empty string. */
  allowNone?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label label={label} required={required} />
          <Select value={field.value ? String(field.value) : allowNone ? NONE : ""} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
            <FormControl>
              <SelectTrigger className="w-full" onBlur={field.onBlur}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {allowNone ? <SelectItem value={NONE}>None</SelectItem> : null}
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SwitchField<T extends FieldValues>({ control, name, label, description }: Base<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between gap-4 rounded-2xl bg-muted p-4">
          <div className="flex flex-col gap-1">
            <FormLabel>{label}</FormLabel>
            {description ? <FormDescription>{description}</FormDescription> : null}
          </div>
          <FormControl>
            <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function CheckboxGroupField<T extends FieldValues>({
  control, name, label, options,
}: Base<T> & { options: { value: string; label: string }[] }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value: string[] = field.value ?? [];
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex flex-wrap gap-4">
              {options.map((o) => (
                <label key={o.value} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={value.includes(o.value)}
                    onCheckedChange={(c) => field.onChange(c ? [...value, o.value] : value.filter((v) => v !== o.value))}
                  />
                  {o.label}
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[0_8px_30px_-12px_rgb(60_42_33/0.18)] ring-1 ring-border">
      <div>
        <h2 className="font-heading text-xl font-bold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 [&>.full]:sm:col-span-2">{children}</div>
    </section>
  );
}
