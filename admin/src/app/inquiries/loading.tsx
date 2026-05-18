import React from "react";

export default function InquiriesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-150 rounded" />
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-100 rounded" />
          <div className="h-8 w-28 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-11 w-full bg-slate-50 border border-[#e3e8ee] rounded-lg" />

      {/* Table Skeleton */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm">
        {/* Table Header Placeholder */}
        <div className="px-6 py-4 bg-[#f7f8f9] border-b border-[#e3e8ee] flex items-center justify-between">
          <div className="h-3.5 w-32 bg-slate-200 rounded" />
          <div className="h-3.5 w-48 bg-slate-150 rounded" />
          <div className="h-3.5 w-16 bg-slate-150 rounded" />
          <div className="h-3.5 w-24 bg-slate-150 rounded" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
        </div>

        {/* Table Rows Placeholder (5 rows) */}
        <div className="divide-y divide-[#e3e8ee]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-6 py-5 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-[#e3e8ee]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-slate-150 rounded" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-48 h-10 bg-slate-50 border border-slate-100 rounded" />
              <div className="w-16 h-6 bg-slate-50 border border-[#e3e8ee] rounded-full" />
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="w-16 h-8 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
