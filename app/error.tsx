"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

function isTransientMongoNetworkError(message: string): boolean {
  return (
    message.includes("querySrv") ||
    message.includes("ESERVFAIL") ||
    message.includes("ENOTFOUND") ||
    message.includes("EAI_AGAIN") ||
    message.includes("MongoServerSelectionError")
  );
}

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isTransientMongoNetworkError(error.message)) {
      console.warn("[app/error] transient database network error:", error.message);
      return;
    }
    console.error(error);
  }, [error]);
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-sm text-gray-600 mt-2 max-w-md">{error.message}</p>
      <div className="mt-6 flex gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
