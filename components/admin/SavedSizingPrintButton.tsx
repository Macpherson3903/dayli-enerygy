"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { afterNextPaint, runSizingPrint } from "@/lib/after-paint";

export function SavedSizingPrintButton() {
  const [printing, setPrinting] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className="gap-2 print:hidden no-print"
      pending={printing}
      onClick={() => {
        setPrinting(true);
        afterNextPaint(() => {
          runSizingPrint();
          setPrinting(false);
        });
      }}
    >
      <Printer className="h-4 w-4" aria-hidden />
      Print
    </Button>
  );
}
