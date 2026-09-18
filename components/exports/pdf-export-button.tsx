"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { useState } from "react";

interface PdfExportButtonProps {
  onExport: () => Promise<void>;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export function PdfExportButton({
  onExport,
  label = "Export PDF",
  disabled = false,
  variant = "outline",
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <>
          <FileText className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}