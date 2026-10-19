import {
  Bell,
  LogOut,
  Search,
} from "lucide-react";

import { logoutAction } from "@/app/actions/logout";

import { requireUser } from "@/lib/auth/guards";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppHeaderProps = {
  organizationName: string;
};

function getInitials(
  name?: string | null
) {
  if (!name) {
    return "U";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0)
    )
    .join("")
    .toUpperCase();

  return initials || "U";
}

export async function AppHeader({
  organizationName,
}: AppHeaderProps) {
  const user = await requireUser();

  const roleLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : "Staff";

  const displayName =
    user.name?.trim() ||
    user.email;

  const initials =
    getInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex w-full items-center gap-3 md:gap-4">
        {/* Mobile navigation */}
        <MobileSidebar
          organizationName={
            organizationName
          }
          role={user.role}
        />

       {/* Mobile search */}
<Button
  type="button"
  variant="ghost"
  size="icon"
  disabled
  aria-label="Search"
  title="Global search is coming soon"
  className="sm:hidden"
>
  <Search
    className="size-5"
    aria-hidden="true"
  />
</Button>

{/* Desktop / tablet search */}
<div className="relative hidden w-full max-w-md sm:block">
  <Search
    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
    aria-hidden="true"
  />

  <Input
    type="search"
    placeholder="Search products, sales..."
    aria-label="Search"
    disabled
    title="Global search is coming soon"
    className="h-10 bg-slate-50 pl-10"
  />
</div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled
            aria-label="Notifications"
            title="Notifications are coming soon"
            className="relative rounded-full"
          >
            <Bell
              className="size-5"
              aria-hidden="true"
            />
          </Button>

          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white shadow-sm"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-44 truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="text-xs text-slate-500">
                {roleLabel}
              </p>
            </div>
          </div>

          <div
            className="mx-1 hidden h-8 w-px bg-slate-200 sm:block"
            aria-hidden="true"
          />

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-full text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut
                className="size-5"
                aria-hidden="true"
              />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}