"use client";

import { useActionState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";
import {
  addQuotationApplianceFormAction,
  deleteQuotationApplianceAction,
  updateQuotationApplianceAction,
} from "@/app/actions/quotation-appliances";
import type { QuotationApplianceAdminRow } from "@/lib/db/quotation-appliances";

const initial: { error?: string; ok?: boolean } | undefined = undefined;

export function ApplianceSheetEditor({
  rows,
}: {
  rows: QuotationApplianceAdminRow[];
}) {
  const { showStatusMessage } = useStatusMessage();
  const [addState, addAction, adding] = useActionState(
    addQuotationApplianceFormAction,
    initial
  );

  useEffect(() => {
    if (!addState) return;
    if (addState.error) showStatusMessage(addState.error, "error");
    else if (addState.ok) showStatusMessage("Appliance added to the sheet.", "success");
  }, [addState, showStatusMessage]);

  return (
    <div className="space-y-8">
      <Card>
        <h2 className="text-base font-semibold text-gray-900">Add appliance</h2>
        <p className="mt-1 text-sm text-gray-600">
          New rows appear on system sizing and the public quotation calculator.
        </p>
        <form action={addAction} className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Input name="name" label="Name" required maxLength={200} />
          </div>
          <Input
            name="watts"
            label="Watts"
            type="number"
            min={1}
            step="any"
            required
          />
          <Input
            name="defaultHoursPerDay"
            label="Default hours / day"
            type="number"
            min={0}
            max={24}
            step="any"
            required
            defaultValue={4}
          />
          {addState?.error ? (
            <p className="sm:col-span-4 text-sm text-red-600" role="alert">
              {addState.error}
            </p>
          ) : null}
          <div className="sm:col-span-4">
            <Button type="submit" disabled={adding}>
              {adding ? "Adding…" : "Add to sheet"}
            </Button>
          </div>
        </form>
      </Card>

      <ul className="space-y-3" role="list">
        {rows.map((row) => (
          <li key={row.mongoId}>
            <SheetRow row={row} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SheetRow({ row }: { row: QuotationApplianceAdminRow }) {
  const { showStatusMessage } = useStatusMessage();
  const [updateState, updateAction, updating] = useActionState(
    updateQuotationApplianceAction,
    initial
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteQuotationApplianceAction,
    initial
  );

  useEffect(() => {
    if (!updateState) return;
    if (updateState.error) showStatusMessage(updateState.error, "error");
    else if (updateState.ok) showStatusMessage("Appliance updated.", "success");
  }, [updateState, showStatusMessage]);

  useEffect(() => {
    if (!deleteState) return;
    if (deleteState.error) showStatusMessage(deleteState.error, "error");
    else if (deleteState.ok) showStatusMessage("Appliance removed.", "success");
  }, [deleteState, showStatusMessage]);

  return (
    <Card>
      <form action={updateAction} className="grid gap-3 sm:grid-cols-6">
        <input type="hidden" name="id" value={row.mongoId} />
        <div className="sm:col-span-2">
          <Input name="name" label="Name" required defaultValue={row.name} maxLength={200} />
        </div>
        <Input
          name="watts"
          label="Watts"
          type="number"
          min={1}
          step="any"
          required
          defaultValue={row.watts}
        />
        <Input
          name="defaultHoursPerDay"
          label="Hours / day"
          type="number"
          min={0}
          max={24}
          step="any"
          required
          defaultValue={row.defaultHoursPerDay}
        />
        <Input
          name="sortOrder"
          label="Order"
          type="number"
          min={0}
          required
          defaultValue={row.sortOrder}
        />
        <div className="flex items-end gap-2">
          <Button type="submit" size="sm" disabled={updating}>
            {updating ? "Saving…" : "Update"}
          </Button>
        </div>
      </form>
      <form
        action={deleteAction}
        className="mt-3"
        onSubmit={(e) => {
          if (!window.confirm(`Remove “${row.name}” from the sheet?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={row.mongoId} />
        <Button type="submit" variant="danger" size="sm" disabled={deleting}>
          {deleting ? "Removing…" : "Remove"}
        </Button>
      </form>
    </Card>
  );
}
