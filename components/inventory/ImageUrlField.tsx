"use client";

import { useEffect, useRef, useState } from "react";

export function ImageUrlField({
  name = "image",
  label = "Product image",
  defaultValue = "",
  required = true,
}: {
  name?: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initial = defaultValue?.trim() ?? "";
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [err, setErr] = useState("");
  const hiddenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value = value;
    }
  }, [value]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setStatus("uploading");
    setErr("");
    const fd = new FormData();
    fd.set("file", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = (await r.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };
    if (!r.ok) {
      setStatus("error");
      setErr(
        j.error ??
          (r.status === 501
            ? "Image upload is not configured. Add Cloudinary env vars on Vercel."
            : "Upload failed")
      );
      return;
    }
    if (j.url) {
      setValue(j.url);
      setStatus("idle");
      setErr("");
    }
  }

  useEffect(() => {
    if (!required) return;
    const form = hiddenRef.current?.form;
    if (!form) return;

    function handleSubmit(e: Event) {
      const current =
        hiddenRef.current?.value?.trim() ?? value.trim();
      if (!current) {
        e.preventDefault();
        setErr("Upload an image before saving.");
      }
    }

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, [required, value]);

  return (
    <div className="space-y-2">
      <p className="block text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </p>
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={initial}
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
          Choose an image from your device. It is stored on Cloudinary when upload
          is configured.
        </p>
      )}
    </div>
  );
}
