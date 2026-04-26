export default function Input({ label, ...props }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm">{label}</label>
            <input
                {...props}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
        </div>
    );
}