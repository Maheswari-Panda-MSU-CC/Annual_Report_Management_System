"use client"

import React, { useMemo, useState, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Button } from "./button"
import { Input } from "./input"
import { Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"

interface EnhancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  selectable?: boolean
  exportable?: boolean
  pageSize?: number
  onRowClick?: (row: TData) => void
  className?: string
  enableGlobalFilter?: boolean
  emptyMessage?: string
  customFilters?: React.ReactNode
  wrapperClassName?: string
}

export function EnhancedDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  selectable = false,
  exportable = true,
  pageSize = 25,
  onRowClick,
  className,
  enableGlobalFilter = true,
  emptyMessage = "No results found.",
  customFilters,
  wrapperClassName,
}: EnhancedDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Add selection column if selectable
  const tableColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!selectable) return columns
    
    return [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      },
      ...columns,
    ]
  }, [columns, selectable])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    enableRowSelection: selectable,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  })

  // Helper function to extract text from React elements or values
  const extractTextFromValue = (value: any): string => {
    if (value === null || value === undefined) return ""
    
    // If it's a string, return as is
    if (typeof value === "string") return value
    
    // If it's a number or boolean, convert to string
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    
    // If it's an object (React element or complex object), try to extract text
    if (typeof value === "object") {
      // Try to get text content from React element
      if (value?.props?.children) {
        const children = Array.isArray(value.props.children) 
          ? value.props.children 
          : [value.props.children]
        return children
          .map((child: any) => {
            if (typeof child === "string") return child
            if (typeof child === "number") return String(child)
            if (child?.props?.children) return extractTextFromValue(child)
            return ""
          })
          .filter(Boolean)
          .join(" ")
      }
      
      // Fallback: convert to string and clean HTML tags
      const text = String(value).replace(/<[^>]*>/g, "").trim()
      return text || ""
    }
    
    return String(value)
  }

  // Export to Excel
  const exportToExcel = useCallback(() => {
    try {
      const selectedRows = table.getFilteredSelectedRowModel().rows.length > 0
        ? table.getFilteredSelectedRowModel().rows
        : table.getRowModel().rows

      // Get all visible columns except action/document columns
      const exportableColumns = tableColumns.filter(
        (col) => col.id !== "select" && col.id !== "actions" && col.id !== "supportingDocument"
      )

      // Extract headers
      const headers = exportableColumns.map((col) => {
        if (typeof col.header === "string") return col.header
        if (typeof col.header === "function") {
          try {
            const headerContext = { column: { id: col.id || col.accessorKey || "" } } as any
            const headerResult = col.header(headerContext)
            if (typeof headerResult === "string") return headerResult
            // Try to extract from React element
            return extractTextFromValue(headerResult) || col.id || col.accessorKey || ""
          } catch {
            return col.id || col.accessorKey || ""
          }
        }
        return col.id || col.accessorKey || ""
      })

      // Extract row data
      const rows = selectedRows.map((row) => {
        return exportableColumns.map((col) => {
          try {
            const accessorKey = col.id || col.accessorKey || ""
            // Get raw value from row.original
            const rawValue = row.original[accessorKey as keyof typeof row.original]
            
            // If raw value exists, use it directly
            if (rawValue !== undefined && rawValue !== null) {
              return extractTextFromValue(rawValue)
            }
            
            // Otherwise, try to get from cell renderer
            const cellValue = row.getValue(accessorKey)
            return extractTextFromValue(cellValue)
          } catch (error) {
            console.warn("Error extracting cell value:", error)
            return ""
          }
        })
      })

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
      
      // Auto-size columns
      const maxWidth = 50
      const colWidths = headers.map((_, colIndex) => {
        const columnData = rows.map(row => String(row[colIndex] || ""))
        const maxLength = Math.max(
          headers[colIndex]?.length || 0,
          ...columnData.map(cell => cell.length)
        )
        return { wch: Math.min(maxLength + 2, maxWidth) }
      })
      worksheet["!cols"] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
      XLSX.writeFile(workbook, `export_${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Error exporting to Excel:", error)
      alert("Failed to export Excel. Please try again.")
    }
  }, [table, tableColumns])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Search and Export Bar - Only show if enabled */}
      {(enableGlobalFilter || exportable || customFilters) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          {enableGlobalFilter && (
            <div className="relative flex-1 w-full sm:w-auto sm:min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-10 w-full sm:w-auto"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          {customFilters && <div className="w-full sm:w-auto">{customFilters}</div>}
          {exportable && (
            <Button onClick={exportToExcel} variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          )}
        </div>
      )}

      {/* Table - EXACT SAME WRAPPER AS BEFORE */}
      <div className={cn("rounded-md border overflow-x-auto", wrapperClassName)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const isSorted = header.column.getIsSorted()
                  
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap text-xs sm:text-sm", // EXACT SAME CLASSES
                        canSort && "cursor-pointer select-none hover:bg-muted/50",
                        isSorted && "bg-muted/30"
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="flex items-center">
                            {isSorted === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-primary" />
                            ) : isSorted === "desc" ? (
                              <ArrowDown className="h-3 w-3 text-primary" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className || ""}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination - Always show if there's data */}
      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
            {selectable && table.getFilteredSelectedRowModel().rows.length > 0 && (
              <span className="ml-2">
                ({table.getFilteredSelectedRowModel().rows.length} selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm ml-1"
              >
                {[10, 25, 50, 100, 200].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-sm px-2 text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 px-2"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

