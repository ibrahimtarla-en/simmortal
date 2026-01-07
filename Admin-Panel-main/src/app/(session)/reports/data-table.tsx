'use client';
import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AdminMemorialFlag,
  MemorialFlagType,
  Memory,
  Condolence,
  Donation,
} from '@/types/memorial';
import { exportToCSV } from '@/utils/export';
import { formatDate } from '@/utils/date';
import { getMemoryById, getCondolenceById, getDonationById } from '@/services/server/contribution';
import ContributionPreview from '@/components/Reports/ContributionPreview/ContributionPreview';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type PreviewState =
  | {
      type: 'memory';
      contribution: Memory;
    }
  | {
      type: 'condolence';
      contribution: Condolence;
    }
  | {
      type: 'donation';
      contribution: Donation;
    }
  | null;

export function DataTable({ columns, data }: DataTableProps<AdminMemorialFlag, AdminMemorialFlag>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [previewState, setPreviewState] = React.useState<PreviewState>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [reasonFilter, setReasonFilter] = React.useState<string>('all');
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);

  // Apply custom filters
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Reason filter
      if (reasonFilter !== 'all' && item.reason !== reasonFilter) return false;

      // Date range filter (createdAt)
      if (dateFrom && item.createdAt) {
        const itemDate = new Date(item.createdAt);
        if (itemDate < dateFrom) return false;
      }
      if (dateTo && item.createdAt) {
        const itemDate = new Date(item.createdAt);
        if (itemDate > dateTo) return false;
      }

      return true;
    });
  }, [data, statusFilter, reasonFilter, dateFrom, dateTo]);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setReasonFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setGlobalFilter('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    reasonFilter !== 'all' ||
    dateFrom !== undefined ||
    dateTo !== undefined ||
    globalFilter !== '';

  // Handle preview
  const handlePreview = React.useCallback(async (flag: AdminMemorialFlag) => {
    console.log('Preview requested for flag:', flag);
    setIsLoadingPreview(true);
    try {
      if (flag.type === MemorialFlagType.MEMORY_REPORT) {
        console.log('Fetching memory:', flag.referenceId);
        const memory = await getMemoryById(flag.referenceId);
        console.log('Memory response:', memory);
        if (memory) {
          setPreviewState({ type: 'memory', contribution: memory });
        } else {
          console.warn('Memory not found');
          window.alert('Failed to load memory preview');
        }
      } else if (flag.type === MemorialFlagType.CONDOLENCE_REPORT) {
        console.log('Fetching condolence:', flag.referenceId);
        const condolence = await getCondolenceById(flag.referenceId);
        console.log('Condolence response:', condolence);
        if (condolence) {
          setPreviewState({ type: 'condolence', contribution: condolence });
        } else {
          console.warn('Condolence not found');
          window.alert('Failed to load condolence preview');
        }
      } else if (flag.type === MemorialFlagType.DONATION_REPORT) {
        console.log('Fetching donation:', flag.referenceId);
        const donation = await getDonationById(flag.referenceId);
        console.log('Donation response:', donation);
        if (donation) {
          setPreviewState({ type: 'donation', contribution: donation });
        } else {
          console.warn('Donation not found');
          window.alert('Failed to load donation preview');
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      window.alert('Error loading preview. Check console for details.');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Export filtered data as CSV
  const handleExportCSV = () => {
    // Apply global filter to the already filtered data
    const dataToExport = globalFilter
      ? filteredData.filter((item) => {
          const searchStr = globalFilter.toLowerCase();
          return (
            item.id.toLowerCase().includes(searchStr) ||
            item.memorialName.toLowerCase().includes(searchStr) ||
            (item.actor.name && item.actor.name.toLowerCase().includes(searchStr)) ||
            (item.memorialOwner.name && item.memorialOwner.name.toLowerCase().includes(searchStr))
          );
        })
      : filteredData;

    exportToCSV<AdminMemorialFlag>(
      dataToExport,
      `reports-export-${format(new Date(), 'yyyy-MM-dd')}`,
      [
        { key: 'id', header: 'Flag ID' },
        {
          key: 'createdAt',
          header: 'Created At',
          formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY HH:mm') : ''),
        },
        {
          key: 'statusUpdatedAt',
          header: 'Status Updated At',
          formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY HH:mm') : ''),
        },
        { key: 'status', header: 'Status' },
        { key: 'type', header: 'Type' },
        { key: 'referenceId', header: 'Reference ID' },
        { key: 'reason', header: 'Reason' },
        { key: 'actor.id', header: 'Reporter ID' },
        { key: 'actor.name', header: 'Reporter Name' },
        { key: 'memorialUrl', header: 'Memorial URL' },
        { key: 'memorialName', header: 'Memorial Name' },
        { key: 'memorialOwner.id', header: 'Memorial Owner ID' },
        { key: 'memorialOwner.name', header: 'Memorial Owner Name' },
      ],
    );
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    meta: {
      onPreview: handlePreview,
    },
  });

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Search..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleExportCSV} className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border p-4">
        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Report Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All reports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reports</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reason Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Report Reason</label>
          <Select value={reasonFilter} onValueChange={setReasonFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All reasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reasons</SelectItem>
              <SelectItem value="dislike">I don&apos;t like it</SelectItem>
              <SelectItem value="bullying">Bullying</SelectItem>
              <SelectItem value="harmful">Harmful content</SelectItem>
              <SelectItem value="violence">Violence/hate</SelectItem>
              <SelectItem value="promoting">Restricted items</SelectItem>
              <SelectItem value="explicit">Explicit content</SelectItem>
              <SelectItem value="scam">Scam/fraud</SelectItem>
              <SelectItem value="false-info">False info</SelectItem>
              <SelectItem value="copyright">Copyright</SelectItem>
              <SelectItem value="illegal">Illegal content</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Reported From</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground',
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Reported To</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[180px] justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground',
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-10">
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="h-16">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-muted-foreground text-sm">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}{' '}
          to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length,
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            Last
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      {previewState && (
        <ContributionPreview {...previewState} onClose={() => setPreviewState(null)} />
      )}

      {/* Loading overlay */}
      {isLoadingPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="text-lg text-white">Loading preview...</div>
        </div>
      )}
    </div>
  );
}
