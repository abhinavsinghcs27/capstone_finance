import {
  Bell,
  Search,
  Sun,
  ChevronDown,
} from "lucide-react";

function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-8">
      {/* Search */}
      <div className="hidden w-full max-w-sm md:block">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            placeholder="Search your finances..."
            className="w-full rounded-xl border border-transparent bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#07111f]"
        >
          <Sun size={18} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-[#07111f]"
        >
          <Bell size={18} />

          <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Profile */}
        <button
          type="button"
          className="ml-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#07111f] text-sm font-semibold text-white">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#07111f]">
              Ayush
            </p>

            <p className="text-xs text-slate-400">
              Personal Account
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Topbar;