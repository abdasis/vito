import { Server } from '@/types/server';
import { FormEvent, ReactNode, useState } from 'react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import { SharedData } from '@/types';
import { Input } from '@/components/ui/input';
import StorageProviderSelect from '@/pages/storage-providers/components/storage-provider-select';
import DatabaseSelect from '@/pages/databases/components/database-select';
import { FormSubmit } from '@/components/form';

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
                  <FormField>
                    <Label htmlFor="type">Backup Type</Label>
                    <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select backup type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="file">File Backup</SelectItem>
                          {page.props.server?.services?.database && <SelectItem value="database">Database Backup</SelectItem>}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputError message={form.errors.type} />
                  </FormField>

                  {form.data.type === 'database' && (
                    <FormField>
                      <Label htmlFor="database">Database</Label>
                      <DatabaseSelect
                        id="database"
                        name="database"
                        serverId={server.id}
                        value={form.data.database}
                        onValueChange={(value) => form.setData('database', value)}
                      />
                      <InputError message={form.errors.database} />
                    </FormField>
                  )}

                  {form.data.type === 'file' && (
                    <FormField>
                      <Label htmlFor="path">File/Directory Path</Label>
                      <Input
                        id="path"
                        name="path"
                        value={form.data.path}
                        onChange={(e) => form.setData('path', e.target.value)}
                        placeholder="/var/www/html or /home/user/documents"
                      />
                      <div className="text-muted-foreground mt-1 text-sm">Specify the file or directory path to backup.</div>
                      <InputError message={form.errors.path} />
                    </FormField>
                  )}

                  <FormField>
                    <Label htmlFor="storage">Storage</Label>
                    <StorageProviderSelect
                      id="storage"
                      name="storage"
                      value={form.data.storage}
                      onValueChange={(value) => form.setData('storage', value)}
                    />
                    <InputError message={form.errors.storage} />
                  </FormField>

                  <FormField>
                    <Label htmlFor="interval">Interval</Label>
                    <Select value={form.data.interval} onValueChange={(value) => form.setData('interval', value)}>
                      <SelectTrigger id="interval">
                        <SelectValue placeholder="Select an interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(page.props.configs.cronjob_intervals).map(([key, value]) => (
                            <SelectItem key={`interval-${key}`} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputError message={form.errors.interval} />
                  </FormField>

                  {form.data.interval === 'custom' && (
                    <FormField>
                      <Label htmlFor="custom_interval">Custom interval (crontab)</Label>
                      <Input
                        id="custom_interval"
                        name="custom_interval"
                        value={form.data.custom_interval}
                        onChange={(e) => form.setData('custom_interval', e.target.value)}
                        placeholder="* * * * *"
                      />
                      <InputError message={form.errors.custom_interval} />
                    </FormField>
                  )}

                  <FormField>
                    <Label htmlFor="keep">Backups to keep</Label>
                    <Input id="keep" name="keep" value={form.data.keep} onChange={(e) => form.setData('keep', e.target.value)} />
                    <InputError message={form.errors.keep} />
                  </FormField>
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
