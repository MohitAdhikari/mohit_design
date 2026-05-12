export default function Loading() {
  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          <div className="rounded-2xl bg-gray-100 dark:bg-[#13131A] h-[400px] md:h-[500px] animate-pulse" />
          <div className="grid grid-cols-1 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-5 p-4 rounded-2xl border border-gray-200 dark:border-gray-800/40 bg-white dark:bg-[#0E0E12]">
                <div className="w-40 aspect-video rounded-xl bg-gray-100 dark:bg-[#15151C] animate-pulse" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-3 w-24 bg-gray-100 dark:bg-[#15151C] rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-100 dark:bg-[#15151C] rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-100 dark:bg-[#15151C] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-[#13131A] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
