"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AccountError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-red-800">Account error</h1>
      <p className="text-sm text-gray-600 mt-1">{error.message}</p>
      <div className="mt-4 flex gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
