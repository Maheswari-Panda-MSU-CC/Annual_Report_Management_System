"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedDataTable } from "@/components/ui/enhanced-data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react"
import { DocumentViewer } from "@/components/document-viewer"
import { formatDateForDisplay, displayValue } from "../utils"

interface StudentBodyEventsTabProps {
  data: any[]
  isLoading: boolean
  onAdd: () => void
  onEdit: (item: any) => void
  onDelete: (eventId: number, itemName: string, item?: any) => void
}

export function StudentBodyEventsTab({
  data,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: StudentBodyEventsTabProps) {
  const columns = useMemo<ColumnDef<any>[]>(() => [
    { 
      accessorKey: "srNo", 
      header: "Sr No.", 
      enableSorting: true, 
      cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.srNo)}</span>, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } 
    },
    { 
      accessorKey: "title", 
      header: "Title", 
      enableSorting: true, 
      cell: ({ row }) => {
        const title = displayValue(row.original.title)
        return <div className="font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" title={title}>{title}</div>
      }, 
      meta: { className: "font-medium text-xs sm:text-sm px-2 sm:px-4 max-w-[120px] sm:max-w-none truncate" } 
    },
    { 
      accessorKey: "date", 
      header: "Start Date", 
      enableSorting: true, 
      cell: ({ row }) => {
        const date = formatDateForDisplay(row.original.date)
        return <div className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-4 min-w-[120px]"><Calendar className="h-3 w-3 text-gray-400 shrink-0" /><span className="whitespace-nowrap">{date}</span></div>
      }, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4 min-w-[120px]" } 
    },
    { 
      accessorKey: "days", 
      header: "No. of Days", 
      enableSorting: true, 
      cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.days)}</span>, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } 
    },
    { 
      accessorKey: "place", 
      header: "Venue", 
      enableSorting: true, 
      cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.place)}</span>, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } 
    },
    { 
      accessorKey: "level", 
      header: "Level", 
      enableSorting: true, 
      cell: ({ row }) => {
        const levelName = row.original.Events_Stud_Body_Level_Name
        return <Badge variant="secondary" className="text-[10px] sm:text-xs">{displayValue(levelName)}</Badge>
      }, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } 
    },
    { 
      accessorKey: "participants_num", 
      header: "No. of Participants", 
      enableSorting: true, 
      cell: ({ row }) => <span className="text-xs sm:text-sm px-2 sm:px-4">{displayValue(row.original.participants_num)}</span>, 
      meta: { className: "text-xs sm:text-sm px-2 sm:px-4" } 
    },
    { 
      accessorKey: "speaker_name", 
      header: "Name of Key Speakers", 
      enableSorting: true, 
      cell: ({ row }) => {
        const speakers = displayValue(row.original.speaker_name)
        return <div className="max-w-[120px] sm:max-w-xs px-2 sm:px-4 truncate text-xs sm:text-sm" title={speakers}>{speakers}</div>
      }, 
      meta: { className: "max-w-[120px] sm:max-w-xs px-2 sm:px-4" } 
    },
    {
      id: "document",
      header: "Image",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            {item.supportingDocument && item.supportingDocument.length > 0 && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="View Document" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3" onClick={(e) => e.stopPropagation()}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="w-[95vw] sm:w-[90vw] max-w-4xl h-[85vh] sm:h-[80vh] p-0 overflow-hidden"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <DialogHeader className="p-4 border-b">
                      <DialogTitle>View Document</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="w-full h-full">
                        <DocumentViewer
                          documentUrl={item.supportingDocument[0]}
                          documentType={item.supportingDocument?.[0]?.split('.').pop()?.toLowerCase() || ''}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Badge variant="outline" className="text-xs">
                  file
                </Badge>
              </>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(item) }} className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3">
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { 
                e.stopPropagation()
                onDelete(item.id, item.title || "this record", item)
              }}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [onEdit, onDelete])

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          Seminars/Conferences/Workshops organized by Students' Associations/Bodies
        </CardTitle>
        <Button
          onClick={onAdd}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        <EnhancedDataTable
          columns={columns}
          data={data || []}
          loading={isLoading}
          pageSize={10}
          exportable={true}
          enableGlobalFilter={true}
          emptyMessage="No events found. Click 'Add Event' to get started."
          wrapperClassName="rounded-md border overflow-x-auto"
        />
      </CardContent>
    </Card>
  )
}

