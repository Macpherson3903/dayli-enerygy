import { PageHeader } from "@/components/ui/PageHeader";
import { SyncUsersFromClerkButton } from "@/components/admin/SyncUsersFromClerkButton";
import { syncAllUsersFromClerk } from "@/lib/auth/sync-user";
import { countUsers, listUsers, userDisplayName } from "@/lib/db/users";

export const dynamic = "force-dynamic";

function formatTimestamp(value: Date | null | undefined, fallback: string) {
  if (!value) return fallback;
  return value.toLocaleString();
}

export default async function SalesUsersPage() {
  try {
    await syncAllUsersFromClerk();
  } catch (e) {
    console.error("[users] Could not refresh users from Clerk", e);
  }
  const [users, total] = await Promise.all([listUsers(), countUsers()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Signup users"
        description="Users stored in MongoDB (synced from Clerk on sign-up, sign-in, and webhook events)."
        actions={<SyncUsersFromClerkButton />}
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-gray-500">
                  No users in the database yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.clerkId}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-2">{userDisplayName(user)}</td>
                  <td className="px-4 py-2">{user.email || "N/A"}</td>
                  <td className="px-4 py-2 capitalize">
                    {user.role.replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-2">
                    {formatTimestamp(user.createdAt, "N/A")}
                  </td>
                  <td className="px-4 py-2">
                    {formatTimestamp(user.lastSignInAt, "Never")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        Showing {users.length} of {total} users in MongoDB.
      </p>
    </div>
  );
}
