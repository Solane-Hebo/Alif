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

type SidebarNavigationProps = {
  organizationName: string;
  role: "ADMIN" | "STAFF";
  onNavigate?: () => void;
};

type AppSidebarProps = {
  organizationName: string;
  role: "ADMIN" | "STAFF";
};

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    enabled: true,
    adminOnly: false,
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    href: "/sales",
    enabled: true,
    adminOnly: false,
  },
  {
    name: "Products",
    icon: Package,
    href: "/products",
    enabled: true,
    adminOnly: false,
  },
  {
    name: "Inventory",
    icon: Boxes,
    href: "/inventory",
    enabled: true,
    adminOnly: false,
  },
  {
    name: "Users",
    icon: Users,
    href: "/users",
    enabled: true,
    adminOnly: true,
  },
  {
    name: "Reports",
    icon: ChartNoAxesCombined,
    href: "/reports",
    enabled: true,
    adminOnly: true,
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
    enabled: true,
    adminOnly: true,
  },
];

export function SidebarNavigation({
  organizationName,
  role,
  onNavigate,
}: SidebarNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Organization */}
      <div className="flex h-20 shrink-0 items-center border-b px-6">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white"
          aria-hidden="true"
        >
          {organizationName
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="ml-3 min-w-0">
          <p className="truncate font-bold text-slate-900">
            {organizationName}
          </p>

          <p className="text-xs text-slate-500">
            ALIF Sales Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto p-4"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {navigation.map((item) => {
            if (
              item.adminOnly &&
              role !== "ADMIN"
            ) {
              return null;
            }

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
                      className="size-5"
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
                  onClick={onNavigate}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                  />

                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function AppSidebar({
  organizationName,
  role,
}: AppSidebarProps) {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r bg-white lg:block">
      <SidebarNavigation
        organizationName={
          organizationName
        }
        role={role}
      />
    </aside>
  );
}