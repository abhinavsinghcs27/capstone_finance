import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  BriefcaseBusiness,
  ShieldCheck,
  FileBarChart,
  Sparkles,
  BrainCircuit,
  Menu,
  ChevronLeft,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    path: "/transactions",
  },
  {
    label: "Budget",
    icon: WalletCards,
    path: "/budget",
  },
  {
    label: "Portfolio",
    icon: BriefcaseBusiness,
    path: "/portfolio",
  },
  {
    label: "Risk Intelligence",
    icon: ShieldCheck,
    path: "/security-aml",
  },
  {
    label: "Reports",
    icon: FileBarChart,
    path: "/reports",
  },
  {
    label: "AI Copilot",
    icon: Sparkles,
    path: "/ai-copilot",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full w-full flex-col overflow-hidden">

        {/* Logo */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
            collapsed
              ? "justify-center"
              : "justify-between px-6"
          }`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07111f] text-emerald-400">
                <BrainCircuit size={20} />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-[#07111f]">
                  Finance
                  <span className="text-emerald-500">
                    AI
                  </span>
                </h1>

                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Financial Intelligence
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setCollapsed(!collapsed)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#07111f]"
          >
            {collapsed ? (
              <Menu size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <nav className="h-full overflow-y-auto px-3 py-6">

            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Workspace
              </p>
            )}

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                const active =
                  location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      navigate(item.path)
                    }
                    title={
                      collapsed
                        ? item.label
                        : ""
                    }
                    className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition ${
                      collapsed
                        ? "justify-center"
                        : "gap-3 px-3"
                    } ${
                      active
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-[#07111f]"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }
                    />

                    {!collapsed && (
                      <span>
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;