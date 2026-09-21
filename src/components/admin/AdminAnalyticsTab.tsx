"use client";

import React from "react";
import {
  FileSpreadsheet,
  Clock,
  ShoppingBag,
  Search,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { AdminAnalyticsData } from "./types";

interface AdminAnalyticsTabProps {
  analyticsData: AdminAnalyticsData | null;
  loadingAnalytics: boolean;
  isExportingCsv: boolean;
  isExportingOrdersCsv: boolean;
  onExportCsv: () => void;
  onExportOrdersCsv: () => void;
  onRefreshAnalytics: () => void;
}

export default function AdminAnalyticsTab({
  analyticsData,
  loadingAnalytics,
  isExportingCsv,
  isExportingOrdersCsv,
  onExportCsv,
  onExportOrdersCsv,
  onRefreshAnalytics,
}: AdminAnalyticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-black">
              📈
            </span>
            <span>Bảng Điều Khiển Chuyển Đổi Affiliate (Conversion Dashboard)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Thống kê thời gian thực số lượt click vào các sàn liên kết quốc tế (Amazon US StoreID cuncute-20, Rakuten Brands, CunCute Merch Store USD).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportCsv}
            disabled={isExportingCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            title="Tải toàn bộ nhật ký click affiliate định dạng CSV"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isExportingCsv ? "animate-bounce" : ""}`} />
            <span>{isExportingCsv ? "Đang xuất CSV..." : "Xuất dữ liệu CSV"}</span>
          </button>

          <button
            onClick={onExportOrdersCsv}
            disabled={isExportingOrdersCsv}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            title="Tải toàn bộ nhật ký đơn hàng đối soát chuyển đổi định dạng CSV"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isExportingOrdersCsv ? "animate-bounce" : ""}`} />
            <span>{isExportingOrdersCsv ? "Đang xuất..." : "Xuất Đơn Hàng CSV"}</span>
          </button>

          <button
            onClick={onRefreshAnalytics}
            disabled={loadingAnalytics}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <Clock className={`w-3.5 h-3.5 ${loadingAnalytics ? "animate-spin" : ""}`} />
            <span>Làm mới số liệu</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards Row 1: Clicks & Platform Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Tổng lượt Click
          </p>
          <p className="text-3xl font-black text-stone-900 mt-1">
            {analyticsData?.totalClicks ?? 0}
          </p>
          <p className="text-[11px] text-pink-600 font-semibold mt-0.5">
            Tất cả sàn mua sắm
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Amazon US (cuncute-20)
            </p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
              {analyticsData?.totalClicks
                ? Math.round(((analyticsData.platforms["Amazon"] || 0) / analyticsData.totalClicks) * 100)
                : 0}
              %
            </span>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-1">
            {analyticsData?.platforms["Amazon"] ?? 0}
          </p>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Hoa hồng USD Associates
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Rakuten Brands
            </p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-900">
              {analyticsData?.totalClicks
                ? Math.round(((analyticsData.platforms["Rakuten"] || 0) / analyticsData.totalClicks) * 100)
                : 0}
              %
            </span>
          </div>
          <p className="text-3xl font-black text-red-600 mt-1">
            {analyticsData?.platforms["Rakuten"] ?? 0}
          </p>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
            LinkShare Deeplink
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              CunCute Merch Store
            </p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-900">
              {analyticsData?.totalClicks
                ? Math.round(
                    ((analyticsData.platforms["CunCute Store"] || 0) /
                      analyticsData.totalClicks) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <p className="text-3xl font-black text-pink-600 mt-1">
            {analyticsData?.platforms["CunCute Store"] || 0}
          </p>
          <p className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Fourthwall Global USD
          </p>
        </div>
      </div>

      {/* Metric KPI Cards Row 2: Postback Orders & Commission KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs bg-gradient-to-br from-purple-50/50 to-white">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
            🎯 Đơn Hàng Thành Công
          </p>
          <p className="text-3xl font-black text-purple-900 mt-1">
            {analyticsData?.totalConversions ?? 0}
          </p>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">
            Khớp qua Postback Webhook
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-gradient-to-br from-emerald-50/50 to-white">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            💰 Hoa Hồng Ước Tính
          </p>
          <p className="text-3xl font-black text-emerald-900 mt-1">
            ${analyticsData?.totalCommission?.toLocaleString() ?? 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Từ các sàn đối tác
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs bg-gradient-to-br from-blue-50/50 to-white">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
            🛍️ Doanh Thu Đơn Hàng
          </p>
          <p className="text-3xl font-black text-blue-900 mt-1">
            ${analyticsData?.totalRevenue?.toLocaleString() ?? 0}
          </p>
          <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
            Tổng GMV phát sinh
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-pink-200 shadow-xs bg-gradient-to-br from-pink-50/50 to-white">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-700">
            📊 Tỉ Lệ Chuyển Đổi (CR)
          </p>
          <p className="text-3xl font-black text-pink-900 mt-1">
            {analyticsData?.conversionRate ?? 0}%
          </p>
          <p className="text-[11px] text-pink-600 font-semibold mt-0.5">
            {analyticsData?.totalConversions ?? 0} đơn / {analyticsData?.totalClicks ?? 0} clicks
          </p>
        </div>
      </div>

      {/* Top Products & Top Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-600" />
              <span>Top Sản Phẩm Chuyển Đổi Cao Nhất</span>
            </h3>
            <span className="text-[11px] font-semibold text-stone-400">Lượt click</span>
          </div>

          {analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
            <div className="space-y-2.5">
              {analyticsData.topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-800 truncate" title={prod.productName}>
                        {prod.productName}
                      </p>
                      <span className="text-[10px] font-semibold text-stone-500">
                        Sàn: {prod.platform}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-800 font-extrabold text-xs shrink-0">
                    {prod.count} clicks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic py-4 text-center">
              Chưa có đủ dữ liệu lượt click sản phẩm.
            </p>
          )}
        </div>

        {/* Top Keywords */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              <span>Top Từ Khóa Sinh Chuyển Đổi</span>
            </h3>
            <span className="text-[11px] font-semibold text-stone-400">Tần suất</span>
          </div>

          {analyticsData?.topKeywords && analyticsData.topKeywords.length > 0 ? (
            <div className="space-y-2.5">
              {analyticsData.topKeywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      &quot;{kw.keyword}&quot;
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-xs">
                    {kw.count} lượt
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic py-4 text-center">
              Chưa có đủ dữ liệu từ khóa tìm kiếm.
            </p>
          )}
        </div>
      </div>

      {/* Recent Live Click Stream */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Nhật Ký Click Trực Tiếp (Live Click Stream)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Hiển thị 20 lượt click affiliate mới nhất từ người dùng.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
            {analyticsData?.recentClicks.length ?? 0} sự kiện gần nhất
          </span>
        </div>

        {analyticsData?.recentClicks && analyticsData.recentClicks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Sàn mua sắm</th>
                  <th className="py-2.5 px-3">Tên sản phẩm</th>
                  <th className="py-2.5 px-3">Từ khóa</th>
                  <th className="py-2.5 px-3">Thiết bị</th>
                  <th className="py-2.5 px-3 text-right">Link đích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {analyticsData.recentClicks.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 text-[11px] font-mono">
                      {new Date(c.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.platform === "Amazon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : c.platform === "Rakuten"
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : c.platform === "CunCute Store"
                            ? "bg-pink-100 text-pink-900 border border-pink-300"
                            : "bg-stone-100 text-stone-800 border border-stone-200"
                        }`}
                      >
                        {c.platform}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900 max-w-xs truncate" title={c.product_name}>
                      {c.product_name}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">
                      {c.keyword ? (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {c.keyword}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                      {c.device_type || "Desktop"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <a
                        href={c.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-800 font-bold inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Mở link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic py-6 text-center">
            Chưa có nhật ký lượt click nào được ghi nhận.
          </p>
        )}
      </div>

      {/* Recent Live Conversions / Orders Stream */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Nhật Ký Đơn Hàng Tiếp Thị (Live Postback Conversion Stream)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Hiển thị 20 đơn hàng mới nhất nhận qua Postback Webhook tự động khớp mã đơn.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {analyticsData?.recentConversions?.length ?? 0} đơn hàng gần nhất
          </span>
        </div>

        {analyticsData?.recentConversions && analyticsData.recentConversions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-y border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Mã đơn (Order ID)</th>
                  <th className="py-2.5 px-3">Sàn</th>
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-3">Giá trị đơn</th>
                  <th className="py-2.5 px-3">Hoa hồng</th>
                  <th className="py-2.5 px-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {analyticsData.recentConversions.map((conv) => (
                  <tr key={conv.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 text-[11px] font-mono">
                      {new Date(conv.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-800 text-[11px]">
                      {conv.order_id}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          conv.platform === "Amazon"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : conv.platform === "Rakuten"
                            ? "bg-red-100 text-red-900 border border-red-300"
                            : conv.platform === "CunCute Store"
                            ? "bg-pink-100 text-pink-900 border border-pink-300"
                            : "bg-stone-100 text-stone-800 border border-stone-200"
                        }`}
                      >
                        {conv.platform}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900 max-w-xs truncate" title={conv.product_name || "Sản phẩm affiliate"}>
                      {conv.product_name || `Item #${conv.product_id || conv.id.slice(-4)}`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      {conv.currency} {conv.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-black text-emerald-600">
                      +{conv.currency} {conv.commission.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          conv.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : conv.status === "pending"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {conv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic py-6 text-center">
            Chưa có đơn hàng nào được ghi nhận qua postback webhook.
          </p>
        )}
      </div>
    </div>
  );
}
