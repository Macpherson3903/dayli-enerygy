"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";

export function ImageUrlField({
  name = "image",
  label = "Image URL",
  defaultValue = "",
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [err, setErr] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setStatus("uploading");
    setErr("");
    const fd = new FormData();
    fd.set("file", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!r.ok) {
      setStatus("error");
      setErr(j.error ?? "Upload failed");
      return;
    }
    if (j.url) {
      setValue(j.url);
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <Input
        name={name}
        label={label}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        hint="Upload an image, or paste a /public or https URL"
      />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={onFileChange}
          disabled={status === "uploading"}
        />
        {status === "uploading" && (
          <span className="text-xs text-gray-500">Uploading…</span>
        )}
      </div>
    </div>
  );
}
