export default function BrandLogo({ size = 36, showText = true, textClassName = "text-xl", light = false }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div 
        className="flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <defs>
            <linearGradient id="finGradComponent" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="bgGradComponent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b1728" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#bgGradComponent)" stroke="#1e293b" strokeWidth="2" />
          <path d="M 50 20 L 78 72 L 64 72 L 50 45 L 36 72 L 22 72 Z" fill="url(#finGradComponent)" />
          <rect x="29" y="52" width="42" height="7" rx="3.5" fill="#ffffff" opacity="0.95" />
          <rect x="34" y="41" width="32" height="5.5" rx="2.75" fill="url(#finGradComponent)" opacity="0.85" />
          <circle cx="50" cy="35" r="3.5" fill="#a7f3d0" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight ${textClassName} ${light ? "text-white" : "text-[#07111f]"}`}>
            Fin<span className="text-emerald-500">Artha</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            Financial Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
