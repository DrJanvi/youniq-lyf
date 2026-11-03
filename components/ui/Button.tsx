import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" };

export function Button({ variant = "primary", className = "", type = "button", ...rest }: Props) {
  return <button type={type} data-variant={variant} className={`border px-3 py-1 disabled:opacity-50 ${className}`} {...rest} />;
}
