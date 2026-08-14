function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-emerald-950/10 ${className}`}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md border border-emerald-950/10 bg-white p-5 shadow-sm shadow-emerald-950/5"
          >
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="mt-5 h-7 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-md border border-emerald-950/10 bg-white p-5 shadow-sm shadow-emerald-950/5">
        <div className="flex items-center justify-between gap-4">
          <SkeletonBlock className="h-5 w-44" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="grid grid-cols-12 gap-3">
              <SkeletonBlock className="col-span-5 h-4" />
              <SkeletonBlock className="col-span-2 h-4" />
              <SkeletonBlock className="col-span-3 h-4" />
              <SkeletonBlock className="col-span-2 h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AppLayoutSkeleton() {
  return (
    <div
      className="min-h-screen w-full text-stone-950 lg:flex"
      aria-busy="true"
      aria-live="polite"
    >
      <aside className="opsn-sidebar-panel sticky top-3 my-3 ml-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar p-4 shadow-sm shadow-emerald-950/5 lg:flex">
        <SkeletonBlock className="h-8 w-20" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <SkeletonBlock className="h-9 w-9 shrink-0" />
              <SkeletonBlock className="h-4 w-28" />
            </div>
          ))}
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="mx-3 mt-4 rounded-2xl border border-sidebar-border bg-sidebar/85 px-4 py-3 shadow-sm shadow-emerald-950/5 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-9 w-9" />
              <SkeletonBlock className="h-7 w-36" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="hidden h-10 w-32 sm:block" />
              <SkeletonBlock className="h-10 w-10" />
            </div>
          </div>
        </header>
        <div className="mx-auto mt-4 max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
          <PageSkeleton />
        </div>
      </main>
    </div>
  );
}
