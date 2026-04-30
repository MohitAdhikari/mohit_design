export default function LivePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12 border-b border-gray-800 pb-6 flex items-center gap-4">
        <h1 className="text-5xl font-black font-space-grotesk tracking-tighter uppercase text-white">Live Hub</h1>
        <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse mt-2"></span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 border border-gray-900 bg-[#0a0a0a] p-4 h-fit">
          <div className="aspect-video w-full bg-black flex items-center justify-center border border-gray-800">
            <p className="text-gray-500 font-mono tracking-widest uppercase text-sm">Stream Offline</p>
          </div>
          <div className="mt-6">
            <h2 className="text-2xl font-bold font-space-grotesk">PHONEOCEAN TV</h2>
            <p className="text-gray-400 mt-2 text-sm">24/7 Esports Coverage and Daily Shows</p>
          </div>
        </div>

        <div className="border border-gray-900 bg-[#0a0a0a] p-6 h-fit">
          <h3 className="text-xl font-bold font-space-grotesk uppercase border-b border-gray-800 pb-4 mb-4">Stream Schedule</h3>
          <ul className="space-y-4 font-mono text-sm max-w-full overflow-hidden">
            <li className="flex justify-between items-center bg-[#050505] p-3 border border-gray-800">
              <span className="text-gray-300">Daily Scrims</span>
              <span className="text-blue-500">14:00 EST</span>
            </li>
            <li className="flex justify-between items-center bg-[#050505] p-3 border border-gray-800">
              <span className="text-gray-300">Podcast</span>
              <span className="text-blue-500">Wed 18:00 EST</span>
            </li>
            <li className="flex justify-between items-center bg-[color:var(--fallback-b1,oklch(var(--b1)))] p-3 border border-gray-800 text-gray-500">
              <span>Tournament</span>
              <span>TBA</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
