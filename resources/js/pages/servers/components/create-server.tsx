import {
  CheckIcon,
  ChevronsUpDownIcon,
  ClipboardIcon,
  PlusIcon,
  TrashIcon,
  TriangleAlert,
  WifiIcon,
  XIcon,
} from 'lucide-react';
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
import React, { FormEventHandler, useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/ui/input-error';
import { FormInput, FormSelect, FormSubmit } from '@/components/form';
import { ProviderIcon } from '@/components/provider-icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServerProvider } from '@/types/server-provider';
import ConnectServerProvider from '@/pages/server-providers/components/connect-server-provider';
import axios from 'axios';
import { Form, FormField, FormFields } from '@/components/ui/form';
import type { SharedData } from '@/types';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { EventBus } from '@/lib/event-bus';
import ServerTemplates from './templates';
import { ServerTemplate, Service } from '@/types/server-template';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type CreateServerForm = {
  provider: string;
  server_provider: number;
  name: string;
  os: string;
  ip: string;
  port: number;
  region: string;
  plan: string;
  services: Service[];
};

const AddService = () => {
  const [open, setOpen] = useState(false);
  const page = usePage<SharedData>();
  const form = useForm<Service>({
    type: '',
    name: '',
    version: '',
  });

  const add = () => {
    if (!form.data.name) {
      form.setError('name', 'Please select a service name');
      return;
    }

    if (!form.data.version) {
      form.setError('version', 'Please select a service version');
      return;
    }

    EventBus.emit('add-service', form.data);
    setOpen(false);
  };

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-end p-0">
          <button type="button" className="cursor-pointer">
            <PlusIcon className="size-4" />
          </button>
        </div>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm sm:max-w-md"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Add service</DialogTitle>
              <DialogDescription className="sr-only">Add a new service to server installation</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <Form id="add-service-form" onSubmit={add} className="p-5">
            <FormFields>
              <FormField>
                <Label htmlFor="name">Name</Label>
                <Select
                  value={form.data.name}
                  onValueChange={(value) => {
                    form.setData('name', value);
                    form.setData('type', page.props.configs.service.services[value].type);
                    form.setData('version', '');
                  }}
                >
                  <SelectTrigger id="name">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(page.props.configs.service.services).map(([key, service]) => (
                        <SelectItem key={`service-${key}`} value={key}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputError message={form.errors.type || form.errors.name} />
              </FormField>

              <FormField>
                <Label htmlFor="version">Version</Label>
                <Select value={form.data.version} onValueChange={(value) => form.setData('version', value)}>
                  <SelectTrigger id="version">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {form.data.name &&
                        page.props.configs.service.services[form.data.name].versions.map((version) => (
                          <SelectItem key={`version-${form.data.name}-${version}`} value={version}>
                            {version}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputError message={form.errors.version} />
              </FormField>
            </FormFields>
          </Form>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button form="add-service-form" type="button" onClick={add}>
              Add
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const servicesColumns: ColumnDef<Service>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'version',
    header: 'Version',
  },
  {
    id: 'actions',
    header: () => <AddService />,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <button type="button" className="hover:text-destructive" onClick={() => EventBus.emit('remove-service', row.original)}>
          <TrashIcon className="size-4" />
        </button>
      </div>
    ),
  },
];

const CreateServer = ({
  defaultOpen,
  onOpenChange,
  children,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const page = usePage<SharedData>();

  const [open, setOpen] = useState(defaultOpen || false);
  useEffect(() => {
    if (defaultOpen) {
      setOpen(defaultOpen);
    }

    const handleRemoveService = (d: unknown) => {
      const service = d as Service;
      form.setData((data) => ({
        ...data,
        services: data.services.filter((s) => s.type !== service.type || s.name !== service.name || s.version !== service.version),
      }));
    };
    EventBus.on('remove-service', handleRemoveService);

    const handleAddService = (d: unknown) => {
      const service = d as Service;
      form.setData((data) => ({
        ...data,
        services: [...data.services, service],
      }));
    };
    EventBus.on('add-service', handleAddService);

    return () => {
      EventBus.off('remove-service', handleRemoveService);
      EventBus.off('add-service', handleAddService);
    };
  }, [defaultOpen]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const form = useForm<Required<CreateServerForm>>({
    provider: 'custom',
    server_provider: 0,
    name: '',
    os: '',
    ip: '',
    port: 22,
    region: '',
    plan: '',
    services: [
      {
        type: 'webserver',
        name: 'nginx',
        version: 'latest',
      },
      {
        type: 'database',
        name: 'mysql',
        version: '8.4',
      },
      {
        type: 'memory_database',
        name: 'redis',
        version: 'latest',
      },
      {
        type: 'process_manager',
        name: 'supervisor',
        version: 'latest',
      },
      {
        type: 'firewall',
        name: 'ufw',
        version: 'latest',
      },
      {
        type: 'monitoring',
        name: 'remote-monitor',
        version: 'latest',
      },
    ],
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    form.post(route('servers'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(page.props.public_key_text).then(() => {
      toast.success('Public key copied!', {
        description: 'Paste it into /root/.ssh/authorized_keys on your server.',
      });
    });
  };

  const [serverProviders, setServerProviders] = useState<ServerProvider[]>([]);
  const fetchServerProviders = async () => {
    const serverProviders = await axios.get(route('server-providers.json'));
    setServerProviders(serverProviders.data);
  };
  const selectProvider = (provider: string) => {
    form.setData('provider', provider);
    form.clearErrors();
    if (provider !== 'custom') {
      form.setData('server_provider', 0);
      form.setData('region', '');
      form.setData('plan', '');
      fetchServerProviders();
    }
  };

  const selectServerProvider = async (serverProvider: string) => {
    form.setData('server_provider', parseInt(serverProvider));
    await fetchRegions(parseInt(serverProvider));
  };

  const [regionOpen, setRegionOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);

  const [regions, setRegions] = useState<{ [key: string]: string }>({});
  const fetchRegions = async (serverProvider: number) => {
    const regions = await axios.get(route('server-providers.regions', { serverProvider: serverProvider }));
    setRegions(regions.data);
  };
  const selectRegion = async (region: string) => {
    form.setData('region', region);
    if (region !== '') {
      await fetchPlans(form.data.server_provider, region);
    }
  };

  const [plans, setPlans] = useState<{ [key: string]: string }>({});
  const fetchPlans = async (serverProvider: number, region: string) => {
    const plans = await axios.get(route('server-providers.plans', { serverProvider: serverProvider, region: region }));
    setPlans(plans.data);
  };
  const selectPlan = (plan: string) => {
    form.setData('plan', plan);
  };

  const serverTemplateChanged = (template: ServerTemplate | null) => {
    if (template) {
      form.setData('services', template.services);
    } else {
      form.setData('services', []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full min-w-5xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        {/* Inner content — contrasts with outer wrapper */}
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-base font-semibold">Create new server</DialogTitle>
              <DialogDescription>Fill in the details to create a new server.</DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="max-h-[70vh] overflow-y-auto">
            <Form id="create-server-form" className="p-5" onSubmit={submit}>
              <FormFields>
                <div className="grid gap-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={form.data.provider} onValueChange={selectProvider}>
                    <SelectTrigger id="provider" className={cn('w-4/12', form.errors.provider && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20')} aria-invalid={!!form.errors.provider}>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(page.props.configs.server_provider.providers).map(([key, provider]) => (
                          <SelectItem key={key} value={key}>
                            <ProviderIcon provider={key} className="size-3.5" />
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <InputError message={form.errors.provider} />
                </div>

                {form.data.provider && form.data.provider !== 'custom' && (
                  <FormField>
                    <Label htmlFor="server-provider">Server provider connection</Label>
                    <div className="flex items-center gap-2">
                      <Select value={form.data.server_provider.toString()} onValueChange={selectServerProvider}>
                        <SelectTrigger id="provider">
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {serverProviders
                              .filter((item: ServerProvider) => item.provider === form.data.provider)
                              .map((provider) => (
                                <SelectItem key={`server-provider-${provider.id}`} value={provider.id.toString()}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <ConnectServerProvider defaultProvider={form.data.provider} onProviderAdded={fetchServerProviders}>
                        <Button variant="outline">
                          <WifiIcon />
                        </Button>
                      </ConnectServerProvider>
                    </div>
                    <InputError message={form.errors.server_provider} />
                  </FormField>
                )}

                {form.data.provider && form.data.provider !== 'custom' && (
                  <div className="grid grid-cols-2 gap-6">
                    <FormField>
                      <Label htmlFor="region">Region</Label>
                      <Popover open={regionOpen} onOpenChange={setRegionOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="region"
                            variant="outline"
                            role="combobox"
                            aria-expanded={regionOpen}
                            className="w-full justify-between font-normal"
                            disabled={form.data.server_provider === 0}
                          >
                            {form.data.region ? regions[form.data.region] || form.data.region : 'Select a region'}
                            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search region..." />
                            <CommandList>
                              <CommandGroup>
                                {Object.entries(regions).map(([key, value]) => (
                                  <CommandItem
                                    key={`region-${key}`}
                                    value={value}
                                    onSelect={() => {
                                      selectRegion(key);
                                      setRegionOpen(false);
                                    }}
                                  >
                                    {value}
                                    <CheckIcon className={cn('ml-auto', form.data.region === key ? 'opacity-100' : 'opacity-0')} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <InputError message={form.errors.region} />
                    </FormField>

                    <FormField>
                      <Label htmlFor="plan">Plan</Label>
                      <Popover open={planOpen} onOpenChange={setPlanOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="plan"
                            variant="outline"
                            role="combobox"
                            aria-expanded={planOpen}
                            className="w-full justify-between font-normal"
                            disabled={form.data.region === ''}
                          >
                            {form.data.plan ? plans[form.data.plan] || form.data.plan : 'Select a plan'}
                            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search plan..." />
                            <CommandList>
                              <CommandGroup>
                                {Object.entries(plans).map(([key, value]) => (
                                  <CommandItem
                                    key={`plan-${key}`}
                                    value={value}
                                    onSelect={() => {
                                      selectPlan(key);
                                      setPlanOpen(false);
                                    }}
                                  >
                                    {value}
                                    <CheckIcon className={cn('ml-auto', form.data.plan === key ? 'opacity-100' : 'opacity-0')} />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <InputError message={form.errors.plan} />
                    </FormField>
                  </div>
                )}

                {form.data.provider === 'custom' && (
                  <>
                    <Alert>
                      <TriangleAlert size={5} />
                      <AlertDescription>
                        Your server needs to have a new unused installation of supported operating systems and must have a root user. To get started,
                        add our public key to /root/.ssh/authorized_keys file by running the bellow command on your server as root.
                      </AlertDescription>
                    </Alert>
                    <FormField>
                      <Label htmlFor="public_key" className="flex items-center gap-2">
                        Public Key command
                        <ClipboardIcon className="size-3 cursor-pointer" />
                      </Label>
                      <Textarea
                        onClick={copyToClipboard}
                        id="public_key"
                        value={page.props.public_key_text}
                        readOnly
                        className="justify-between overflow-auto font-normal"
                        spellCheck={false}
                      ></Textarea>
                    </FormField>
                  </>
                )}

                <div className="grid grid-cols-2 items-start gap-6">
                  <FormInput
                    label="Server Name"
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                  />
                  <FormSelect
                    label="Operating System"
                    value={form.data.os}
                    onValueChange={(value) => form.setData('os', value)}
                    options={page.props.configs.operating_systems.map((value) => ({ value, label: value }))}
                    placeholder="Select an operating system"
                    error={form.errors.os}
                  />
                </div>

                {form.data.provider === 'custom' && (
                  <div className="grid grid-cols-2 items-start gap-6">
                    <FormInput
                      label="SSH IP"
                      id="ip"
                      type="text"
                      autoComplete="ip"
                      value={form.data.ip}
                      onChange={(e) => form.setData('ip', e.target.value)}
                      error={form.errors.ip}
                    />
                    <FormInput
                      label="SSH Port"
                      id="port"
                      type="text"
                      autoComplete="port"
                      value={form.data.port}
                      onChange={(e) => form.setData('port', parseInt(e.target.value))}
                      error={form.errors.port}
                    />
                  </div>
                )}

                <div>
                  <FormField>
                    <div className="flex items-center justify-between">
                      <Label>Services</Label>
                      <ServerTemplates services={form.data.services} onTemplateChanged={serverTemplateChanged} />
                    </div>
                    <div>
                      <DataTable columns={servicesColumns} data={form.data.services} />
                    </div>
                    {Object.entries(form.errors)
                      .filter(([key, value]) => {
                        return key.startsWith('services') && value.length > 0;
                      })
                      .map(([key, value]) => (
                        <InputError key={key} message={value} />
                      ))}
                  </FormField>
                </div>
              </FormFields>
            </Form>
          </div>

          {/* Footer */}
          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <FormSubmit form="create-server-form" tabIndex={4} processing={form.processing} successful={form.recentlySuccessful}>
              Create
            </FormSubmit>
            <DialogClose asChild>
              <Button variant="outline" disabled={form.processing}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServer;
