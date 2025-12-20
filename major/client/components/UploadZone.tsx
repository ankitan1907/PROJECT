import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function UploadZone({ onFileSelect, disabled = false, loading = false }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !loading) {
      setDragActive(e.type === "dragenter" || e.type === "dragover");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || loading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      onFileSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && !preview) {
      inputRef.current?.click();
    }
  };

  if (preview) {
    return (
      <div className="relative rounded-lg border-2 border-medical-blue overflow-hidden bg-medical-light">
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-contain max-h-96"
        />
        <button
          onClick={handleRemove}
          disabled={disabled || loading}
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-medical-blue" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-sm font-medium truncate">{fileName}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-all cursor-pointer",
        "p-8 md:p-12 flex flex-col items-center justify-center",
        "bg-medical-light hover:bg-blue-50",
        dragActive && !disabled && !loading
          ? "border-medical-blue bg-blue-50 scale-105"
          : "border-medical-blue/30",
        (disabled || loading) && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || loading}
      />

      <div className="mb-4 p-3 bg-medical-blue/10 rounded-full">
        <Upload className="w-8 h-8 text-medical-blue" />
      </div>

      <h3 className="text-lg font-semibold text-medical-blue mb-2">
        Upload X-ray Image
      </h3>

      <p className="text-gray-600 text-center mb-4">
        Drag and drop your chest X-ray or click to select
      </p>

      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPG, PNG, DICOM
        <br />
        Maximum file size: 25MB
      </p>

      <div className="mt-6 text-center">
        <button
          className="px-6 py-2 bg-medical-blue text-white rounded-lg font-medium hover:bg-medical-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || loading}
        >
          Select File
        </button>
      </div>
    </div>
  );
}
