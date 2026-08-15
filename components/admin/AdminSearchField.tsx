"use client";

import { Input } from "@/components/ui/Input";

export function AdminSearchField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <Input
      label={label}
      name="adminSearch"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      hint={hint}
    />
  );
}
