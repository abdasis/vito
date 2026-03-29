import { ColumnDef } from '@tanstack/react-table';
import DateTime from '@/components/date-time';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useForm, usePage } from '@inertiajs/react';
import { LoaderCircleIcon, MoreVerticalIcon, XIcon } from 'lucide-react';
import FormSuccessful from '@/components/form-successful';
import { useState } from 'react';
import { DatabaseUser } from '@/types/database-user';
import { Database } from '@/types/database';
import { Form, FormFields } from '@/components/ui/form';
import { FormMultiSelect } from '@/components/form';
import { Badge } from '@/components/ui/badge';
import EditDatabaseUser from './edit-database-user';

const Link = ({ databaseUser }: { databaseUser: DatabaseUser }) => {
  const [open, setOpen] = useState(false);
  const page = usePage<{
    databases: Database[];
  }>();
  const form = useForm<{
    databases: string[];
  }>({
    databases: databaseUser.databases,
  });

  const databases = page.props.databases.map((database) => ({
    value: database.name,
    label: database.name,
  }));

  const submit = () => {
    form.put(route('database-users.link', { server: databaseUser.server_id, databaseUser: databaseUser.id }), {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Link</DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Link database user [{databaseUser.username}]</DialogTitle>
              <DialogDescription>Select databases to link with this user</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <Form id="link-database-user" onSubmit={submit} className="p-5">
              <FormFields>
                <FormMultiSelect
                  label="Databases"
                  options={databases}
                  onValueChange={(value) => form.setData('databases', value)}
                  defaultValue={form.data.databases}
                  placeholder="Select database"
                  maxCount={5}
                  error={form.errors.databases}
                />
              </FormFields>
            </Form>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={form.processing} onClick={submit}>
              {form.processing && <LoaderCircleIcon className="animate-spin" />}
              <FormSuccessful successful={form.recentlySuccessful} />
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Delete = ({ databaseUser }: { databaseUser: DatabaseUser }) => {
  const [open, setOpen] = useState(false);
  const form = useForm();

  const submit = () => {
    form.delete(route('database-users.destroy', { server: databaseUser.server_id, databaseUser: databaseUser.id }), {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Delete database user [{databaseUser.username}]</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="p-5">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete database user <strong className="text-foreground">{databaseUser.username}</strong>?
            </p>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" disabled={form.processing} onClick={submit}>
              {form.processing && <LoaderCircleIcon className="animate-spin" />}
              <FormSuccessful successful={form.recentlySuccessful} />
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const columns: ColumnDef<DatabaseUser>[] = [
  {
    accessorKey: 'username',
    header: 'Username',
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    accessorKey: 'permission',
    header: 'Permission',
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.permission}</Badge>;
    },
  },
  {
    accessorKey: 'databases',
    header: 'Linked databases',
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          {row.original.databases.map((database) => (
            <Badge key={database} variant="outline" className="mr-1">
              {database}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created at',
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      return <DateTime date={row.original.created_at} />;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      return <Badge variant={row.original.status_color}>{row.original.status}</Badge>;
    },
  },
  {
    id: 'actions',
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditDatabaseUser databaseUser={row.original}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
              </EditDatabaseUser>
              <Link databaseUser={row.original} />
              <DropdownMenuSeparator />
              <Delete databaseUser={row.original} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
