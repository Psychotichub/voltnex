"use client";

import { Input } from "@/components/ui/field";
import { formatNPR } from "@/lib/money";
import { useState, useEffect } from "react";

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange"> {
  value?: number | string;
  onChange?: (value: number) => void;
  currencySymbol?: string;
}

export function CurrencyInput({ 
  value = "", 
  onChange, 
  currencySymbol = "Rs.",
  className,
  ...props 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (typeof value === "number") {
      setDisplayValue(formatNPR(value));
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(rawValue);
    
    const numericValue = parseFloat(rawValue) || 0;
    onChange?.(numericValue);
  };

  const handleBlur = () => {
    if (displayValue) {
      const numericValue = parseFloat(displayValue) || 0;
      setDisplayValue(formatNPR(numericValue));
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate">
        {currencySymbol}
      </span>
      <Input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`pl-8 ${className || ""}`}
      />
    </div>
  );
}