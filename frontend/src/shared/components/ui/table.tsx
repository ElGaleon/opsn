import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";

type SortState = { index: number; direction: "asc" | "desc" } | null;

type TableProps = React.ComponentProps<"table"> & {
  emptyMessage?: string;
  pageSize?: number;
};

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(" ");
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

function elementChildren(node: React.ReactNode) {
  return React.Children.toArray(node).filter(
    React.isValidElement,
  ) as React.ReactElement<{
    children?: React.ReactNode;
    className?: string;
    onClick?: React.MouseEventHandler;
  }>[];
}

function isElementType(element: React.ReactElement, type: string) {
  return typeof element.type === "string" && element.type === type;
}

function rowCellText(
  row: React.ReactElement<{ children?: React.ReactNode }>,
  index: number,
) {
  return textOf(elementChildren(row.props.children)[index]?.props.children)
    .trim()
    .toLowerCase();
}

export function Table({
  className,
  children,
  emptyMessage = "Nessun risultato trovato.",
  pageSize = 10,
  ...props
}: TableProps) {
  const [sort, setSort] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(1);
  const parts = elementChildren(children);
  const thead = parts.find((part) => isElementType(part, "thead"));
  const tbody = parts.find((part) => isElementType(part, "tbody"));
  const bodyRows = tbody
    ? elementChildren(tbody.props.children).filter((row) =>
        isElementType(row, "tr"),
      )
    : [];
  const headRow = thead
    ? elementChildren(thead.props.children).find((row) =>
        isElementType(row, "tr"),
      )
    : null;
  const headCells = headRow ? elementChildren(headRow.props.children) : [];
  const columnCount = headRow
    ? elementChildren(headRow.props.children).length
    : elementChildren(bodyRows[0]?.props.children).length || 1;
  const sortedRows = React.useMemo(() => {
    if (!sort) return bodyRows;
    return [...bodyRows].sort((a, b) => {
      const aText = rowCellText(a, sort.index);
      const bText = rowCellText(b, sort.index);
      const aNumber = Number(aText.replace(/[^\d,-]/g, "").replace(",", "."));
      const bNumber = Number(bText.replace(/[^\d,-]/g, "").replace(",", "."));
      const result =
        Number.isFinite(aNumber) && Number.isFinite(bNumber) && aText && bText
          ? aNumber - bNumber
          : aText.localeCompare(bText, "it", { numeric: true });
      return sort.direction === "asc" ? result : -result;
    });
  }, [bodyRows, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const visibleRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [bodyRows.length, sort?.index, sort?.direction]);

  const enhancedHead =
    thead && headRow
      ? React.cloneElement(thead, {
          children: React.cloneElement(headRow, {
            children: elementChildren(headRow.props.children).map(
              (cell, index) => {
                const active = sort?.index === index;
                const nextDirection =
                  active && sort.direction === "asc" ? "desc" : "asc";
                return React.cloneElement(
                  cell as React.ReactElement<React.ComponentProps<"th">>,
                  {
                    className: cn(
                      cell.props.className,
                      "cursor-pointer select-none",
                    ),
                    onClick: () => setSort({ index, direction: nextDirection }),
                    children: (
                      <span className="flex items-center gap-1">
                        <span>{cell.props.children}</span>
                        {active ? (
                          sort.direction === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronDown size={14} className="opacity-25" />
                        )}
                      </span>
                    ),
                  },
                );
              },
            ),
          }),
        })
      : thead;
  const enhancedBody = tbody
    ? React.cloneElement(tbody, {
        children: visibleRows.length ? (
          visibleRows
        ) : (
          <tr>
            <td
              className="px-5 py-8 text-center text-sm text-stone-500"
              colSpan={columnCount}
            >
              {emptyMessage}
            </td>
          </tr>
        ),
      })
    : tbody;
  const enhancedChildren = parts.map((part) =>
    part === thead ? enhancedHead : part === tbody ? enhancedBody : part,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-emerald-950/10 bg-white">
      <div className="space-y-2 p-3 md:hidden">
        {visibleRows.length ? (
          visibleRows.map((row, rowIndex) => {
            const cells = elementChildren(row.props.children);
            return (
              <div
                key={row.key ?? rowIndex}
                className={cn(
                  "space-y-3 rounded-lg border border-emerald-950/10 bg-white p-3",
                  row.props.onClick ? "cursor-pointer active:bg-stone-50" : "",
                )}
                onClick={row.props.onClick}
              >
                {cells.map((cell, index) => {
                  const label =
                    textOf(headCells[index]?.props.children) ||
                    `Campo ${index + 1}`;
                  if (label.toLowerCase() === "azioni") return null;
                  return (
                    <div
                      key={cell.key ?? index}
                      className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3 text-sm"
                    >
                      <span className="text-xs font-semibold uppercase text-stone-500">
                        {label}
                      </span>
                      <div className="min-w-0 text-stone-950">
                        {cell.props.children}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-emerald-950/15 p-6 text-center text-sm text-stone-500">
            {emptyMessage}
          </div>
        )}
      </div>
      <div className="hidden w-full overflow-x-auto md:block">
        <table
          className={cn(
            "w-full min-w-[760px] bg-white text-left text-sm tabular-nums [&_tbody_tr:nth-child(even)]:bg-stone-50/50 [&_tbody_tr:hover]:bg-emerald-50/50",
            className,
          )}
          {...props}
        >
          {enhancedChildren}
        </table>
      </div>
      {sortedRows.length > pageSize ? (
        <div className="flex flex-col gap-3 border-t border-emerald-950/10 px-3 py-3 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Pagina {page} di {totalPages}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              className="rounded-md border border-emerald-950/10 px-3 py-1.5 disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Precedente
            </button>
            <button
              className="rounded-md border border-emerald-950/10 px-3 py-1.5 disabled:opacity-40"
              disabled={page === totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Successiva
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Th({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-b border-emerald-950/10 bg-stone-50/80 px-3 py-2.5 text-xs font-semibold uppercase text-stone-600",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "border-b border-emerald-950/10 px-3 py-2.5 align-middle text-stone-950",
        className,
      )}
      {...props}
    />
  );
}

export function TableActions({
  label = "Azioni",
  onEdit,
  onDelete,
}: {
  label?: string;
  onEdit?: () => void;
  onDelete?: () => void | Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  return (
    <Td className="w-28">
      <div className="relative flex items-center justify-end gap-2">
        <ChevronRight
          className="text-stone-500 opacity-0 transition-opacity group-hover:opacity-100"
          size={20}
          aria-hidden="true"
        />
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-950"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <MoreHorizontal size={20} />
        </button>
        {open ? (
          <div
            className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-lg border border-stone-200 bg-white p-1 text-sm shadow-lg shadow-stone-950/10"
            onClick={(event) => event.stopPropagation()}
          >
            {onEdit ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-stone-700 hover:bg-stone-50"
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
              >
                <Pencil size={15} /> Modifica
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-red-700 hover:bg-red-50"
                onClick={() => {
                  setOpen(false);
                  setConfirmDelete(true);
                }}
              >
                <Trash2 size={15} /> Elimina
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/35 p-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-white p-5 shadow-xl shadow-stone-950/15">
            <h2 className="text-base font-semibold text-stone-950">
              Eliminare definitivamente?
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Questa operazione non può essere annullata.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-950/10 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-emerald-50"
                onClick={() => setConfirmDelete(false)}
              >
                Annulla
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-3 text-sm font-medium text-white shadow-sm shadow-red-900/20 hover:bg-red-700"
                onClick={async () => {
                  await onDelete?.();
                  setConfirmDelete(false);
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Td>
  );
}
