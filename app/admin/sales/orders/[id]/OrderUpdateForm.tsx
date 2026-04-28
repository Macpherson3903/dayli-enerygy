"use client";

import { useActionState, useEffect } from "react";
import { updateOrderStatusAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABEL } from "@/lib/constants";
import { useStatusMessage } from "@/context/StatusMessageContext";

type S = { error?: string; ok?: boolean } | undefined;

const initial: S = undefined;

export function OrderUpdateForm({
  orderId,
  currentStatus,
  internalNotes,
  statusOptions,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  internalNotes: string;
  statusOptions: OrderStatus[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, formAction, pending] = useActionState(
    updateOrderStatusAction,
    initial
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(`Order update failed: ${state.error}`, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Order updated successfully.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <Card>
      <h2 className="text-sm font-medium text-gray-500 mb-3">
        Update (sales)
      </h2>
      {state?.error && (
        <p className="text-sm text-red-600 mb-2" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-600 mb-2" role="status">
          Saved.
        </p>
      )}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="orderId" value={orderId} readOnly />
        <div>
          <label htmlFor="status" className="block text-sm text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            defaultValue={currentStatus}
            required
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <Textarea
          name="internalNotes"
          label="Internal notes (team only)"
          defaultValue={internalNotes}
          rows={4}
          className="font-mono text-sm"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save update"}
        </Button>
      </form>
    </Card>
  );
}
