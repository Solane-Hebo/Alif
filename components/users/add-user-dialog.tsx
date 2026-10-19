"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";
import { UserPlus } from "lucide-react";

import {
  createUserAction,
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
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: UserActionState = {
  success: false,
  message: "",
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);

  const [state, action, pending] =
    useActionState(
      createUserAction,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        render={
          <Button type="button">
            <UserPlus className="size-4" />
            Add User
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add team member
          </DialogTitle>

          <DialogDescription>
            Create a user for your
            organization and assign their
            access level.
          </DialogDescription>
        </DialogHeader>

        <form
          action={action}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="user-name"
              className="text-sm font-medium"
            >
              Name
            </label>

            <Input
              id="user-name"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <Input
              id="user-email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-password"
              className="text-sm font-medium"
            >
              Temporary password
            </label>

            <Input
              id="user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />

            <p className="text-xs text-slate-500">
              Minimum 12 characters.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-role"
              className="text-sm font-medium"
            >
              Role
            </label>

            <select
              id="user-role"
              name="role"
              defaultValue="STAFF"
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

          {state.message ? (
            <p
              role={
                state.success
                  ? "status"
                  : "alert"
              }
              className={
                state.success
                  ? "text-sm text-emerald-700"
                  : "text-sm text-red-600"
              }
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
              disabled={pending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={pending}
            >
              {pending
                ? "Creating..."
                : "Create user"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}