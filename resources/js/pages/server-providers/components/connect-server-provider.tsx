import { LoaderCircle, X as XIcon } from 'lucide-react';
import { ProviderIcon } from '@/components/provider-icon';
import { Button } from '@/components/ui/button';
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
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SharedData } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { DynamicFieldConfig } from '@/types/dynamic-field-config';
import DynamicField from '@/components/ui/dynamic-field';

type ServerProviderForm = {
  provider: string;
  name: string;
  global: boolean;
};

export default function ConnectServerProvider({
  defaultProvider,
  onProviderAdded,
  children,
}: {
  defaultProvider?: string;
  onProviderAdded?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const page = usePage<SharedData>();

  const form = useForm<Required<ServerProviderForm>>({
    provider: defaultProvider || 'aws',
    name: '',
    global: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    form.post(route('server-providers.store'), {
      onSuccess: () => {
        setOpen(false);
        if (onProviderAdded) {
          onProviderAdded();
        }
      },
    });
  };

  useEffect(() => {
    const providerConfig = page.props.configs.server_provider.providers[form.data.provider];
    if (providerConfig?.form) {
      providerConfig.form.forEach((field: DynamicFieldConfig) => {
        /* @ts-expect-error dynamic types */
        if (field.default !== undefined && (form.data[field.name] === '' || form.data[field.name] === undefined)) {
          /* @ts-expect-error dynamic types */
          form.setData(field.name, field.default);
        }
      });
    }
  }, [form.data.provider]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Connect to server provider</DialogTitle>
              <DialogDescription>Connect a new cloud provider to manage servers</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <Form id="create-server-provider-form" onSubmit={submit} className="p-5">
              <FormFields>
                <FormField>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={form.data.provider}
                    onValueChange={(value) => {
                      form.setData('provider', value);
                      form.clearErrors();
                    }}
                  >
                    <SelectTrigger id="provider" className="w-full">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(page.props.configs.server_provider.providers).map(
                          ([key, provider]) =>
                            key !== 'custom' && (
                              <SelectItem key={key} value={key}>
                                <ProviderIcon provider={key} className="size-3.5" />
                                {provider.label}
                              </SelectItem>
                            ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <InputError message={form.errors.provider} />
                </FormField>
                <FormField>
                  <Label htmlFor="name">Name</Label>
                  <Input type="text" name="name" id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                  <InputError message={form.errors.name} />
                </FormField>
                {page.props.configs.server_provider.providers[form.data.provider]?.form?.map((field: DynamicFieldConfig) => (
                  <DynamicField
                    key={`field-${field.name}`}
                    /*@ts-expect-error dynamic types*/
                    value={form.data[field.name]}
                    /*@ts-expect-error dynamic types*/
                    onChange={(value) => form.setData(field.name, value)}
                    config={field}
                    /*@ts-expect-error dynamic types*/
                    error={form.errors[field.name]}
                  />
                ))}
                <FormField>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="global" name="global" checked={form.data.global} onClick={() => form.setData('global', !form.data.global)} />
                    <Label htmlFor="global">Is global (accessible in all projects)</Label>
                  </div>
                  <InputError message={form.errors.global} />
                </FormField>
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
              Connect
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
