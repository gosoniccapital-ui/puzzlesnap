import React, { useRef } from "react";
import { Upload } from "lucide-react";

interface MakePuzzleDropzoneProps {
  onFileSelect: (file: File) => void;
}

export function MakePuzzleDropzone({ onFileSelect }: MakePuzzleDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#dfba73] rounded-2xl p-10 sm:p-12 text-center cursor-pointer transition bg-stone-50/70 dark:bg-stone-950/40 hover:bg-stone-100/70 dark:hover:bg-stone-900/40 flex flex-col items-center justify-center gap-4 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#dfba73] flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-2xs">
        <Upload className="w-8 h-8 text-[#dfba73]" />
      </div>
      <div>
        <p className="text-sm sm:text-base font-bold text-stone-800 dark:text-stone-200">
          Click to browse or drag and drop your photo here
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
          Supports PNG, JPG, WEBP, GIF up to 50MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
