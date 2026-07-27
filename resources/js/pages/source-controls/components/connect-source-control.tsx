import { GitBranch, LoaderCircle } from 'lucide-react';
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
import { useForm } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DynamicFieldConfig } from '@/types/dynamic-field-config';
import DynamicField from '@/components/ui/dynamic-field';
import { useConfigs } from '@/stores/bootstrap-store';
import { FormDataConvertible } from '@inertiajs/core';
import githubUrl from '../../../../svg/github.svg?url';
import gitlabUrl from '../../../../svg/gitlab.svg?url';
import bitbucketUrl from '../../../../svg/bitbucket.svg?url';

const sourceControlLogos: Record<string, string> = {
  github: githubUrl,
  gitlab: gitlabUrl,
  bitbucket: bitbucketUrl,
  'bitbucket-v2': bitbucketUrl,
};

const SourceControlLogo = ({ provider, className = 'size-4' }: { provider: string; className?: string }) => {
  const src = sourceControlLogos[provider];
  if (!src) return <GitBranch className={className} />;
  return <img src={src} alt={provider} className={className} />;
};

type SourceControlForm = Record<string, FormDataConvertible>;

const ConnectSourceControl = ({
  defaultProvider,
  onProviderAdded,
  children,
}: {
  defaultProvider?: string;
  onProviderAdded?: () => void;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const configs = useConfigs()!;

  const form = useForm<SourceControlForm>({
    provider: defaultProvider ?? 'github',
    name: '',
    global: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    form.post(route('source-controls.store'), {
      onSuccess: () => {
        setOpen(false);
        if (onProviderAdded) {
          onProviderAdded();
        }
      },
    });
  };

  useEffect(() => {
    const providerConfig = configs.source_control.providers[form.data.provider as string];
    if (providerConfig?.form) {
      providerConfig.form.forEach((field: DynamicFieldConfig) => {
        const currentValue = form.data[field.name];
        if (field.default !== undefined && (currentValue === '' || currentValue === undefined)) {
          form.setData(field.name, field.default as FormDataConvertible);
        }
      });
    }
  }, [form.data.provider, configs]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Connect to source control</DialogTitle>
          <DialogDescription className="sr-only">Connect to a new source control</DialogDescription>
        </DialogHeader>
        <Form id="create-source-control-form" onSubmit={submit} className="p-4">
          <FormFields>
            <FormField>
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={form.data.provider as string}
                onValueChange={(value) => {
                  form.setData('provider', value);
                  form.clearErrors();
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(configs.source_control.providers)
                      .filter(([, provider]) => provider.connectable !== false)
                      .map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          <SourceControlLogo provider={key} className="size-4 shrink-0" />
                          {provider.label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputError message={form.errors.provider} />
            </FormField>
            <FormField>
              <Label htmlFor="name">Name</Label>
              <Input type="text" name="name" id="name" value={form.data.name as string} onChange={(e) => form.setData('name', e.target.value)} />
              <InputError message={form.errors.name} />
            </FormField>
            {configs.source_control.providers[form.data.provider as string]?.form?.map((field: DynamicFieldConfig) => (
              <DynamicField
                key={`field-${field.name}`}
                value={form.data[field.name] as string}
                onChange={(value) => form.setData(field.name, value)}
                config={field}
                error={form.errors[field.name]}
              />
            ))}
            <FormField>
              <div className="flex items-center space-x-3">
                <Checkbox id="global" name="global" checked={form.data.global as boolean} onClick={() => form.setData('global', !form.data.global)} />
                <Label htmlFor="global">Is global (accessible in all projects)</Label>
              </div>
              <InputError message={form.errors.global} />
            </FormField>
          </FormFields>
        </Form>
        <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
};

export default ConnectSourceControl;
