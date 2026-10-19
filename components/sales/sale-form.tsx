"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  lookupSaleBarcodeAction,
  registerSaleAction,
  type RegisterSaleState,
  type SaleBarcodeLookupState,
} from "@/app/sales/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { formatMoney } from "@/lib/utils/money";

type SaleProduct = {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stockQuantity: number;
};

type SaleFormProps = {
  products: SaleProduct[];
  currency: string;
  locale: string;
};

const initialSaleState: RegisterSaleState = {};

const initialBarcodeState: SaleBarcodeLookupState =
  {};

function minorUnitsToInput(amount: number) {
  return (amount / 100).toFixed(2);
}

export function SaleForm({
  products,
  currency,
  locale,
}: SaleFormProps) {
  const barcodeInputRef =
    useRef<HTMLInputElement>(null);

  const quantityInputRef =
    useRef<HTMLInputElement>(null);

  const [
    saleState,
    saleAction,
    salePending,
  ] = useActionState(
    registerSaleAction,
    initialSaleState
  );

  const [
    barcodeState,
    barcodeAction,
    barcodePending,
  ] = useActionState(
    lookupSaleBarcodeAction,
    initialBarcodeState
  );

  const [barcode, setBarcode] =
    useState("");

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [quantity, setQuantity] =
    useState("1");

  const [salePrice, setSalePrice] =
    useState("");

  /*
   * The selected product normally comes from
   * the server-provided dropdown list.
   *
   * A barcode lookup can also return a product,
   * including one with stock 0.
   */
  const productFromList =
    products.find(
      (product) =>
        product.id === selectedProductId
    ) ?? null;

  const scannedProduct =
    barcodeState.success &&
    barcodeState.product?.id ===
      selectedProductId
      ? barcodeState.product
      : null;

  const selectedProduct =
    productFromList ?? scannedProduct;

  /*
   * After a successful barcode lookup:
   * - select the product
   * - prefill its standard selling price
   * - reset quantity to 1
   * - focus quantity
   */
  useEffect(() => {
    if (
      !barcodeState.success ||
      !barcodeState.product
    ) {
      return;
    }

    setSelectedProductId(
      barcodeState.product.id
    );

    setSalePrice(
      minorUnitsToInput(
        barcodeState.product.sellingPrice
      )
    );

    setQuantity("1");

    window.setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 0);
  }, [
    barcodeState.success,
    barcodeState.product,
  ]);

  /*
   * After a successful sale:
   * clear the sale and return focus to
   * the barcode field for the next scan.
   */
  useEffect(() => {
    if (!saleState.success) {
      return;
    }

    setBarcode("");
    setSelectedProductId("");
    setQuantity("1");
    setSalePrice("");

    window.setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 0);
  }, [saleState.success]);

  function handleManualProductChange(
    productId: string
  ) {
    setSelectedProductId(productId);

    const product =
      products.find(
        (item) => item.id === productId
      ) ?? null;

    if (!product) {
      setSalePrice("");
      return;
    }

    setSalePrice(
      minorUnitsToInput(
        product.sellingPrice
      )
    );

    setQuantity("1");
  }

  const outOfStock =
    selectedProduct !== null &&
    selectedProduct.stockQuantity <= 0;

  const requestedQuantity =
    Number(quantity);

  const insufficientStock =
    selectedProduct !== null &&
    Number.isInteger(requestedQuantity) &&
    requestedQuantity > 0 &&
    requestedQuantity >
      selectedProduct.stockQuantity;

  const canSubmit =
    Boolean(selectedProductId) &&
    !outOfStock &&
    !insufficientStock &&
    !salePending;

  return (
    <div className="space-y-6">
      {/* Barcode lookup */}
      <section className="rounded-xl border bg-slate-50 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900">
            Scan barcode
          </h3>

          <p className="text-sm text-slate-600">
            Scan a product barcode or enter it
            manually.
          </p>
        </div>

        <form
          action={barcodeAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex-1">
            <label
              htmlFor="sale-barcode"
              className="sr-only"
            >
              Barcode
            </label>

            <Input
              ref={barcodeInputRef}
              id="sale-barcode"
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
              placeholder="Scan or enter barcode"
              disabled={barcodePending}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            disabled={
              barcodePending ||
              barcode.trim().length === 0
            }
          >
            {barcodePending
              ? "Finding..."
              : "Find product"}
          </Button>
        </form>

        <p className="mt-2 text-xs text-slate-500">
          USB and Bluetooth scanners that work
          as a keyboard are supported. Scanner
          Enter will search automatically.
        </p>

        {barcodeState.message ? (
          <p
            role="alert"
            className="mt-3 text-sm font-medium text-red-600"
          >
            {barcodeState.message}
          </p>
        ) : null}
      </section>

      {/* Actual sale form */}
      <form
        action={saleAction}
        className="space-y-5"
      >
        <div className="space-y-2">
          <label
            htmlFor="sale-product"
            className="text-sm font-medium text-slate-700"
          >
            Product
          </label>

          <select
            id="sale-product"
            name="productId"
            required
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
             * If barcode found a product with
             * stock 0, it might not exist in
             * the normal sale dropdown.
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
        </div>

        {selectedProduct ? (
          <div className="rounded-lg border bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Product selected
            </p>

            <h3 className="mt-1 font-semibold text-slate-900">
              {selectedProduct.name}
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">
                  SKU
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedProduct.sku}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Current stock
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedProduct.stockQuantity.toLocaleString(
                    locale
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Standard price
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatMoney(
                    selectedProduct.sellingPrice,
                    currency,
                    locale
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="sale-quantity"
              className="text-sm font-medium text-slate-700"
            >
              Quantity
            </label>

            <Input
              ref={quantityInputRef}
              id="sale-quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              disabled={!selectedProduct}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sale-price"
              className="text-sm font-medium text-slate-700"
            >
              Actual sale price
            </label>

            <Input
              id="sale-price"
              name="salePrice"
              type="text"
              inputMode="decimal"
              required
              value={salePrice}
              onChange={(event) =>
                setSalePrice(
                  event.target.value
                )
              }
              placeholder="0.00"
              disabled={!selectedProduct}
            />

            <p className="text-xs text-slate-500">
              Price per unit in{" "}
              <span className="font-medium">
                {currency === "ETB"
                  ? "Birr"
                  : currency}
              </span>
              . You may change it for this sale.
            </p>
          </div>
        </div>

        {outOfStock ? (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            This product is out of stock and
            cannot be sold.
          </p>
        ) : null}

        {insufficientStock ? (
          <p
            role="alert"
            className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800"
          >
            Only{" "}
            {selectedProduct?.stockQuantity.toLocaleString(
              locale
            )}{" "}
            item(s) are currently available.
          </p>
        ) : null}

        {saleState.error ? (
          <p
            role="alert"
            className="text-sm font-medium text-red-600"
          >
            {saleState.error}
          </p>
        ) : null}

        {saleState.success ? (
          <p
            role="status"
            className="text-sm font-medium text-emerald-700"
          >
            Sale registered successfully.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {salePending
            ? "Registering..."
            : "Register sale"}
        </Button>
      </form>
    </div>
  );
}