"use client";

import React from "react";

export interface PuzzlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageSrc: string;
}

export default function PuzzlePreviewModal({
  isOpen,
  onClose,
  title,
  imageSrc,
}: PuzzlePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-4 rounded-3xl max-w-2xl max-h-[85vh] border border-stone-200 shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-base font-extrabold text-stone-900 mb-3">{title}</h4>
        <img
          src={imageSrc}
          alt={title}
          className="max-h-[65vh] w-auto object-contain rounded-xl border border-stone-100 shadow-md"
        />
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition cursor-pointer"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
}
