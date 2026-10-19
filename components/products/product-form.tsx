"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";

import {
  Loader2,
  PackagePlus,
} from "lucide-react";

import {
  createProductAction,
  type CreateProductState,
} from "@/app/products/actions";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreateProductState = {};

type ProductFormProps = {
  isAdmin: boolean;
};

export function ProductForm({
  isAdmin,
}: ProductFormProps) {
  const formRef =
    useRef<HTMLFormElement>(null);

  const [state, formAction, pending] =
    useActionState(
      createProductAction,
      initialState
    );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-slate-700"
          >
            Product name
          </label>

          <Input
            id="name"
            name="name"
            required
            maxLength={150}
            disabled={pending}
            placeholder="Example product"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="sku"
            className="text-sm font-medium text-slate-700"
          >
            SKU
          </label>

          <Input
            id="sku"
            name="sku"
            required
            maxLength={80}
            disabled={pending}
            placeholder="PROD-001"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="barcode"
            className="text-sm font-medium text-slate-700"
          >
            Barcode
          </label>

          <Input
            id="barcode"
            name="barcode"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={64}
            disabled={pending}
            placeholder="Scan or enter barcode"
          />

          <p className="text-sm text-muted-foreground">
            Scan the barcode or enter it
            manually.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <Input
            id="category"
            name="category"
            maxLength={100}
            disabled={pending}
            placeholder="Electronics"
          />
        </div>

        {isAdmin ? (
          <div className="space-y-2">
            <label
              htmlFor="purchasePrice"
              className="text-sm font-medium text-slate-700"
            >
              Purchase price
            </label>

            <Input
              id="purchasePrice"
              name="purchasePrice"
              inputMode="decimal"
              required
              disabled={pending}
              placeholder="79,90"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="sellingPrice"
            className="text-sm font-medium text-slate-700"
          >
            Selling price
          </label>

          <Input
            id="sellingPrice"
            name="sellingPrice"
            inputMode="decimal"
            required
            disabled={pending}
            placeholder="129,90"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="stockQuantity"
            className="text-sm font-medium text-slate-700"
          >
            Stock quantity
          </label>

          <Input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min={0}
            step={1}
            defaultValue={0}
            required
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="lowStockThreshold"
            className="text-sm font-medium text-slate-700"
          >
            Low stock threshold
          </label>

          <Input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            step={1}
            defaultValue={5}
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          disabled={pending}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Optional product description"
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

      {state.success ? (
        <p
          role="status"
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          Product added successfully.
        </p>
      ) : null}

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
            Adding product...
          </>
        ) : (
          <>
            <PackagePlus
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            Add product
          </>
        )}
      </Button>
    </form>
  );
}