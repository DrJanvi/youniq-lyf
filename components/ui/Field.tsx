import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span>{label}</span>
      {children}
      {error ? <span role="alert">{error}</span> : null}
    </label>
  );
}

export function Input({ label, error, className = "", ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <input className={`border px-2 py-1 ${className}`} {...rest} />
    </Field>
  );
}

export function Textarea({ label, error, className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <textarea className={`border px-2 py-1 ${className}`} {...rest} />
    </Field>
  );
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Field label={label} error={error}>
      <select className={`border px-2 py-1 ${className}`} {...rest}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
