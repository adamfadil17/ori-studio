"use client";

import { OpenPosition } from "@/lib/data/open-positions";
import { useEffect } from "react";

interface OpenPositionModalDict {
  positionType: string;
  positionLevel: string;
  applyForPosition: string;
  closeModal: string;
}

interface OpenPositionModalProps {
  position: OpenPosition;
  dict: OpenPositionModalDict;
  onClose: () => void;
  onApply: (position: OpenPosition) => void;
}

export default function OpenPositionModal({
  position,
  dict,
  onClose,
  onApply,
}: OpenPositionModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="open-position-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-headline/60 px-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto bg-background-main p-8 md:p-10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="open-position-modal-title"
              className="font-serif text-2xl text-headline"
            >
              {position.title}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs tracking-widest uppercase text-eyebrow">
              <span className="border border-eyebrow/40 px-3 py-1">
                {dict.positionType}: {position.type}
              </span>
              <span className="border border-eyebrow/40 px-3 py-1">
                {dict.positionLevel}: {position.level}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={dict.closeModal}
            className="shrink-0 text-headline transition-opacity hover:opacity-60 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eyebrow"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-body">
          {position.desc}
        </p>

        <button
          type="button"
          onClick={() => onApply(position)}
          className="mt-8 bg-headline px-8 py-3 text-xs tracking-widest uppercase text-background-main transition-opacity hover:opacity-90 hover:cursor-pointer"
        >
          {dict.applyForPosition}
        </button>
      </div>
    </div>
  );
}
