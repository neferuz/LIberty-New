import React from "react";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-150 rounded" />
          <div className="h-3.5 w-64 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-100 rounded" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center">
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="p-5 space-y-4">
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              </div>
              <div className="h-16 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          </div>
          <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center">
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="p-5 space-y-4">
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
              <div className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#e3e8ee] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-[#f7f8f9] border-b border-[#e3e8ee] h-10 flex items-center justify-between">
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-100 rounded" />
            </div>
            <div className="p-5 space-y-6">
              {[1, 2].map((sec) => (
                <div key={sec} className="space-y-3">
                  <div className="h-4 w-1/4 bg-slate-150 rounded" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((link) => (
                      <div key={link} className="h-10 bg-slate-50 border border-[#e3e8ee] rounded" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
