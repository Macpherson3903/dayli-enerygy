"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStatusMessage } from "@/context/StatusMessageContext";

export function ProposalApproveClient({ token }: { token: string }) {
  const { showStatusMessage } = useStatusMessage();
  const [signerName, setSignerName] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      showStatusMessage("Please confirm that you accept the proposal.", "error");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/proposals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signerName: signerName.trim(), consent: true }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        showStatusMessage(data.message ?? "Could not submit approval.", "error");
        return;
      }
      setDone(true);
      showStatusMessage(data.message ?? "Thank you.", "success");
    } catch {
      showStatusMessage("Network error. Please try again.", "error");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        Your approval has been recorded. We will follow up with next steps.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900">Approve this proposal</h2>
      <p className="text-sm text-gray-600">
        Type your full name and confirm below. This constitutes your acceptance of the proposal
        as shown.
      </p>
      <Input
        label="Your full name"
        name="signerName"
        value={signerName}
        onChange={(e) => setSignerName(e.target.value)}
        required
        autoComplete="name"
      />
      <label className="flex items-start gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded border-gray-300"
        />
        <span>I have reviewed the proposal and agree to proceed on the terms stated.</span>
      </label>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit approval"}
      </Button>
    </form>
  );
}
