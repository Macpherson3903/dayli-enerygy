"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SavedSizingPrintButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      className="gap-2 print:hidden no-print"
      onClick={() => {
        const body = document.body;
        const cleanup = () => {
          body.classList.remove("sizing-print-mode");
          window.removeEventListener("afterprint", cleanup);
        };
        body.classList.add("sizing-print-mode");
        window.addEventListener("afterprint", cleanup);
        window.print();
        window.setTimeout(cleanup, 1000);
      }}
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print
    </Button>
  );
}
