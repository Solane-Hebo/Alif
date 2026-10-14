"use client";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

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
    barcode: string;
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
  const [open, setOpen] =
    useState(false);

  const [state, formAction, pending] =
    useActionState(
      updateProductAction,
      initialState
    );

  /*
   * Controlled fields are intentional.
   * Base UI can otherwise warn when defaultValue
   * changes after FieldControl initialization.
   */
  const [name, setName] =
    useState(product.name);

  const [sku, setSku] =
    useState(product.sku);

  const [barcode, setBarcode] =
    useState(product.barcode ?? "");

  const [category, setCategory] =
    useState(product.category);

  const [description, setDescription] =
    useState(product.description);

  const [
    purchasePrice,
    setPurchasePrice,
  ] = useState(
    minorUnitsToInput(
      product.purchasePrice
    )
  );

  const [
    sellingPrice,
    setSellingPrice,
  ] = useState(
    minorUnitsToInput(
      product.sellingPrice
    )
  );

  const [
    lowStockThreshold,
    setLowStockThreshold,
  ] = useState(
    product.lowStockThreshold.toString()
  );

  /*
   * Reset the form to the latest product
   * values whenever the dialog opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setName(product.name);
    setSku(product.sku);
    setBarcode(product.barcode ?? "");
    setCategory(product.category);
    setDescription(
      product.description
    );

    setPurchasePrice(
      minorUnitsToInput(
        product.purchasePrice
      )
    );

    setSellingPrice(
      minorUnitsToInput(
        product.sellingPrice
      )
    );

    setLowStockThreshold(
      product.lowStockThreshold.toString()
    );
  }, [
    open,
    product.name,
    product.sku,
    product.barcode,
    product.category,
    product.description,
    product.purchasePrice,
    product.sellingPrice,
    product.lowStockThreshold,
  ]);

  /*
   * Close the dialog after a successful
   * server action.
   */
  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="flex justify-end gap-2">
      {/* Edit product */}
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
              Update product information and
              prices. Stock receiving and
              adjustments will be managed
              separately.
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
              {/* Product name */}
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
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                  maxLength={150}
                  disabled={pending}
                />
              </div>

              {/* SKU */}
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
                  value={sku}
                  onChange={(event) =>
                    setSku(
                      event.target.value
                    )
                  }
                  required
                  maxLength={80}
                  disabled={pending}
                />
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <label
                  htmlFor={`barcode-${product.id}`}
                  className="text-sm font-medium"
                >
                  Barcode
                </label>

                <Input
                  id={`barcode-${product.id}`}
                  name="barcode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={64}
                  value={barcode}
                  onChange={(event) =>
                    setBarcode(
                      event.target.value
                    )
                  }
                  disabled={pending}
                  placeholder="Scan or enter barcode"
                />

                <p className="text-xs text-muted-foreground">
                  Scan the barcode or enter it
                  manually.
                </p>
              </div>

              {/* Category */}
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
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  disabled={pending}
                />
              </div>

              {/* Purchase price */}
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
                  value={purchasePrice}
                  onChange={(event) =>
                    setPurchasePrice(
                      event.target.value
                    )
                  }
                  required
                  disabled={pending}
                />
              </div>

              {/* Selling price */}
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
                  value={sellingPrice}
                  onChange={(event) =>
                    setSellingPrice(
                      event.target.value
                    )
                  }
                  required
                  disabled={pending}
                />
              </div>

              {/* Low stock threshold */}
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
                  value={lowStockThreshold}
                  onChange={(event) =>
                    setLowStockThreshold(
                      event.target.value
                    )
                  }
                  required
                  disabled={pending}
                />
              </div>
            </div>

            {/* Description */}
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
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
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

      {/* Archive product */}
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
              The product will no longer appear
              in the active product list.
              Historical data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <form
              action={archiveProductAction}
            >
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