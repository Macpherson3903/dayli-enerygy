import clsx from "clsx";

export default function Button({
    children,
    variant = "primary",
    className,
    ...props
}: any) {
    const base = "px-6 py-3 rounded-xl text-sm font-medium transition";

    const variants: any = {
        primary: "bg-brand-500 text-white hover:bg-brand-700",
        secondary: "border border-brand-500 text-brand-700 hover:bg-brand-300",
        ghost: "text-brand-700 hover:bg-brand-300",
    };

    return (
        <button className={clsx(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
}