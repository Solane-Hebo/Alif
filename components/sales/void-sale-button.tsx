"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  voidSaleAction,
  type VoidSaleState,
} from "@/app/sales/actions";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type VoidSaleButtonProps = {
  saleId: string;
};

const initialState: VoidSaleState = {};

export function VoidSaleButton({
  saleId,
}: VoidSaleButtonProps) {
  const [open, setOpen] =
    useState(false);

  const [state, formAction, pending] =
    useActionState(
      voidSaleAction,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-red-700 hover:text-red-800"
            />
          }
        >
          Void
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Void this sale?
            </AlertDialogTitle>

            <AlertDialogDescription>
              The sale will remain in the
              history and the sold quantity
              will be returned to inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <form action={formAction}>
              <input
                type="hidden"
                name="saleId"
                value={saleId}
              />

              <AlertDialogAction
                type="submit"
                disabled={pending}
                className="bg-red-600 hover:bg-red-700"
              >
                {pending
                  ? "Voiding..."
                  : "Void sale"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {state.error ? (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600"
        >
          {state.error}
        </p>
      ) : null}
    </div>
  );
}