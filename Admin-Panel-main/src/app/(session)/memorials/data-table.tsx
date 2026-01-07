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
import { useRouter } from 'next/navigation';
import { AdminMemorial, MemorialStatus } from '@/types/memorial';
import { exportToCSV } from '@/utils/export';
import { formatDate } from '@/utils/date';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable({ columns, data }: DataTableProps<AdminMemorial, AdminMemorial>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const router = useRouter();

  // Filter states
  const [featuredFilter, setFeaturedFilter] = React.useState<string>('all');
  const [premiumFilter, setPremiumFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [minViews, setMinViews] = React.useState<string>('');
  const [maxViews, setMaxViews] = React.useState<string>('');

  // Apply custom filters
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Featured filter
      if (featuredFilter === 'featured' && !item.isFeatured) return false;
      if (featuredFilter === 'not-featured' && item.isFeatured) return false;

      // Premium filter
      if (premiumFilter === 'premium' && !item.isPremium) return false;
      if (premiumFilter === 'not-premium' && item.isPremium) return false;

      // Status filter
      if (statusFilter === 'published' && item.status !== MemorialStatus.PUBLISHED) return false;
      if (statusFilter === 'draft' && item.status !== MemorialStatus.DRAFT) return false;
      if (statusFilter === 'removed' && item.status !== MemorialStatus.REMOVED) return false;

      // Date range filter
      if (dateFrom && item.createdAt) {
        const itemDate = new Date(item.createdAt);
        if (itemDate < dateFrom) return false;
      }
      if (dateTo && item.createdAt) {
        const itemDate = new Date(item.createdAt);
        if (itemDate > dateTo) return false;
      }

      // Views filter
      const views = item.stats?.views || 0;
      if (minViews && views < parseInt(minViews)) return false;
      if (maxViews && views > parseInt(maxViews)) return false;

      return true;
    });
  }, [data, featuredFilter, premiumFilter, statusFilter, dateFrom, dateTo, minViews, maxViews]);

  // Clear all filters
  const clearFilters = () => {
    setFeaturedFilter('all');
    setPremiumFilter('all');
    setStatusFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinViews('');
    setMaxViews('');
    setGlobalFilter('');
  };

  const hasActiveFilters =
    featuredFilter !== 'all' ||
    premiumFilter !== 'all' ||
    statusFilter !== 'all' ||
    dateFrom !== undefined ||
    dateTo !== undefined ||
    minViews !== '' ||
    maxViews !== '' ||
    globalFilter !== '';

  // Export filtered data as CSV
  const handleExportCSV = () => {
    // Apply global filter to the already filtered data
    const dataToExport = globalFilter
      ? filteredData.filter((item) => {
          const searchStr = globalFilter.toLowerCase();
          return (
            item.id.toLowerCase().includes(searchStr) ||
            item.name.toLowerCase().includes(searchStr) ||
            (item.slug && item.slug.toLowerCase().includes(searchStr))
          );
        })
      : filteredData;

    exportToCSV<AdminMemorial>(dataToExport, `memorials-export-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'id', header: 'Memorial ID' },
      { key: 'ownerId', header: 'Owner ID' },
      { key: 'name', header: 'Name' },
      { key: 'slug', header: 'Slug' },
      {
        key: 'dateOfBirth',
        header: 'Date of Birth',
        formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY') : ''),
      },
      {
        key: 'dateOfDeath',
        header: 'Date of Death',
        formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY') : ''),
      },
      { key: 'placeOfBirth', header: 'Place of Birth' },
      { key: 'placeOfDeath', header: 'Place of Death' },
      { key: 'originCountry', header: 'Origin Country' },
      { key: 'imagePath', header: 'Image Path' },
      { key: 'about', header: 'About' },
      { key: 'frame', header: 'Frame' },
      { key: 'tribute', header: 'Tribute' },
      { key: 'simmTagDesign', header: 'Simm Tag Design' },
      {
        key: 'isFeatured',
        header: 'Featured',
        formatter: (value) => (value ? 'Yes' : 'No'),
      },
      {
        key: 'isPremium',
        header: 'Premium',
        formatter: (value) => (value ? 'Yes' : 'No'),
      },
      {
        key: 'status',
        header: 'Status',
        formatter: (value) => (value as string).charAt(0).toUpperCase() + (value as string).slice(1),
      },
      {
        key: 'isLikedByUser',
        header: 'Liked By User',
        formatter: (value) => (value ? 'Yes' : 'No'),
      },
      {
        key: 'createdAt',
        header: 'Created At',
        formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY') : ''),
      },
      { key: 'stats.memories', header: 'Memories' },
      { key: 'stats.flowers', header: 'Flowers' },
      { key: 'stats.condolences', header: 'Condolences' },
      { key: 'stats.candles', header: 'Candles' },
      { key: 'stats.trees', header: 'Trees' },
      { key: 'stats.donations', header: 'Donations' },
      { key: 'stats.views', header: 'Views' },
      { key: 'stats.likes', header: 'Likes' },
    ]);
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
          <label className="text-sm font-medium">Memorial Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All memorials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All memorials</SelectItem>
              <SelectItem value="published">Published only</SelectItem>
              <SelectItem value="draft">Draft only</SelectItem>
              <SelectItem value="removed">Removed only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Featured Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Featured Status</label>
          <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All memorials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All memorials</SelectItem>
              <SelectItem value="featured">Featured only</SelectItem>
              <SelectItem value="not-featured">Not featured</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Premium Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Premium Status</label>
          <Select value={premiumFilter} onValueChange={setPremiumFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All memorials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All memorials</SelectItem>
              <SelectItem value="premium">Premium only</SelectItem>
              <SelectItem value="not-premium">Not premium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Created From</label>
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
          <label className="text-sm font-medium">Created To</label>
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

        {/* Min Views Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Min Views</label>
          <Input
            type="number"
            placeholder="0"
            value={minViews}
            onChange={(e) => setMinViews(e.target.value)}
            className="w-[120px]"
          />
        </div>

        {/* Max Views Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Max Views</label>
          <Input
            type="number"
            placeholder="∞"
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            className="w-[120px]"
          />
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
                  className="h-16 cursor-pointer"
                  onClick={() => router.push(`/memorials/${row.original.id}`)}>
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
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
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
    </div>
  );
}
