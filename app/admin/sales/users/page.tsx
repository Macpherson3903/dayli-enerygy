import { clerkClient } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function SalesUsersPage() {
  const client = await clerkClient();
  const users = await client.users.getUserList({
    limit: 100,
    orderBy: "-created_at",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signup users"
        description="All users who signed up on the website."
      />
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm text-left min-w-[640px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Signed up</th>
              <th className="px-4 py-2 font-medium">Last sign in</th>
            </tr>
          </thead>
          <tbody>
            {users.data.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="px-4 py-2">
                  {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                    "N/A"}
                </td>
                <td className="px-4 py-2">
                  {user.primaryEmailAddress?.emailAddress ??
                    user.emailAddresses[0]?.emailAddress ??
                    "N/A"}
                </td>
                <td className="px-4 py-2 capitalize">
                  {String(user.publicMetadata?.role ?? "customer").replaceAll(
                    "_",
                    " "
                  )}
                </td>
                <td className="px-4 py-2">
                  {user.createdAt?.toLocaleString() ?? "N/A"}
                </td>
                <td className="px-4 py-2">
                  {user.lastSignInAt?.toLocaleString() ?? "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Showing {users.data.length} of {users.totalCount} users.
      </p>
    </div>
  );
}
