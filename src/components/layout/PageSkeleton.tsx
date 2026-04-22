export function PageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-7 w-48 rounded-md bg-base-300/70 mb-2" />
      <div className="h-4 w-72 rounded-md bg-base-200 mb-8" />
      <div className="rounded-xl border border-base-200 bg-base-100 p-5 space-y-3">
        <div className="h-4 w-32 rounded bg-base-200" />
        <div className="h-10 rounded-lg bg-base-200" />
        <div className="h-4 w-40 rounded bg-base-200" />
        <div className="h-10 rounded-lg bg-base-200" />
        <div className="h-10 rounded-lg bg-base-300/70" />
      </div>
    </div>
  )
}
