"use client";

import { useActionState, useEffect } from "react";
import { sendInvoiceEmailAction } from "@/app/actions/invoices";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";

export function InvoiceSendEmailForm({
  invoiceId,
  defaultEmail,
  lastSentTo,
  lastSentAtLabel,
}: {
  invoiceId: string;
  defaultEmail: string;
  lastSentTo?: string | null;
  lastSentAtLabel?: string | null;
}) {
  const { showStatusMessage } = useStatusMessage();
  const [state, action, pending] = useActionState(
    sendInvoiceEmailAction,
    undefined as { error?: string; ok?: boolean } | undefined
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      showStatusMessage(state.error, "error");
      return;
    }
    if (state.ok) {
      showStatusMessage("Invoice sent by email.", "success");
    }
  }, [state, showStatusMessage]);

  return (
    <Card className="print:hidden no-print space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Send invoice</h2>
        <p className="mt-1 text-sm text-gray-600">
          Enter the recipient email and send this saved work order. You can change the
          address before sending.
        </p>
      </div>
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <Input
          label="Send to"
          name="to"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="customer@email.com"
          className="sm:min-w-[16rem]"
        />
        <Button type="submit" pending={pending}>
          Send invoice
        </Button>
      </form>
      {lastSentTo && lastSentAtLabel ? (
        <p className="text-xs text-gray-500">
          Last sent to {lastSentTo} on {lastSentAtLabel}
        </p>
      ) : null}
    </Card>
  );
}
