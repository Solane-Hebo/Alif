"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Boxes,
  ChartNoAxesCombined,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

type AppSidebarProps = {
  organizationName: string;
};

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    enabled: true,
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    href: "/sales",
    enabled: false,
  },
  {
    name: "Products",
    icon: Package,
    href: "/products",
    enabled: true,
  },
  {
    name: "Inventory",
    icon: Boxes,
    href: "/inventory",
    enabled: false,
  },
  {
    name: "Users",
    icon: Users,
    href: "/users",
    enabled: false,
  },
  {
    name: "Reports",
    icon: ChartNoAxesCombined,
    href: "/reports",
    enabled: false,
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    enabled: false,
  },
];

export function AppSidebar({
  organizationName,
}: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 border-r bg-white lg:block">
      <div className="flex h-20 items-center border-b px-6">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white"
          aria-hidden="true"
        >
          {organizationName.charAt(0).toUpperCase()}
        </div>

        <div className="ml-3 min-w-0">
          <p className="truncate font-bold text-slate-900">
            {organizationName}
          </p>

          <p className="text-xs text-slate-500">
            Sales Management
          </p>
        </div>
      </div>

      <nav
        className="p-4"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

            if (!item.enabled) {
              return (
                <li key={item.name}>
                  <span
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400"
                    aria-disabled="true"
                  >
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />

                    {item.name}
                  </span>
                </li>
              );
            }

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />

                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}