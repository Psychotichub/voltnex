"use client";

import { Input } from "@/components/ui/field";
import { useState, useEffect } from "react";

interface PercentInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "onChange"> {
  value?: number | string;
  onChange?: (value: number) => void;
}

export function PercentInput({ 
  value = "", 
  onChange, 
  className,
  ...props 
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (typeof value === "number") {
      setDisplayValue(`${value}%`);
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
      setDisplayValue(`${numericValue}%`);
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`pr-8 ${className || ""}`}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate">
        %
      </span>
    </div>
  );
}