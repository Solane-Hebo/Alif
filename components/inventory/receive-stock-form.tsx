"use client";

import {
  FormEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  lookupBarcodeAction,
  receiveStockAction,
  type BarcodeLookupState,
  type ReceiveStockState,
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

type ReceiveStockFormProps = {
  products: InventoryProduct[];
};

const initialLookupState: BarcodeLookupState = {
  success: false,
  message: "",
};

const initialReceiveState: ReceiveStockState = {
  success: false,
  message: "",
};

export function ReceiveStockForm({
  products,
}: ReceiveStockFormProps) {
  const barcodeInputRef =
    useRef<HTMLInputElement>(null);

  const quantityInputRef =
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
    receiveState,
    receiveAction,
    receivePending,
  ] = useActionState(
    receiveStockAction,
    initialReceiveState
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
   * - keep the scanned barcode visible
   * - focus quantity
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
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 0);
  }, [
    lookupState.success,
    lookupState.product,
  ]);

  /*
   * After stock has been received,
   * prepare the form for the next
   * product.
   */
  useEffect(() => {
    if (!receiveState.success) {
      return;
    }

    setBarcode("");
    setSelectedProductId("");

    window.setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  }, [receiveState.success]);

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

    /*
     * Barcode field is only used for
     * scanning/searching, so clear an
     * old scan when manually selecting.
     */
    setBarcode("");

    if (!productId) {
      return;
    }

    window.setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Receive stock
        </CardTitle>

        <CardDescription>
          Scan a barcode or select an existing
          product. Product prices remain
          unchanged.
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
                htmlFor="receive-barcode"
                className="sr-only"
              >
                Barcode
              </label>

              <Input
                ref={barcodeInputRef}
                id="receive-barcode"
                name="barcode"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={64}
                autoFocus
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
            htmlFor="receive-product"
            className="text-sm font-medium text-slate-700"
          >
            Product
          </label>

          <select
            id="receive-product"
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

            {/*
             * Normally the scanned product is
             * already in products.
             *
             * Keep this fallback so a successful
             * barcode lookup can still be shown
             * if that ever changes.
             */}
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

        {/* Receive stock */}
        <form
          action={receiveAction}
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
                htmlFor="receive-quantity"
                className="text-sm font-medium text-slate-700"
              >
                Quantity received
              </label>

              <Input
                ref={quantityInputRef}
                id="receive-quantity"
                name="quantity"
                type="number"
                min={1}
                step={1}
                required
                disabled={
                  !selectedProduct ||
                  receivePending
                }
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="receive-note"
                className="text-sm font-medium text-slate-700"
              >
                Note
                <span className="ml-1 font-normal text-slate-400">
                  {" "}
                  (optional)
                </span>
              </label>

              <Input
                id="receive-note"
                name="note"
                type="text"
                maxLength={500}
                disabled={
                  !selectedProduct ||
                  receivePending
                }
                placeholder="Supplier delivery"
              />
            </div>
          </div>

          {receiveState.message ? (
            <p
              role={
                receiveState.success
                  ? "status"
                  : "alert"
              }
              className={
                receiveState.success
                  ? "text-sm font-medium text-emerald-700"
                  : "text-sm font-medium text-red-600"
              }
            >
              {receiveState.message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={
              !selectedProduct ||
              receivePending
            }
          >
            {receivePending
              ? "Receiving..."
              : "Receive stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}