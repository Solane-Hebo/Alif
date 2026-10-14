type StockMovementItem = {
  id: string;
  productName: string;
  productSku: string;
  type: string;
  quantityChange: number;
  stockBefore: number;
  stockAfter: number;
  performedByName: string;
  note: string;
  createdAt: string;
};

type Props = {
  movements: StockMovementItem[];
};

function movementLabel(type: string) {
  switch (type) {
    case "SALE":
      return "Sale";

    case "SALE_VOID":
      return "Sale void";

    case "INITIAL":
      return "Initial stock";

    case "ADJUSTMENT":
      return "Adjustment";

    default:
      return type;
  }
}

export function StockMovementHistory({
  movements,
}: Props) {
  if (movements.length === 0) {
    return (
      <div className="rounded-xl border bg-white px-4 py-10 text-center text-sm text-slate-500">
        No stock movements recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-semibold">
              Product
            </th>

            <th className="px-4 py-3 font-semibold">
              Type
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Change
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Before
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              After
            </th>

            <th className="px-4 py-3 font-semibold">
              Performed by
            </th>

            <th className="px-4 py-3 font-semibold">
              Date
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {movements.map(
            (movement) => (
              <tr key={movement.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {
                      movement.productName
                    }
                  </div>

                  <div className="text-xs text-slate-500">
                    {
                      movement.productSku
                    }
                  </div>
                </td>

                <td className="px-4 py-3">
                  {movementLabel(
                    movement.type
                  )}
                </td>

                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    movement.quantityChange >
                    0
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {movement.quantityChange >
                  0
                    ? "+"
                    : ""}
                  {
                    movement.quantityChange
                  }
                </td>

                <td className="px-4 py-3 text-right">
                  {
                    movement.stockBefore
                  }
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  {
                    movement.stockAfter
                  }
                </td>

                <td className="px-4 py-3 text-slate-600">
                  {
                    movement.performedByName
                  }
                </td>

                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {new Intl.DateTimeFormat(
                    "sv-SE",
                    {
                      dateStyle:
                        "medium",
                      timeStyle:
                        "short",
                    }
                  ).format(
                    new Date(
                      movement.createdAt
                    )
                  )}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}