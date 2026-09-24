import React from "react";
import { Share2, Check, Copy, Sparkles } from "lucide-react";
import SocialLinks from "@/components/layout/SocialLinks";

interface MakePuzzleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  shareTitle?: string;
  shareSubtitle?: string;
  sharableLinkText?: string;
  linkCopiedNotice?: string;
}

export function MakePuzzleShareModal({
  isOpen,
  onClose,
  shareUrl,
  copied,
  onCopy,
  shareTitle,
  shareSubtitle,
  sharableLinkText,
  linkCopiedNotice,
}: MakePuzzleShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#dfba73] flex items-center justify-center font-black">
              <Share2 className="w-5 h-5 text-[#dfba73]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white font-cinzel">
                {shareTitle || "Share Your Puzzle"}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {shareSubtitle || "Anyone with this link can play this puzzle immediately"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target text-stone-400 hover:text-stone-900 dark:hover:text-white text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            {sharableLinkText || "Sharable Puzzle Link"}
          </label>
          <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-amber-600 dark:text-amber-300 font-mono w-full outline-none select-all"
            />
            <button
              type="button"
              onClick={onCopy}
              className="touch-target px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-[#dfba73] hover:brightness-105 text-stone-950 text-xs font-black transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Viral Social Share Buttons */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Share Instantly:
          </span>
          <div className="grid grid-cols-4 gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition text-[11px] font-semibold"
            >
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              <span>Facebook</span>
            </a>
            <a
              href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Play my custom puzzle on CunFashion! 🧩✨")}&via=cunfashion`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex flex-col items-center justify-center p-2 rounded-xl bg-stone-500/10 hover:bg-stone-500/20 text-stone-800 dark:text-stone-200 border border-stone-500/20 transition text-[11px] font-semibold"
            >
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <span>X</span>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Play my custom puzzle on CunFashion! " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition text-[11px] font-semibold"
            >
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              <span>WhatsApp</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Play my custom puzzle on CunFashion!")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target flex flex-col items-center justify-center p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition text-[11px] font-semibold"
            >
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg>
              <span>Telegram</span>
            </a>
          </div>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
          <Sparkles className="w-4 h-4 text-[#dfba73] shrink-0" />
          <span>
            {linkCopiedNotice || "Link copied to clipboard! Share it with your friends via WhatsApp, Messenger, Telegram..."}
          </span>
        </div>

        <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
            Follow CunFashion:
          </span>
          <SocialLinks size="sm" />
        </div>
      </div>
    </div>
  );
}
