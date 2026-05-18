import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-20 md:pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10 animate-pulse">
          {/* Breadcrumbs Skeleton */}
          <div className="h-3 w-48 bg-slate-100 rounded mb-8 md:mb-12" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
            {/* Left Image Gallery Skeleton */}
            <div className="lg:col-span-7 space-y-4 md:space-y-8">
              <div className="relative aspect-[4/5] bg-slate-50 rounded flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-blue/30 animate-spin" />
              </div>
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 aspect-[4/5] bg-slate-50 rounded" />
                ))}
              </div>
            </div>

            {/* Right Information Column Skeleton */}
            <div className="lg:col-span-5 space-y-8">
              {/* Tagline and Name */}
              <div className="space-y-4">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-8 md:h-12 w-4/5 bg-slate-100 rounded" />
                <div className="h-6 w-32 bg-slate-100 rounded" />
              </div>

              {/* Color Selector Placeholder */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="flex gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-150" />
                  ))}
                </div>
              </div>

              {/* Sizes Selector Placeholder */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="flex gap-2">
                  {["XS", "S", "M", "L", "XL"].map((size) => (
                    <div key={size} className="w-12 h-12 bg-slate-50 border border-slate-150 flex items-center justify-center text-[10px] text-slate-300 font-bold" />
                  ))}
                </div>
              </div>

              {/* Main Call to Action Button */}
              <div className="pt-6 space-y-4">
                <div className="h-14 w-full bg-slate-100 rounded" />
                <div className="flex gap-4">
                  <div className="h-10 flex-1 bg-slate-50 border border-slate-100 rounded" />
                  <div className="h-10 flex-1 bg-slate-50 border border-slate-100 rounded" />
                </div>
              </div>

              {/* Description blocks placeholder */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                {[1, 2].map((i) => (
                  <div key={i} className="h-5 w-full bg-slate-50 border border-slate-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
