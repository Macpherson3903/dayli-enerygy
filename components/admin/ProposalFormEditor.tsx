"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import {
  saveProposalDraftAction,
  sendProposalToClientAction,
} from "@/app/actions/proposals";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";
import type {
  ProposalApplianceRow,
  ProposalApprovalStatus,
  ProposalPayload,
} from "@/lib/types";
import { clsx } from "clsx";

type ActionState = { error?: string; ok?: boolean } | undefined;

const APPROVAL_LABEL: Record<ProposalApprovalStatus, string> = {
  none: "Not started",
  draft: "Draft",
  sent: "Sent — awaiting client",
  approved: "Approved",
  declined: "Declined",
};

const APPROVAL_STYLE: Record<ProposalApprovalStatus, string> = {
  none: "bg-gray-100 text-gray-700",
  draft: "bg-amber-100 text-amber-800",
  sent: "bg-sky-100 text-sky-900",
  approved: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

function emptyApplianceRow(): ProposalPayload["appliances"][number] {
  return {
    name: "",
    quantity: 0,
    watts: 0,
    peakLoad: 0,
    hoursPerDay: 0,
    dailyEnergyWh: 0,
  };
}

/** Keep peak load and daily Wh in sync with qty × W × hours (W comes from client calculator / stored row). */
function patchApplianceRow(
  row: ProposalApplianceRow,
  patch: Partial<ProposalApplianceRow>
): ProposalApplianceRow {
  const next = { ...row, ...patch };
  const peakLoad = next.quantity * next.watts;
  const dailyEnergyWh = peakLoad * next.hoursPerDay;
  return { ...next, peakLoad, dailyEnergyWh };
}

function emptySummaryRow(): ProposalPayload["systemSummary"][number] {
  return { parameter: "", value: "", units: "" };
}

function emptyCostRow(): ProposalPayload["costLines"][number] {
  return { qty: "", item: "", amount: "", totalAmount: "" };
}

function LoadDetailsEditDialog({
  initialRow,
  onApply,
  onClose,
}: {
  initialRow: ProposalApplianceRow;
  onApply: (next: ProposalApplianceRow) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => patchApplianceRow(initialRow, {}));
  const derived = patchApplianceRow(draft, {});

  useEffect(() => {
    setDraft(patchApplianceRow(initialRow, {}));
  }, [initialRow]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-edit-title"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="load-edit-title" className="text-base font-semibold text-gray-900">
          Edit load details
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Peak load and daily energy update from quantity × rated watts × hours per day. Saving the
          proposal updates this booking everywhere it appears (admin, customer account, and load
          summary text).
        </p>
        <div className="mt-4 space-y-3">
          <Input
            label="Appliance name"
            value={draft.name}
            onChange={(e) =>
              setDraft((d) => patchApplianceRow(d, { name: e.target.value }))
            }
          />
          <Input
            label="Quantity"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={draft.quantity}
            onChange={(e) =>
              setDraft((d) =>
                patchApplianceRow(d, {
                  quantity: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                })
              )
            }
          />
          <Input
            label="Hours per day"
            type="number"
            min={0}
            max={24}
            step={0.25}
            inputMode="decimal"
            value={draft.hoursPerDay}
            onChange={(e) =>
              setDraft((d) =>
                patchApplianceRow(d, {
                  hoursPerDay: Math.min(
                    24,
                    Math.max(0, Number.parseFloat(e.target.value) || 0)
                  ),
                })
              )
            }
          />
          <Input
            label="Rated power (W)"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={draft.watts}
            onChange={(e) =>
              setDraft((d) =>
                patchApplianceRow(d, {
                  watts: Math.max(0, Number.parseFloat(e.target.value) || 0),
                })
              )
            }
          />
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
            <p className="text-xs font-medium text-gray-500">Computed</p>
            <p className="mt-1 text-gray-800">
              Peak load:{" "}
              <span className="font-semibold">{derived.peakLoad.toLocaleString()} W</span>
            </p>
            <p className="text-gray-800">
              Daily energy:{" "}
              <span className="font-semibold">{derived.dailyEnergyWh.toLocaleString()} Wh</span>
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onApply(patchApplianceRow(draft, {}))}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProposalFormEditor({
  bookingId,
  bookingNumber,
  initialPayload,
  approvalStatus,
  approvedMeta,
}: {
  bookingId: string;
  bookingNumber: string;
  initialPayload: ProposalPayload;
  approvalStatus: ProposalApprovalStatus;
  approvedMeta: { signerName: string; approvedAt: Date } | null;
}) {
  const { showStatusMessage } = useStatusMessage();
  const [payload, setPayload] = useState<ProposalPayload>(initialPayload);
  const [loadEditIndex, setLoadEditIndex] = useState<number | null>(null);

  const [saveState, saveAction, savePending] = useActionState(
    saveProposalDraftAction,
    undefined as ActionState
  );
  const [sendState, sendAction, sendPending] = useActionState(
    sendProposalToClientAction,
    undefined as ActionState
  );

  const locked = approvalStatus === "sent" || approvalStatus === "approved";

  useEffect(() => {
    setPayload(initialPayload);
  }, [initialPayload]);

  useEffect(() => {
    if (!saveState) return;
    if (saveState.error) {
      showStatusMessage(saveState.error, "error");
      return;
    }
    if (saveState.ok) {
      showStatusMessage("Proposal draft saved.", "success");
    }
  }, [saveState, showStatusMessage]);

  useEffect(() => {
    if (!sendState) return;
    if (sendState.error) {
      showStatusMessage(sendState.error, "error");
      return;
    }
    if (sendState.ok) {
      showStatusMessage("Proposal sent to the client by email.", "success");
    }
  }, [sendState, showStatusMessage]);

  function buildFormData() {
    const fd = new FormData();
    fd.set("bookingId", bookingId);
    fd.set("proposalPayload", JSON.stringify(payload));
    return fd;
  }

  function submitSave() {
    startTransition(() => {
      saveAction(buildFormData());
    });
  }

  function submitSend() {
    if (
      !window.confirm(
        "Send this proposal to the client? They will receive an email with a link to review and approve."
      )
    ) {
      return;
    }
    startTransition(() => {
      sendAction(buildFormData());
    });
  }

  const fieldCls = locked ? "opacity-80 pointer-events-none" : "";

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-gray-500">Installation proposal</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Booking {bookingNumber} — client reviews and approves via email link.
          </p>
        </div>
        <span
          className={clsx(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            APPROVAL_STYLE[approvalStatus]
          )}
        >
          {APPROVAL_LABEL[approvalStatus]}
        </span>
      </div>

      {approvalStatus === "approved" && approvedMeta ? (
        <p className="mb-4 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-900">
          Approved by <span className="font-medium">{approvedMeta.signerName}</span>
          {approvedMeta.approvedAt
            ? ` on ${approvedMeta.approvedAt.toLocaleString()}`
            : null}
          .
        </p>
      ) : null}

      {approvalStatus === "sent" ? (
        <p className="mb-4 text-sm text-gray-600">
          This proposal was sent to the client. Editing is locked until you add a decline
          or resend flow later.
        </p>
      ) : null}

      <div className={clsx("space-y-8", fieldCls)}>
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Client details
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Name"
              value={payload.clientDetails.name}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  clientDetails: { ...p.clientDetails, name: e.target.value },
                }))
              }
            />
            <Input
              label="Email"
              type="email"
              value={payload.clientDetails.email}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  clientDetails: { ...p.clientDetails, email: e.target.value },
                }))
              }
            />
            <Input
              label="Phone"
              value={payload.clientDetails.phone}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  clientDetails: { ...p.clientDetails, phone: e.target.value },
                }))
              }
            />
            <Input
              label="Location"
              value={payload.clientDetails.location}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  clientDetails: { ...p.clientDetails, location: e.target.value },
                }))
              }
            />
            <Input
              label="Proposal date"
              value={payload.clientDetails.date}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  clientDetails: { ...p.clientDetails, date: e.target.value },
                }))
              }
              className="sm:col-span-2"
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            System overview
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["systemSizeKw", "System size (kW)"],
                ["batteryKwh", "Battery (kWh)"],
                ["batteryAh", "Battery (Ah)"],
                ["inverterKva", "Inverter (kVA)"],
                ["backupHours", "Backup hours"],
              ] as const
            ).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={payload.systemOverview[key]}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    systemOverview: { ...p.systemOverview, [key]: e.target.value },
                  }))
                }
              />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Appliances / load
              </h3>
              <p className="mt-1 max-w-2xl text-xs text-gray-500">
                Prefilled from the client&apos;s booking. Rows are read-only here — click{" "}
                <span className="font-medium text-gray-700">Edit details</span> to change an item
                (name, qty, hours, watts). <span className="font-medium text-gray-700">Save draft</span>{" "}
                or <span className="font-medium text-gray-700">Send to client</span> updates the
                booking everywhere (this page, customer account, summary text).
              </p>
            </div>
            {!locked ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => {
                  let addedAt = 0;
                  setPayload((p) => {
                    const appliances = [...p.appliances, emptyApplianceRow()];
                    addedAt = appliances.length - 1;
                    return { ...p, appliances };
                  });
                  setLoadEditIndex(addedAt);
                }}
              >
                Add row
              </Button>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">H/day</th>
                  {!locked ? <th className="px-2 py-2 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {payload.appliances.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-2 text-gray-900">
                      <span className="block min-w-[120px]">
                        {row.name.trim() ? row.name : "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-gray-700 tabular-nums">{row.quantity}</td>
                    <td className="px-2 py-2 text-gray-700 tabular-nums">
                      {Math.abs(row.hoursPerDay - Math.round(row.hoursPerDay)) < 1e-6
                        ? Math.round(row.hoursPerDay)
                        : Number(row.hoursPerDay.toFixed(2))}
                    </td>
                    {!locked ? (
                      <td className="px-2 py-1 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                          <button
                            type="button"
                            className="text-xs font-medium text-brand-700 hover:underline"
                            onClick={() => setLoadEditIndex(i)}
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={() =>
                              setPayload((p) => ({
                                ...p,
                                appliances: p.appliances.filter((_, j) => j !== i),
                              }))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {loadEditIndex !== null && payload.appliances[loadEditIndex] ? (
          <LoadDetailsEditDialog
            key={loadEditIndex}
            initialRow={payload.appliances[loadEditIndex]}
            onApply={(next) => {
              setPayload((p) => {
                const appliances = [...p.appliances];
                appliances[loadEditIndex] = next;
                return { ...p, appliances };
              });
              setLoadEditIndex(null);
            }}
            onClose={() => setLoadEditIndex(null)}
          />
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              System summary
            </h3>
            {!locked ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPayload((p) => ({
                    ...p,
                    systemSummary: [...p.systemSummary, emptySummaryRow()],
                  }))
                }
              >
                Add row
              </Button>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-2 py-2">Parameter</th>
                  <th className="px-2 py-2">Value</th>
                  <th className="px-2 py-2">Units</th>
                  {!locked ? <th className="px-2 py-2 w-16" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {payload.systemSummary.map((row, i) => (
                  <tr key={i}>
                    {(["parameter", "value", "units"] as const).map((key) => (
                      <td key={key} className="px-2 py-1">
                        <input
                          className="w-full min-w-[100px] rounded border border-gray-200 px-2 py-1 text-sm"
                          value={row[key]}
                          onChange={(e) =>
                            setPayload((p) => {
                              const systemSummary = [...p.systemSummary];
                              systemSummary[i] = {
                                ...row,
                                [key]: e.target.value,
                              };
                              return { ...p, systemSummary };
                            })
                          }
                        />
                      </td>
                    ))}
                    {!locked ? (
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() =>
                            setPayload((p) => ({
                              ...p,
                              systemSummary: p.systemSummary.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Cost lines
            </h3>
            {!locked ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPayload((p) => ({
                    ...p,
                    costLines: [...p.costLines, emptyCostRow()],
                  }))
                }
              >
                Add row
              </Button>
            ) : null}
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Total</th>
                  {!locked ? <th className="px-2 py-2 w-16" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {payload.costLines.map((row, i) => (
                  <tr key={i}>
                    {(["qty", "item", "amount", "totalAmount"] as const).map((key) => (
                      <td key={key} className="px-2 py-1">
                        <input
                          className="w-full min-w-[80px] rounded border border-gray-200 px-2 py-1 text-sm"
                          value={row[key]}
                          onChange={(e) =>
                            setPayload((p) => {
                              const costLines = [...p.costLines];
                              costLines[i] = { ...row, [key]: e.target.value };
                              return { ...p, costLines };
                            })
                          }
                        />
                      </td>
                    ))}
                    {!locked ? (
                      <td className="px-2 py-1">
                        <button
                          type="button"
                          className="text-xs text-red-600 hover:underline"
                          onClick={() =>
                            setPayload((p) => ({
                              ...p,
                              costLines: p.costLines.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Textarea
          label="Warranty"
          value={payload.warranty}
          onChange={(e) => setPayload((p) => ({ ...p, warranty: e.target.value }))}
          rows={4}
        />

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Timeline
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["delivery", "Delivery"],
                ["installation", "Installation"],
                ["testing", "Testing"],
                ["total", "Total duration"],
              ] as const
            ).map(([key, label]) => (
              <Input
                key={key}
                label={label}
                value={payload.timeline[key]}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    timeline: { ...p.timeline, [key]: e.target.value },
                  }))
                }
              />
            ))}
          </div>
        </section>

        <Textarea
          label="Terms"
          value={payload.terms}
          onChange={(e) => setPayload((p) => ({ ...p, terms: e.target.value }))}
          rows={6}
        />

        <Textarea
          label="Payment terms"
          value={payload.paymentTerms}
          onChange={(e) =>
            setPayload((p) => ({ ...p, paymentTerms: e.target.value }))
          }
          rows={4}
        />
      </div>

      {!locked ? (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <Button type="button" onClick={submitSave} disabled={savePending || sendPending}>
            {savePending ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={submitSend}
            disabled={savePending || sendPending}
          >
            {sendPending ? "Sending…" : "Send to client"}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
