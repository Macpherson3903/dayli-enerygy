"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePackageAction } from "@/app/actions/packages";
import { Button } from "@/components/ui/Button";
import { useStatusMessage } from "@/context/StatusMessageContext";

export function DeletePackageButton({
  packageId,
  name,
}: {
  packageId: string;
  name: string;
}) {
  const router = useRouter();
  const { showStatusMessage } = useStatusMessage();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  async function onClick() {
    if (!window.confirm(`Delete “${name}” permanently?`)) return;
    setPending(true);
    setErr("");
    const r = await deletePackageAction(packageId);
    if (r && "error" in r && r.error) {
      setErr(r.error);
      showStatusMessage(`Delete package failed: ${r.error}`, "error");
      setPending(false);
      return;
    }
    showStatusMessage("Package deleted successfully.", "success");
    router.push("/admin/inventory/packages");
  }

  return (
    <div>
      {err && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {err}
        </p>
      )}
      <Button
        type="button"
        variant="danger"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "Deleting…" : "Delete package"}
      </Button>
    </div>
  );
}
