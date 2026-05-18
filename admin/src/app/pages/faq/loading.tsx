import React from "react";

export default function FaqLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-150 rounded" />
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-100 rounded" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
          <div className="h-4 w-1/3 bg-slate-150 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-50 border border-[#e3e8ee] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-[#e3e8ee] rounded-lg p-6 space-y-4">
            <div className="h-4 w-1/3 bg-slate-150 rounded" />
            <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
