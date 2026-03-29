import { FormEvent, ReactNode, useState, useEffect } from 'react';
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
import { Form, FormFields } from '@/components/ui/form';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, XIcon } from 'lucide-react';
import { DatabaseUser } from '@/types/database-user';
import FormSuccessful from '@/components/form-successful';
import { FormPassword, FormSelect, FormCheckbox, FormInput } from '@/components/form';

type EditForm = {
  password: string;
  remote: boolean;
  host?: string;
  permission: string;
};

const EditDatabaseUser = ({
  databaseUser,
  onDatabaseUserUpdated,
  children,
}: {
  databaseUser: DatabaseUser;
  onDatabaseUserUpdated?: () => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const form = useForm<EditForm>({
    password: '',
    remote: databaseUser.host !== 'localhost',
    host: databaseUser.host,
    permission: databaseUser.permission,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.put(route('database-users.update', { server: databaseUser.server_id, databaseUser: databaseUser.id }), {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        if (onDatabaseUserUpdated) {
          onDatabaseUserUpdated();
        }
      },
    });
  };

  useEffect(() => {
    if (open) {
      form.setData({
        password: '',
        remote: databaseUser.host !== 'localhost',
        host: databaseUser.host,
        permission: databaseUser.permission,
      });
    }
  }, [open, databaseUser.host, databaseUser.permission]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Edit database user [{databaseUser.username}]</DialogTitle>
              <DialogDescription>Update password, permissions, or remote access</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <Form className="p-5" id="edit-database-user-form" onSubmit={submit}>
              <FormFields>
                <FormPassword
                  label="New Password"
                  name="password"
                  value={form.data.password}
                  onChange={(e) => form.setData('password', e.target.value)}
                  error={form.errors.password}
                  description="Leave blank to keep current password"
                />
                <FormSelect
                  label="Permission"
                  value={form.data.permission}
                  onValueChange={(value) => form.setData('permission', value)}
                  options={[
                    { value: 'admin', label: 'Admin (Full Access)' },
                    { value: 'write', label: 'Write (No Drop/Truncate)' },
                    { value: 'read', label: 'Read Only' },
                  ]}
                  placeholder="Select permission"
                  error={form.errors.permission}
                />
                <FormCheckbox
                  label="Allow remote connection"
                  checked={form.data.remote}
                  onCheckedChange={(checked) => form.setData('remote', !!checked)}
                  error={form.errors.remote}
                />
                {form.data.remote && (
                  <FormInput
                    label="Allow connection from (% for all)"
                    name="host"
                    value={form.data.host}
                    onChange={(e) => form.setData('host', e.target.value)}
                    error={form.errors.host}
                  />
                )}
              </FormFields>
            </Form>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={submit} disabled={form.processing}>
              {form.processing && <LoaderCircle className="animate-spin" />}
              <FormSuccessful successful={form.recentlySuccessful} />
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDatabaseUser;
