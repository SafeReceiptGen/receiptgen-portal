export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative w-48 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 px-4 pb-4 pt-4 shadow-sm">

        {/* Shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Receipt top notch */}
        <div className="mb-3 flex justify-center">
          <div className="h-1 w-10 rounded-full bg-neutral-200" />
        </div>

        {/* Merchant avatar + name */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-16 rounded bg-neutral-200" />
            <div className="h-2 w-10 rounded bg-neutral-200" />
          </div>
        </div>

        {/* Divider — jagged receipt cut */}
        <div
          className="mb-4 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #e5e5e5 0, #e5e5e5 4px, transparent 4px, transparent 8px)",
          }}
        />

        {/* Line items */}
        <div className="mb-4 flex flex-col gap-2.5">
          {[80, 56, 68].map((w) => (
            <div key={w} className="flex items-center justify-between">
              <div className="h-2 rounded bg-neutral-200" style={{ width: w }} />
              <div className="h-2 w-8 rounded bg-neutral-200" />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="mb-4 h-px w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #e5e5e5 0, #e5e5e5 4px, transparent 4px, transparent 8px)",
          }}
        />

        {/* Total row */}
        <div className="mb-5 flex items-center justify-between">
          <div className="h-2.5 w-8 rounded bg-neutral-300" />
          <div className="h-2.5 w-12 rounded bg-neutral-300" />
        </div>

        {/* QR code block */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-neutral-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            className="h-16 w-16 opacity-[0.07]"
          >
            <path d="M392.6 544.256a102.4 102.4 0 0 1 102.4 102.4V885.76a102.4 102.4 0 0 1-102.4 102.4H153.6a102.4 102.4 0 0 1-102.4-102.4V646.656a102.4 102.4 0 0 1 102.4-102.4h239zm521.5 214.272a43.52 43.52 0 0 1 43.16 38.092l0.36 5.427v136.704a43.52 43.52 0 0 1-86.68 5.478l-0.36-5.427v-136.704c0-24.064 19.456-43.52 43.52-43.52zm-295.8 0a43.52 43.52 0 0 1 43.16 38.092l0.36 5.427v136.704a43.52 43.52 0 0 1-86.73 5.478l-0.31-5.427v-136.704c0-24.064 19.456-43.52 43.52-43.52zm147.9 47.514a43.52 43.52 0 0 1 43.16 38.04l0.36 5.48v89.24a43.52 43.52 0 0 1-86.73 5.428l-0.31-5.428v-89.24c0-24.064 19.456-43.52 43.52-43.52zM392.6 615.936H153.6a30.72 30.72 0 0 0-30.31 25.754l-0.41 4.966v239a30.72 30.72 0 0 0 25.75 30.31l4.97 0.41h239a30.72 30.72 0 0 0 30.31-25.754l0.41-4.966V646.656a30.72 30.72 0 0 0-25.75-30.31l-4.97-0.41zm-71.17 76.288a25.6 25.6 0 0 1 25.6 25.6v96.666a25.6 25.6 0 0 1-25.6 25.6H224.768a25.6 25.6 0 0 1-25.6-25.6V717.824a25.6 25.6 0 0 1 25.6-25.6h96.768zm444.774-92.877a43.52 43.52 0 0 1 43.16 38.04l0.36 5.48v98.61a43.52 43.52 0 0 1-86.73 5.478l-0.31-5.478v-98.61c0-24.064 19.456-43.52 43.52-43.52zm-147.97 0a43.52 43.52 0 0 1 43.21 38.04l0.36 5.48v49.305a43.52 43.52 0 0 1-86.73 5.478l-0.31-5.478v-49.305c0-24.064 19.456-43.52 43.52-43.52zm295.885 0a43.52 43.52 0 0 1 43.16 38.04l0.36 5.48v49.305a43.52 43.52 0 0 1-86.68 5.478l-0.36-5.478v-49.305c0-24.064 19.456-43.52 43.52-43.52zM392.6 51.2a102.4 102.4 0 0 1 102.4 102.4v239a102.4 102.4 0 0 1-102.4 102.4H153.6a102.4 102.4 0 0 1-102.4-102.4V153.6a102.4 102.4 0 0 1 102.4-102.4h239zm493.056 0a102.4 102.4 0 0 1 102.4 102.4v239a102.4 102.4 0 0 1-102.4 102.4h-239a102.4 102.4 0 0 1-102.4-102.4V153.6a102.4 102.4 0 0 1 102.4-102.4h239zm-493.056 71.68H153.6a30.72 30.72 0 0 0-30.31 25.754L122.88 153.6v239a30.72 30.72 0 0 0 25.75 30.31l4.97 0.41h239a30.72 30.72 0 0 0 30.31-25.754l0.41-4.966V153.6a30.72 30.72 0 0 0-25.75-30.31l-4.97-0.41zm493.056 0h-239a30.72 30.72 0 0 0-30.31 25.754L615.936 153.6v239a30.72 30.72 0 0 0 25.75 30.31l4.97 0.41h239a30.72 30.72 0 0 0 30.31-25.754l0.41-4.966V153.6a30.72 30.72 0 0 0-25.75-30.31l-4.97-0.41zM321.485 199.168a25.6 25.6 0 0 1 25.6 25.6v96.717a25.6 25.6 0 0 1-25.6 25.6H224.768a25.6 25.6 0 0 1-25.6-25.6v-96.768a25.6 25.6 0 0 1 25.6-25.6h96.768zm493.107 0a25.6 25.6 0 0 1 25.6 25.6v96.717a25.6 25.6 0 0 1-25.6 25.6H717.824a25.6 25.6 0 0 1-25.6-25.6v-96.768a25.6 25.6 0 0 1 25.6-25.6h96.768z" />
          </svg>
        </div>

        {/* Receipt bottom tear */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-t-full bg-background"
            />
          ))}
        </div>

        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(250%); }
          }
        `}</style>
      </div>
    </div>
  );
}
