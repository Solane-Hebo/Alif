import { Bell, Menu, LogOut, Search } from "lucide-react";
import { logoutAction } from "@/app/actions/logout";

import { requireUser } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export async function AppHeader() {
  const user = await requireUser();

  const roleLabel =
    user.role === "ADMIN" ? "Administrator" : "Staff";

  const initials = getInitials(user.name);

  return (
    <header className="flex h-20 items-center gap-4 border-b bg-white px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />

        <Input
          type="search"
          placeholder="Search products, sales, or anything..."
          aria-label="Search"
          className="pl-10"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-semibold text-white"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user.name ?? user.email}
          </p>

          <p className="text-xs text-slate-500">
            {roleLabel}
          </p>
        </div>
        <form action={logoutAction}>
  <Button
    type="submit"
    variant="ghost"
    size="icon"
    aria-label="Sign out"
    title="Sign out"
  >
    <LogOut
      className="h-5 w-5"
      aria-hidden="true"
    />
  </Button>
</form>
      </div>
    </header>
  );
}