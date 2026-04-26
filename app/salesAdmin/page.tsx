import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

export default function SalesAdmin() {
    return (
        <DashboardLayout>
            <h1 className="text-xl font-bold">Orders</h1>

            <table className="w-full mt-6 text-sm">
                <thead>
                    <tr className="text-left">
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    <tr className="border-t">
                        <td>#123</td>
                        <td>John Doe</td>
                        <td>Pending</td>
                        <td>
                            <Button size="sm">Confirm</Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </DashboardLayout>
    );
}