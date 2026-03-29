import { XIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { SharedData } from '@/types';
import { DynamicFieldConfig } from '@/types/dynamic-field-config';
import DynamicField from '@/components/ui/dynamic-field';
import { FormDataConvertible } from '@inertiajs/core';
import { FormCheckbox, FormInput, FormSubmit } from '@/components/form';
import { Label } from '@/components/ui/label';
import { StorageProviderIcon } from '@/components/storage-provider-icon';

type StorageProviderForm = Record<string, FormDataConvertible>;

const ConnectStorageProvider = ({
  defaultProvider,
  onProviderAdded,
  children,
}: {
  defaultProvider?: string;
  onProviderAdded?: () => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const page = usePage<SharedData>();

  const form = useForm<StorageProviderForm>({
    provider: defaultProvider || 'local',
    name: '',
    global: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    form.post(route('storage-providers.store'), {
      onSuccess: () => {
        setOpen(false);
        if (onProviderAdded) {
          onProviderAdded();
        }
      },
    });
  };

  useEffect(() => {
    const provider = form.data.provider as string;
    const providerConfig = page.props.configs.storage_provider.providers[provider];
    if (providerConfig?.form) {
      providerConfig.form.forEach((field: DynamicFieldConfig) => {
        const currentValue = form.data[field.name];
        if (field.default !== undefined && (currentValue === '' || currentValue === undefined)) {
          form.setData(field.name, field.default as FormDataConvertible);
        }
      });
    }
  }, [form.data.provider]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full min-w-3xl max-w-3xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Connect to storage provider</DialogTitle>
              <DialogDescription>Connect a new storage provider</DialogDescription>
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
              <Form id="create-storage-provider-form" onSubmit={submit}>
                <FormFields>
                  <FormField className="w-1/4">
                    <Label htmlFor="provider">Provider</Label>
                    <Select
                      value={form.data.provider as string}
                      onValueChange={(value) => {
                        form.setData('provider', value);
                        form.clearErrors();
                      }}
                    >
                      <SelectTrigger id="provider" className="min-w-48">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(page.props.configs.storage_provider.providers).map(([key, provider]) => (
                            <SelectItem key={key} value={key}>
                              <StorageProviderIcon provider={key} className="size-3.5 shrink-0" />
                              {provider.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputError message={form.errors.provider} />
                  </FormField>
                  <FormInput
                    label="Name"
                    id="name"
                    type="text"
                    name="name"
                    value={form.data.name as string}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                  />
                  {page.props.configs.storage_provider.providers[form.data.provider as string]?.form?.map((field: DynamicFieldConfig) => (
                    <DynamicField
                      key={`field-${field.name}`}
                      value={form.data[field.name] as string}
                      onChange={(value) => form.setData(field.name, value)}
                      config={field}
                      error={form.errors[field.name]}
                    />
                  ))}
                  <FormCheckbox
                    id="global"
                    label="Is global (accessible in all projects)"
                    checked={form.data.global as boolean}
                    onCheckedChange={(checked) => form.setData('global', checked)}
                    error={form.errors.global}
                  />
                </FormFields>
              </Form>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <FormSubmit processing={form.processing} onClick={submit}>
              Connect
            </FormSubmit>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectStorageProvider;
