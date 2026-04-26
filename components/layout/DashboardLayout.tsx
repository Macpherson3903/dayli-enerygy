export default function DashboardLayout({ children }: any) {
    return (
        <div className="flex">
            <aside className="w-64 h-screen bg-brand-900 text-white p-6">
                <h2 className="font-bold">Dashboard</h2>

                <nav className="mt-6 flex flex-col gap-3 text-sm">
                    <a href="#">Orders</a>
                    <a href="#">Products</a>
                    <a href="#">Customers</a>
                </nav>
            </aside>

            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    );
}