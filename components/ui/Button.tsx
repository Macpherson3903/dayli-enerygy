import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

type ButtonProps = ComponentProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Shows a spinner and disables the button. Visible label is hidden; keep aria-label if needed. */
  pending?: boolean;
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-900 focus-visible:ring-brand-500",
  secondary:
    "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-300",
  ghost: "text-gray-800 hover:bg-gray-100 focus-visible:ring-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

const spinnerSize: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      variant = "primary",
      size = "md",
      type = "button",
      children,
      disabled,
      pending = false,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || pending}
        aria-busy={pending || undefined}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClass[variant],
          sizeClass[size],
          className
        )}
        {...rest}
      >
        {pending ? (
          <>
            <Loader2
              className={clsx(spinnerSize[size], "animate-spin")}
              aria-hidden
            />
            <span className="sr-only">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
