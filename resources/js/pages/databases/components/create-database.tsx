import { FormEvent, ReactNode, useRef, useState } from 'react';
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
import { Form, FormField, FormFields } from '@/components/ui/form';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, XIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import axios from 'axios';
import { Checkbox } from '@/components/ui/checkbox';
import DatabaseUserSelect from '@/pages/database-users/components/database-user-select';

type CreateForm = {
  name: string;
  charset: string;
  collation: string;
  user: boolean;
  existing_user_id: string;
};

export default function CreateDatabase({
  server,
  withUser = false,
  defaultCharset,
  defaultCollation,
  onDatabaseCreated,
  children,
}: {
  server: number;
  withUser?: boolean;
  defaultCharset?: string;
  defaultCollation?: string;
  onDatabaseCreated?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [charsets, setCharsets] = useState<string[]>([]);
  const [collations, setCollations] = useState<string[]>([]);
  const fetchedServer = useRef<number | null>(null);
  const latestCollationRequest = useRef(0);

  const form = useForm<CreateForm>({
    name: '',
    charset: defaultCharset || '',
    collation: defaultCollation || '',
    user: withUser,
    existing_user_id: '',
  });

  const resolveCollation = (list: string[], defaultCollation: string | null, current: string): string => {
    if (current && list.includes(current)) {
      return current;
    }
    if (defaultCollation && list.includes(defaultCollation)) {
      return defaultCollation;
    }
    return list[0] ?? '';
  };

  const fetchCollations = async (charset: string, current: string): Promise<void> => {
    const requestId = ++latestCollationRequest.current;
    try {
      const response = await axios.get(route('databases.collations', { server: server, charset }));
      if (requestId !== latestCollationRequest.current) {
        return;
      }
      setCollations(response.data.list);
      form.setData('collation', resolveCollation(response.data.list, response.data.default, current));
    } catch {
      if (requestId !== latestCollationRequest.current) {
        return;
      }
      setCollations([]);
      form.setData('collation', '');
    }
  };

  const fetchCharsets = async () => {
    setCollations([]);
    const response = await axios.get(route('databases.charsets', server));
    fetchedServer.current = server;
    setCharsets(response.data);

    if (form.data.charset && response.data.includes(form.data.charset)) {
      await fetchCollations(form.data.charset, form.data.collation);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post(route('databases.store', server), {
      onSuccess: () => {
        form.reset();
        setOpen(false);
        if (onDatabaseCreated) {
          onDatabaseCreated();
        }
      },
      onError: () => {
        // Handle error if needed
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open && fetchedServer.current !== server) {
      fetchCharsets();
    }
  };

  const handleCharsetChange = (value: string) => {
    form.setData('charset', value);
    void fetchCollations(value, '');
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
              <DialogTitle>Create database</DialogTitle>
              <DialogDescription>Create a new database on this server</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <Form className="p-5" id="create-database-form" onSubmit={submit}>
              <FormFields>
                <FormField>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" id="name" name="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                  <InputError message={form.errors.name} />
                </FormField>
                <FormField>
                  <Label htmlFor="charset">Charset</Label>
                  <Select onValueChange={handleCharsetChange} value={form.data.charset}>
                    <SelectTrigger id="charset">
                      <SelectValue placeholder="Select charset" />
                    </SelectTrigger>
                    <SelectContent>
                      {charsets.map((charset) => (
                        <SelectItem key={charset} value={charset}>
                          {charset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputError message={form.errors.charset} />
                </FormField>
                <FormField>
                  <Label htmlFor="collation">Collation</Label>
                  <Combobox
                    id="collation"
                    items={collations.map((collation) => ({ value: collation, label: collation }))}
                    value={form.data.collation}
                    onValueChange={(value) => form.setData('collation', value)}
                    placeholder="Select collation"
                    searchText="Search collations..."
                    noneFoundText="No collations found."
                  />
                  <InputError message={form.errors.collation} />
                </FormField>
                <FormField>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="user" name="user" checked={form.data.user} onClick={() => form.setData('user', !form.data.user)} />
                    <Label htmlFor="user">Link user to database</Label>
                  </div>
                  <InputError message={form.errors.user} />
                </FormField>
                {form.data.user && (
                  <FormField>
                    <Label htmlFor="existing_user_id">Database User</Label>
                    <DatabaseUserSelect
                      serverId={server}
                      value={form.data.existing_user_id}
                      onValueChange={(value) => form.setData('existing_user_id', value)}
                      create={true}
                    />
                    <InputError message={form.errors.existing_user_id} />
                  </FormField>
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
            <Button form="create-database-form" type="submit" disabled={form.processing}>
              {form.processing && <LoaderCircle className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
