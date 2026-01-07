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
import { SimmortalsUser, UserAccountStatus } from '@/types/user';
import { exportToCSV } from '@/utils/export';
import { formatDate } from '@/utils/date';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable({ columns, data }: DataTableProps<SimmortalsUser, SimmortalsUser>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const router = useRouter();

  // Filter states
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = React.useState<string>('all');
  const [loginMethodFilter, setLoginMethodFilter] = React.useState<string>('all');
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);

  // Apply custom filters
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Email verified filter
      if (emailVerifiedFilter === 'verified' && !item.emailVerified) return false;
      if (emailVerifiedFilter === 'not-verified' && item.emailVerified) return false;

      // Login method filter
      if (loginMethodFilter !== 'all' && item.loginMethod !== loginMethodFilter) return false;

      // Date range filter (joinedAt)
      if (dateFrom && item.joinedAt) {
        const itemDate = new Date(item.joinedAt);
        if (itemDate < dateFrom) return false;
      }
      if (dateTo && item.joinedAt) {
        const itemDate = new Date(item.joinedAt);
        if (itemDate > dateTo) return false;
      }

      return true;
    });
  }, [data, statusFilter, emailVerifiedFilter, loginMethodFilter, dateFrom, dateTo]);

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setEmailVerifiedFilter('all');
    setLoginMethodFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setGlobalFilter('');
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    emailVerifiedFilter !== 'all' ||
    loginMethodFilter !== 'all' ||
    dateFrom !== undefined ||
    dateTo !== undefined ||
    globalFilter !== '';

  // Export filtered data as CSV
  const handleExportCSV = () => {
    // Apply global filter to the already filtered data
    const dataToExport = globalFilter
      ? filteredData.filter((item) => {
          const searchStr = globalFilter.toLowerCase();
          return (
            item.userId.toLowerCase().includes(searchStr) ||
            item.firstName.toLowerCase().includes(searchStr) ||
            item.lastName.toLowerCase().includes(searchStr) ||
            item.email.toLowerCase().includes(searchStr)
          );
        })
      : filteredData;

    exportToCSV<SimmortalsUser>(dataToExport, `users-export-${format(new Date(), 'yyyy-MM-dd')}`, [
      { key: 'userId', header: 'User ID' },
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      {
        key: 'emailVerified',
        header: 'Email Verified',
        formatter: (value) => (value ? 'Yes' : 'No'),
      },
      { key: 'loginMethod', header: 'Login Method' },
      { key: 'phoneNumber', header: 'Phone Number' },
      {
        key: 'phoneNumberVerified',
        header: 'Phone Verified',
        formatter: (value) => (value ? 'Yes' : 'No'),
      },
      { key: 'profilePictureUrl', header: 'Profile Picture URL' },
      { key: 'location', header: 'Location' },
      {
        key: 'dateOfBirth',
        header: 'Date of Birth',
        formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY') : ''),
      },
      {
        key: 'joinedAt',
        header: 'Joined At',
        formatter: (value) => (value ? formatDate(value as string, 'DD MMM YYYY') : ''),
      },
      { key: 'status', header: 'Status' },
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
          <label className="text-sm font-medium">Account Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Verified Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Email Status</label>
          <Select value={emailVerifiedFilter} onValueChange={setEmailVerifiedFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All emails" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All emails</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="not-verified">Not verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Login Method Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Login Method</label>
          <Select value={loginMethodFilter} onValueChange={setLoginMethodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="emailpassword">Email/Password</SelectItem>
              <SelectItem value="thirdparty">Third Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Joined From</label>
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
          <label className="text-sm font-medium">Joined To</label>
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
                  onClick={() => {
                    router.push(`users/${(row.original as SimmortalsUser).userId}`);
                  }}
                  className="h-16 cursor-pointer">
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
