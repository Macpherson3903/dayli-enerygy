"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { syncUsersFromClerkAction } from "@/app/actions/users";

export function SyncUsersFromClerkButton() {
  const [state, action, pending] = useActionState(
    async () => syncUsersFromClerkAction(),
    undefined as { error?: string; synced?: number } | undefined
  );

  return (
    <form action={action} className="flex flex-col items-start gap-1">
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Syncing…" : "Sync from Clerk"}
      </Button>
      {state?.error ? (
        <p className="text-xs text-red-600">{state.error}</p>
      ) : null}
      {typeof state?.synced === "number" ? (
        <p className="text-xs text-green-700">Synced {state.synced} user(s).</p>
      ) : null}
    </form>
  );
}
