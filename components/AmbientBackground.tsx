/**
 * Fixed, decorative animated background layer.
 * Renders behind all content (z-[-1]) and is purely presentational.
 * Uses slow-moving aurora blobs + a masked grid for depth.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Masked grid texture */}
      <div className="absolute inset-0 bg-grid opacity-70" />

      {/* Aurora blobs — cyan */}
      <div className="animate-aurora absolute -top-40 -left-32 w-[45rem] h-[45rem] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.10),transparent_60%)] blur-3xl" />
      {/* Aurora blobs — purple */}
      <div
        className="animate-aurora absolute top-1/3 -right-40 w-[42rem] h-[42rem] rounded-full bg-[radial-gradient(circle,rgba(157,0,255,0.10),transparent_60%)] blur-3xl"
        style={{ animationDelay: '-7s' }}
      />
      {/* Aurora blobs — green (bottom) */}
      <div
        className="animate-aurora absolute -bottom-48 left-1/4 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,rgba(0,255,102,0.06),transparent_60%)] blur-3xl"
        style={{ animationDelay: '-14s' }}
      />
    </div>
  );
}
