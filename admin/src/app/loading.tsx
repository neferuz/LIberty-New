import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Title & Breadcrumbs Skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-32 bg-slate-100 rounded" />
        <div className="h-8 w-64 bg-slate-150 rounded" />
      </div>

      {/* Stats Grid Skeleton (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white border border-[#e3e8ee] rounded-xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-[#e3e8ee]" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-24 bg-slate-150 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Table / Content Block Skeleton */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm">
        {/* Table Header Placeholder */}
        <div className="px-6 py-4 bg-[#f7f8f9] border-b border-[#e3e8ee] flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-8 w-24 bg-slate-100 rounded" />
        </div>

        {/* Table Rows Placeholder (5 rows) */}
        <div className="divide-y divide-[#e3e8ee]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-6 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#e3e8ee]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-slate-150 rounded" />
                  <div className="h-3 w-1/6 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="w-16 h-6 bg-slate-50 border border-[#e3e8ee] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
