"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Archive,
  Loader2,
  Pencil,
  Save,
} from "lucide-react";

import {
  archiveProductAction,
  updateProductAction,
  type UpdateProductState,
} from "@/app/products/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    description: string;
    purchasePrice: number;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
  };
};

const initialState: UpdateProductState = {};

function minorUnitsToInput(amount: number) {
  return (amount / 100).toFixed(2);
}

export function ProductActions({
  product,
}: ProductActionsProps) {
  const [open, setOpen] = useState(false);

  const [state, formAction, pending] =
    useActionState(
      updateProductAction,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTrigger
  render={
    <Button
      type="button"
      variant="outline"
      size="sm"
    />
  }
>
  <Pencil
    className="mr-2 h-4 w-4"
    aria-hidden="true"
  />
  Edit
</DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit product
            </DialogTitle>

            <DialogDescription>
              Update product information, prices and
              stock.
            </DialogDescription>
          </DialogHeader>

          <form
            action={formAction}
            className="space-y-5"
          >
            <input
              type="hidden"
              name="productId"
              value={product.id}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`name-${product.id}`}
                  className="text-sm font-medium"
                >
                  Product name
                </label>

                <Input
                  id={`name-${product.id}`}
                  name="name"
                  defaultValue={product.name}
                  required
                  maxLength={150}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`sku-${product.id}`}
                  className="text-sm font-medium"
                >
                  SKU
                </label>

                <Input
                  id={`sku-${product.id}`}
                  name="sku"
                  defaultValue={product.sku}
                  required
                  maxLength={80}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`category-${product.id}`}
                  className="text-sm font-medium"
                >
                  Category
                </label>

                <Input
                  id={`category-${product.id}`}
                  name="category"
                  defaultValue={product.category}
                  maxLength={100}
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`purchase-${product.id}`}
                  className="text-sm font-medium"
                >
                  Purchase price
                </label>

                <Input
                  id={`purchase-${product.id}`}
                  name="purchasePrice"
                  inputMode="decimal"
                  defaultValue={minorUnitsToInput(
                    product.purchasePrice
                  )}
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`selling-${product.id}`}
                  className="text-sm font-medium"
                >
                  Selling price
                </label>

                <Input
                  id={`selling-${product.id}`}
                  name="sellingPrice"
                  inputMode="decimal"
                  defaultValue={minorUnitsToInput(
                    product.sellingPrice
                  )}
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`stock-${product.id}`}
                  className="text-sm font-medium"
                >
                  Stock quantity
                </label>

                <Input
                  id={`stock-${product.id}`}
                  name="stockQuantity"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={
                    product.stockQuantity
                  }
                  required
                  disabled={pending}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`threshold-${product.id}`}
                  className="text-sm font-medium"
                >
                  Low stock threshold
                </label>

                <Input
                  id={`threshold-${product.id}`}
                  name="lowStockThreshold"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={
                    product.lowStockThreshold
                  }
                  required
                  disabled={pending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`description-${product.id}`}
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id={`description-${product.id}`}
                name="description"
                rows={4}
                maxLength={1000}
                defaultValue={product.description}
                disabled={pending}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {state.error ? (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {state.error}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="submit"
                disabled={pending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {pending ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    Save changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
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
  <Archive
    className="mr-2 h-4 w-4"
    aria-hidden="true"
  />
  Archive
</AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive {product.name}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              The product will no longer appear in
              the active product list. Historical
              data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <form action={archiveProductAction}>
              <input
                type="hidden"
                name="productId"
                value={product.id}
              />

              <AlertDialogAction
                type="submit"
                className="bg-red-600 hover:bg-red-700"
              >
                Archive product
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}