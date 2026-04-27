import { type ComponentProps, forwardRef, useId } from "react";
import { clsx } from "clsx";

type Props = {
  label: string;
  name?: string;
  error?: string;
  hint?: string;
} & Omit<ComponentProps<"input">, "id">;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, name, error, hint, className = "", required, ...rest },
  ref
) {
  const id = useId();
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        name={name}
        className={clsx(
          "w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300",
          className
        )}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export function Textarea({
  label,
  name,
  error,
  className = "",
  ...rest
}: {
  label: string;
  name?: string;
  error?: string;
} & ComponentProps<"textarea">) {
  const id = useId();
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        className={clsx(
          "w-full border rounded-lg px-3 py-2 text-sm min-h-[100px] text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-brand-500",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
