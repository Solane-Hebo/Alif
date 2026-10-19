"use client";

import {
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  MoreHorizontal,
  Pencil,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  setUserActiveAction,
  updateUserAction,
  type UserActionState,
} from "@/app/users/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserActionsProps = {
  user: {
    id: string;
    name: string;
    role: "ADMIN" | "STAFF";
    isActive: boolean;
  };
};

const initialState: UserActionState = {
  success: false,
  message: "",
};

export function UserActions({
  user,
}: UserActionsProps) {
  const [editOpen, setEditOpen] =
    useState(false);

  const [editName, setEditName] =
    useState(user.name);

  const [editRole, setEditRole] =
    useState<"ADMIN" | "STAFF">(
      user.role
    );

  const [
    deactivateOpen,
    setDeactivateOpen,
  ] = useState(false);

  const [
    updateState,
    updateAction,
    updatePending,
  ] = useActionState(
    updateUserAction,
    initialState
  );

  const [
    activeMessage,
    setActiveMessage,
  ] = useState("");

  const [
    activeError,
    setActiveError,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  useEffect(() => {
    if (updateState.success) {
      setEditOpen(false);
    }
  }, [updateState.success]);

  function openEditDialog() {
    setEditName(user.name);
    setEditRole(user.role);
    setEditOpen(true);
  }

  function changeActiveState(
    isActive: boolean
  ) {
    setActiveMessage("");
    setActiveError(false);

    startTransition(async () => {
      const result =
        await setUserActiveAction(
          user.id,
          isActive
        );

      setActiveMessage(result.message);
      setActiveError(!result.success);

      if (result.success) {
        setDeactivateOpen(false);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${user.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={openEditDialog}
            >
              <Pencil className="size-4" />
              Edit user
            </DropdownMenuItem>

            {user.isActive ? (
              <DropdownMenuItem
                onClick={() =>
                  setDeactivateOpen(true)
                }
              >
                <UserX className="size-4" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() =>
                  changeActiveState(true)
                }
              >
                <UserCheck className="size-4" />

                {isPending
                  ? "Activating..."
                  : "Reactivate"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeMessage ? (
          <p
            role={
              activeError
                ? "alert"
                : "status"
            }
            className={
              activeError
                ? "max-w-48 text-right text-xs text-red-600"
                : "max-w-48 text-right text-xs text-emerald-700"
            }
          >
            {activeMessage}
          </p>
        ) : null}
      </div>

      {/* EDIT USER */}
      <Dialog
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit user
            </DialogTitle>

            <DialogDescription>
              Update the team member&apos;s
              name and access level.
            </DialogDescription>
          </DialogHeader>

          <form
            action={updateAction}
            className="space-y-4"
          >
            <input
              type="hidden"
              name="userId"
              value={user.id}
            />

            <div className="space-y-2">
              <label
                htmlFor={`name-${user.id}`}
                className="text-sm font-medium"
              >
                Name
              </label>

              <Input
                id={`name-${user.id}`}
                name="name"
                value={editName}
                onChange={(event) =>
                  setEditName(
                    event.target.value
                  )
                }
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`role-${user.id}`}
                className="text-sm font-medium"
              >
                Role
              </label>

              <select
                id={`role-${user.id}`}
                name="role"
                value={editRole}
                onChange={(event) =>
                  setEditRole(
                    event.target.value as
                      | "ADMIN"
                      | "STAFF"
                  )
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="STAFF">
                  Staff
                </option>

                <option value="ADMIN">
                  Admin
                </option>
              </select>
            </div>

            {updateState.message ? (
              <p
                role={
                  updateState.success
                    ? "status"
                    : "alert"
                }
                className={
                  updateState.success
                    ? "text-sm text-emerald-700"
                    : "text-sm text-red-600"
                }
              >
                {updateState.message}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={updatePending}
                onClick={() =>
                  setEditOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updatePending}
              >
                {updatePending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DEACTIVATE CONFIRMATION */}
      <Dialog
        open={deactivateOpen}
        onOpenChange={
          setDeactivateOpen
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Deactivate user?
            </DialogTitle>

            <DialogDescription>
              {user.name} will no longer
              be able to access this
              organization.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                setDeactivateOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                changeActiveState(false)
              }
            >
              {isPending
                ? "Deactivating..."
                : "Deactivate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}