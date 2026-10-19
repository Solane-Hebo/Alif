"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { SidebarNavigation } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileSidebarProps = {
  organizationName: string;
  role: "ADMIN" | "STAFF";
};

export function MobileSidebar({
  organizationName,
  role,
}: MobileSidebarProps) {
  const [open, setOpen] =
    useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          >
            <Menu
              className="size-5"
              aria-hidden="true"
            />
          </Button>
        }
      />

      <SheetContent
        side="left"
        className="w-72 p-0"
      >
        <SheetTitle className="sr-only">
          Navigation
        </SheetTitle>

        <SidebarNavigation
          organizationName={
            organizationName
          }
          role={role}
          onNavigate={() =>
            setOpen(false)
          }
        />
      </SheetContent>
    </Sheet>
  );
}