"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { useState } from "react";

interface ExcelExportButtonProps {
  onExport: () => Promise<void>;
  label?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export function ExcelExportButton({
  onExport,
  label = "Export Excel",
  disabled = false,
  variant = "outline",
}: ExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } catch (error) {
      console.error("Excel export failed:", error);
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
          <FileSpreadsheet className="h-4 w-4 animate-spin" />
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