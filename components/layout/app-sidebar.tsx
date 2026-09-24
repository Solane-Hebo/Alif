"use client";

import {
  Boxes,
  ChartNoAxesCombined,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Sales", icon: ShoppingCart },
  { name: "Products", icon: Package },
  { name: "Inventory", icon: Boxes },
  { name: "Users", icon: Users },
  { name: "Reports", icon: ChartNoAxesCombined },
  { name: "Settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white lg:block">
      <div className="flex h-20 items-center border-b px-6">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white"
          aria-hidden="true"
        >
          M
        </div>

        <div className="ml-3">
          <p className="font-bold text-slate-900">MyStore</p>
          <p className="text-xs text-slate-500">Sales Management</p>
        </div>
      </div>

      <nav className="p-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    index === 0
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}