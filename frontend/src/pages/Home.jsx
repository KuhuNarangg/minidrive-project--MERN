import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-sky-500/30 overflow-hidden font-sans">

      {/* Navigation - Minimalist floating bar */}
      <nav className="absolute top-0 w-full z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <div className="h-4 w-4 bg-black rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">MiniDrive</span>
        </div>
      </nav>

      <main className="grid lg:grid-cols-2 min-h-screen">

        {/* Left Section: Content */}
        <div className="flex flex-col justify-center px-8 lg:px-24 pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 w-fit mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">V2.0 Now Live</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            STORAGE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-400 to-slate-600">
              REDEFINED.
            </span>
          </h1>

          <p className="mt-8 text-slate-400 text-lg max-w-md leading-relaxed">
            Beyond just a drive. A high-performance environment for your files with instant sharing and military-grade encryption.
          </p>

          <div className="mt-10 flex items-center gap-6">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition active:scale-95"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="group flex items-center gap-2 text-white font-semibold"
            >
              Sign In
              <span className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section: The "Visual Bento" (Impressive Design) */}
        <div className="hidden lg:flex relative items-center justify-center bg-[#0a0a0a] border-l border-white/5">
          {/* Subtle moving background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative grid grid-cols-2 gap-4 w-[80%] h-[60%]">
            {/* Box 1: File Stat */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-sky-500/50 transition">
              <div className="h-2 w-12 bg-sky-500 rounded-full mb-4" />
              <div className="text-3xl font-bold text-white leading-none">99.9%</div>
              <div className="text-[10px] uppercase tracking-tighter text-slate-500 mt-2">Uptime Guaranteed</div>
            </div>

            {/* Box 2: Encryption Visual */}
            <div className="bg-sky-500 rounded-2xl p-6 flex flex-col justify-end group cursor-default">
              <div className="text-black font-black text-2xl leading-none">AES-256</div>
              <div className="text-black/70 text-xs font-bold uppercase">Encryption</div>
            </div>

            {/* Box 3: Large visual/image placeholder */}
            <div className="col-span-2 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 overflow-hidden relative">
              <div className="flex gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 w-12 rounded-lg bg-white/10 animate-pulse" />
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-1 w-full bg-white/10 rounded" />
                <div className="h-1 w-[80%] bg-white/10 rounded" />
                <div className="h-1 w-[60%] bg-white/10 rounded" />
              </div>
              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-sky-500/20 blur-3xl rounded-full" />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}