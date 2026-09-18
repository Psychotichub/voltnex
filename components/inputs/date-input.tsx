"use client";

import { Input } from "@/components/ui/field";
import { useState, useEffect } from "react";

interface DateInputProps extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> {
  value?: Date | string;
  onChange?: (value: Date) => void;
}

export function DateInput({ 
  value, 
  onChange, 
  className,
  ...props 
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value instanceof Date) {
      setDisplayValue(value.toISOString().split('T')[0]);
    } else if (typeof value === "string") {
      setDisplayValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange?.(date);
    }
  };

  return (
    <Input
      {...props}
      type="date"
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  );
}