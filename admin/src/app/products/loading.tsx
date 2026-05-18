import React from "react";

export default function ProductsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-150 rounded" />
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-100 rounded" />
          <div className="h-8 w-28 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Dynamic Tabs Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#e3e8ee] pb-3">
        <div className="flex gap-6 overflow-x-auto w-full md:w-auto pb-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-16 bg-slate-100 rounded" />
          ))}
        </div>
        <div className="h-8 w-64 bg-slate-50 border border-[#e3e8ee] rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl overflow-hidden shadow-sm">
        {/* Table Header Placeholder */}
        <div className="px-6 py-3.5 bg-[#f7f8f9] border-b border-[#e3e8ee] flex items-center justify-between">
          <div className="h-3.5 w-32 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-150 rounded" />
          <div className="h-3.5 w-24 bg-slate-150 rounded" />
          <div className="h-3 w-8 bg-slate-100 rounded" />
        </div>

        {/* Table Rows Placeholder (5 rows) */}
        <div className="divide-y divide-[#e3e8ee]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-6 py-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-[#e3e8ee]" />
                <div className="h-4 w-48 bg-slate-150 rounded" />
              </div>
              <div className="w-24 h-4 bg-slate-100 rounded" />
              <div className="w-32 h-4 bg-slate-100 rounded" />
              <div className="w-6 h-4 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
