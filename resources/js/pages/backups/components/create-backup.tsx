import { Server } from '@/types/server';
import { FormEvent, ReactNode, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import InputError from '@/components/ui/input-error';
import { SharedData } from '@/types';
import StorageProviderSelect from '@/pages/storage-providers/components/storage-provider-select';
import DatabaseSelect from '@/pages/databases/components/database-select';
import { FormInput, FormLabel, FormSelect, FormSubmit } from '@/components/form';

const CreateBackup = ({ server, children }: { server: Server; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const page = usePage<SharedData>();

  const form = useForm<{
    type: string;
    database: string;
    path: string;
    storage: string;
    interval: string;
    custom_interval: string;
    keep: string;
  }>({
    type: 'file',
    database: '',
    path: '',
    storage: '',
    interval: 'daily',
    custom_interval: '',
    keep: '10',
  });

  const backupTypeOptions = [
    { value: 'file', label: 'File Backup' },
    ...(page.props.server?.services?.database ? [{ value: 'database', label: 'Database Backup' }] : []),
  ];

  const intervalOptions = Object.entries(page.props.configs.cronjob_intervals).map(([key, value]) => ({
    value: key,
    label: value as string,
  }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post(route('backups.store', { server: server.id }), {
      onSuccess: () => {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-3xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Create backup</DialogTitle>
              <DialogDescription>Configure a new backup for your server.</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-5">
              <Form id="create-backup-form" onSubmit={submit}>
                <FormFields>
                  <FormSelect
                    label="Backup Type"
                    value={form.data.type}
                    onValueChange={(value) => form.setData('type', value)}
                    options={backupTypeOptions}
                    placeholder="Select backup type"
                    error={form.errors.type}
                  />

                  {form.data.type === 'database' && (
                    <div className="grid gap-2">
                      <FormLabel htmlFor="database">Database</FormLabel>
                      <DatabaseSelect
                        id="database"
                        name="database"
                        serverId={server.id}
                        value={form.data.database}
                        onValueChange={(value) => form.setData('database', value)}
                      />
                      <InputError message={form.errors.database} />
                    </div>
                  )}

                  {form.data.type === 'file' && (
                    <FormInput
                      label="File/Directory Path"
                      value={form.data.path}
                      onChange={(e) => form.setData('path', e.target.value)}
                      placeholder="/var/www/html or /home/user/documents"
                      description="Specify the file or directory path to backup."
                      error={form.errors.path}
                    />
                  )}

                  <div className="grid gap-2">
                    <FormLabel htmlFor="storage">Storage</FormLabel>
                    <StorageProviderSelect
                      id="storage"
                      name="storage"
                      value={form.data.storage}
                      onValueChange={(value) => form.setData('storage', value)}
                    />
                    <InputError message={form.errors.storage} />
                  </div>

                  <FormSelect
                    label="Interval"
                    value={form.data.interval}
                    onValueChange={(value) => form.setData('interval', value)}
                    options={intervalOptions}
                    placeholder="Select an interval"
                    error={form.errors.interval}
                  />

                  {form.data.interval === 'custom' && (
                    <FormInput
                      label="Custom interval (crontab)"
                      value={form.data.custom_interval}
                      onChange={(e) => form.setData('custom_interval', e.target.value)}
                      placeholder="* * * * *"
                      error={form.errors.custom_interval}
                    />
                  )}

                  <FormInput
                    label="Backups to keep"
                    value={form.data.keep}
                    onChange={(e) => form.setData('keep', e.target.value)}
                    error={form.errors.keep}
                  />
                </FormFields>
              </Form>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-2">
              <FormSubmit form="create-backup-form" processing={form.processing}>
                Create
              </FormSubmit>
              <DialogClose asChild>
                <Button variant="outline" disabled={form.processing}>
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBackup;
