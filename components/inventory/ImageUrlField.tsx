"use client";

import { useState } from "react";

export function ImageUrlField({
  name = "image",
  label = "Product image",
  defaultValue = "",
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
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
      <p className="block text-sm font-medium text-gray-700">{label}</p>
      <input type="hidden" name={name} value={value ?? ""} readOnly />
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
        {value && status !== "uploading" && (
          <span className="text-xs text-green-700">Image uploaded.</span>
        )}
      </div>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Product preview"
          className="h-24 w-24 rounded-md border border-gray-200 object-cover"
        />
      ) : (
        <p className="text-xs text-gray-500">
          Choose an image from your device to upload.
        </p>
      )}
    </div>
  );
}
