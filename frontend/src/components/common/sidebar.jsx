import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  BriefcaseBusiness,
  ShieldCheck,
  FileBarChart,
  Sparkles,
  Settings,
  LogOut,
  BrainCircuit,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Budget",
    icon: WalletCards,
  },
  {
    label: "Portfolio",
    icon: BriefcaseBusiness,
  },
  {
    label: "Risk Intelligence",
    icon: ShieldCheck,
  },
  {
    label: "Reports",
    icon: FileBarChart,
  },
  {
    label: "AI Copilot",
    icon: Sparkles,
  },
];

function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      {/* Brand */}
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07111f] text-emerald-400">
            <BrainCircuit size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#07111f]">
              Finance<span className="text-emerald-500">AI</span>
            </h1>

            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Financial Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;

            return (
              <button
                key={item.label}
                type="button"
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#07111f]"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.8}
                  className={
                    active
                      ? "text-emerald-600"
                      : "text-slate-400 transition group-hover:text-emerald-500"
                  }
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#07111f]"
        >
          <Settings size={18} />
          Settings
        </button>

        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;