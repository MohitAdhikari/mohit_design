import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-mono uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          404 — Lost in the meta
        </div>
        <h1 className="text-6xl md:text-8xl font-black font-space-grotesk tracking-tighter text-gray-900 dark:text-white mb-4">
          404
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-sans leading-relaxed mb-8">
          The page you were looking for doesn&apos;t exist or has been moved. Try searching or head back home.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-[#00E5FF] dark:hover:bg-[#00C4DD] text-white dark:text-[#0B0B0F] font-bold uppercase tracking-widest text-xs transition-colors min-w-[180px]"
          >
            Go Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors min-w-[180px]"
          >
            Search
          </Link>
        </div>
      </div>
    </div>
  );
}
