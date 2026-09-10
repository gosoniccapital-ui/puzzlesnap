"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/brand/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from") || "/admin";

  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || loading) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        // Successful login: navigate to intended destination
        router.push(fromUrl);
        router.refresh();
      } else {
        setErrorMsg(json.error || "Mật mã quản trị không chính xác.");
        if (typeof json.remainingAttempts === "number") {
          setRemainingAttempts(json.remainingAttempts);
        }
      }
    } catch {
      setErrorMsg("Không thể kết nối tới máy chủ xác thực. Vui lòng kiểm tra lại mạng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand & Badge Header */}
      <div className="text-center mb-8">
        <div className="inline-flex justify-center mb-4">
          <Logo />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Admin Security Gate
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900">
          Cổng Xác Thực Quản Trị
        </h1>
        <p className="text-xs text-stone-500 font-medium mt-1">
          Nhập mã bảo mật để truy cập bảng điều khiển CunFashion
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xl p-7 sm:p-8 backdrop-blur-md">
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{errorMsg}</p>
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <p className="text-[11px] text-red-600/80 mt-0.5 font-medium">
                  Bạn còn {remainingAttempts} lần thử trước khi bị khóa tạm thời.
                </p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Mã Bảo Mật Quản Trị (Passcode)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                required
                autoFocus
                disabled={loading}
                className="w-full pl-10 pr-11 py-3 text-sm bg-stone-50/80 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#ffb703] focus:border-transparent transition text-stone-900 font-medium placeholder-stone-400 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                title={showPassword ? "Ẩn mật mã" : "Hiện mật mã"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-[#ffb703] hover:bg-[#e0a102] active:scale-[0.99] text-stone-950 font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Xác Thực & Vào Quản Trị</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition group-hover:-translate-x-0.5" />
            <span>Quay lại trang chủ CunFashion</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[11px] text-stone-400 font-medium">
          CunFashion Haute Couture &bull; Enterprise Security &bull; Sprint 6.1
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf7] text-stone-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-stone-300/30 blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Đang tải cổng bảo mật...
            </p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
