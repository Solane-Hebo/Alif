"use client";

import {
  FormEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  adjustStockAction,
  lookupBarcodeAction,
  type AdjustStockState,
  type BarcodeLookupState,
} from "@/app/inventory/actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  stockQuantity: number;
};

type StockAdjustmentFormProps = {
  products: InventoryProduct[];
};

const initialLookupState: BarcodeLookupState = {
  success: false,
  message: "",
};

const initialAdjustmentState: AdjustStockState = {
  success: false,
  message: "",
};

export function StockAdjustmentForm({
  products,
}: StockAdjustmentFormProps) {
  const barcodeInputRef =
    useRef<HTMLInputElement>(null);

  const stockInputRef =
    useRef<HTMLInputElement>(null);

  const [barcode, setBarcode] =
    useState("");

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    lookupState,
    lookupAction,
    lookupPending,
  ] = useActionState(
    lookupBarcodeAction,
    initialLookupState
  );

  const [
    adjustmentState,
    adjustmentAction,
    adjustmentPending,
  ] = useActionState(
    adjustStockAction,
    initialAdjustmentState
  );

  /*
   * Product selected from the normal
   * server-provided inventory list.
   */
  const productFromList =
    products.find(
      (product) =>
        product.id === selectedProductId
    ) ?? null;

  /*
   * Barcode lookup can also provide
   * the selected product.
   */
  const scannedProduct =
    lookupState.success &&
    lookupState.product?.id ===
      selectedProductId
      ? lookupState.product
      : null;

  const selectedProduct =
    productFromList ?? scannedProduct;

  /*
   * After a successful barcode lookup:
   *
   * - select the product
   * - focus actual stock quantity
   */
  useEffect(() => {
    if (
      !lookupState.success ||
      !lookupState.product
    ) {
      return;
    }

    setSelectedProductId(
      lookupState.product.id
    );

    window.setTimeout(() => {
      stockInputRef.current?.focus();
      stockInputRef.current?.select();
    }, 0);
  }, [
    lookupState.success,
    lookupState.product,
  ]);

  /*
   * After a successful adjustment,
   * clear the current selection and
   * prepare for the next scan.
   */
  useEffect(() => {
    if (!adjustmentState.success) {
      return;
    }

    setBarcode("");
    setSelectedProductId("");

    window.setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  }, [adjustmentState.success]);

  function handleBarcodeSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    if (!barcode.trim()) {
      event.preventDefault();
      barcodeInputRef.current?.focus();
    }
  }

  function handleManualProductChange(
    productId: string
  ) {
    setSelectedProductId(productId);
    setBarcode("");

    if (!productId) {
      return;
    }

    window.setTimeout(() => {
      stockInputRef.current?.focus();
      stockInputRef.current?.select();
    }, 0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Stock adjustment
        </CardTitle>

        <CardDescription>
          Correct inventory after a physical
          count, damaged goods, shrinkage or
          another inventory discrepancy.
          A reason is required.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barcode lookup */}
        <section className="rounded-xl border bg-slate-50 p-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">
              Scan barcode
            </h3>

            <p className="text-sm text-slate-600">
              Scan a product barcode or enter
              it manually.
            </p>
          </div>

          <form
            action={lookupAction}
            onSubmit={handleBarcodeSubmit}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1">
              <label
                htmlFor="adjustment-barcode"
                className="sr-only"
              >
                Barcode
              </label>

              <Input
                ref={barcodeInputRef}
                id="adjustment-barcode"
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
                disabled={lookupPending}
                placeholder="Scan or enter barcode"
              />
            </div>

            <Button
              type="submit"
              disabled={
                lookupPending ||
                !barcode.trim()
              }
            >
              {lookupPending
                ? "Finding..."
                : "Find product"}
            </Button>
          </form>

          <p className="mt-2 text-xs text-slate-500">
            USB and Bluetooth scanners that
            work as a keyboard are supported.
            Scanner Enter will search
            automatically.
          </p>

          {lookupState.message &&
          !lookupState.success ? (
            <p
              role="alert"
              className="mt-3 text-sm font-medium text-red-600"
            >
              {lookupState.message}
            </p>
          ) : null}
        </section>

        {/* Manual product selection */}
        <div className="space-y-2">
          <label
            htmlFor="adjustment-product"
            className="text-sm font-medium text-slate-700"
          >
            Product
          </label>

          <select
            id="adjustment-product"
            value={selectedProductId}
            onChange={(event) =>
              handleManualProductChange(
                event.target.value
              )
            }
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">
              Select a product
            </option>

            {scannedProduct &&
            !products.some(
              (product) =>
                product.id ===
                scannedProduct.id
            ) ? (
              <option
                value={scannedProduct.id}
              >
                {scannedProduct.name} (
                {scannedProduct.sku})
              </option>
            ) : null}

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} (
                {product.sku})
              </option>
            ))}
          </select>

          <p className="text-xs text-slate-500">
            Use this if you do not have a
            barcode scanner or the product has
            no barcode.
          </p>
        </div>

        {/* Selected product */}
        {selectedProduct ? (
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Product selected
            </p>

            <h3 className="mt-1 text-lg font-semibold text-slate-950">
              {selectedProduct.name}
            </h3>

            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate-500">
                  SKU
                </dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {selectedProduct.sku}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">
                  Barcode
                </dt>

                <dd className="mt-1 break-all font-medium text-slate-900">
                  {selectedProduct.barcode ||
                    "—"}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">
                  Current stock
                </dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {
                    selectedProduct.stockQuantity
                  }
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {/* Adjustment form */}
        <form
          action={adjustmentAction}
          className="space-y-4"
        >
          <input
            type="hidden"
            name="productId"
            value={
              selectedProduct?.id ?? ""
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="new-stock-quantity"
                className="text-sm font-medium text-slate-700"
              >
                Actual stock quantity
              </label>

              <Input
                ref={stockInputRef}
                id="new-stock-quantity"
                name="newStockQuantity"
                type="number"
                min={0}
                step={1}
                required
                disabled={
                  !selectedProduct ||
                  adjustmentPending
                }
                placeholder={
                  selectedProduct
                    ? selectedProduct.stockQuantity.toString()
                    : "0"
                }
              />

              <p className="text-xs text-slate-500">
                Enter the actual quantity
                currently in stock.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="adjustment-note"
                className="text-sm font-medium text-slate-700"
              >
                Reason
              </label>

              <Input
                id="adjustment-note"
                name="note"
                type="text"
                minLength={3}
                maxLength={500}
                required
                disabled={
                  !selectedProduct ||
                  adjustmentPending
                }
                placeholder="Physical count correction"
              />

              <p className="text-xs text-slate-500">
                Required for the audit
                history.
              </p>
            </div>
          </div>

          {adjustmentState.message ? (
            <p
              role={
                adjustmentState.success
                  ? "status"
                  : "alert"
              }
              className={
                adjustmentState.success
                  ? "text-sm font-medium text-emerald-700"
                  : "text-sm font-medium text-red-600"
              }
            >
              {adjustmentState.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={
              !selectedProduct ||
              adjustmentPending
            }
          >
            {adjustmentPending
              ? "Adjusting..."
              : "Adjust stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}