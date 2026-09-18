"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,.pdf,.xlsx,.xls,.dwg,.dxf",
  maxSize = 15,
  className,
  label = "Upload file",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowed = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isAllowed) {
      setError('File type not allowed');
      return;
    }

    setError("");
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError("");
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      
      {!selectedFile ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-line bg-paper p-3">
          <FileText className="h-4 w-4 text-slate" />
          <span className="flex-1 truncate text-sm text-navy">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}