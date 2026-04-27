"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/actions/products";
import { Button } from "@/components/ui/Button";

export function DeleteProductButton({
  productId,
  name,
}: {
  productId: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  async function onClick() {
    if (!window.confirm(`Delete “${name}” permanently?`)) return;
    setPending(true);
    setErr("");
    const r = await deleteProductAction(productId);
    if (r && "error" in r && r.error) {
      setErr(r.error);
      setPending(false);
      return;
    }
    router.push("/admin/inventory");
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
        {pending ? "Deleting…" : "Delete product"}
      </Button>
    </div>
  );
}
