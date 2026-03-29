import React, { ReactNode, useState, FormEventHandler, useEffect } from 'react';
import { Form, FormFields } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle, XIcon, Globe, Network, Database } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/components/ui/input-error';
import type { SharedData } from '@/types';
import SourceControlSelect from '@/pages/source-controls/components/source-control-select';
import { Server } from '@/types/server';
import ServerSelect from '@/pages/servers/components/server-select';
import ServiceVersionSelect from '@/pages/services/components/service-version-select';
import { DynamicFieldConfig } from '@/types/dynamic-field-config';
import DynamicField from '@/components/ui/dynamic-field';
import DatabaseSelect from '@/pages/databases/components/database-select';
import DatabaseUserSelect from '@/pages/database-users/components/database-user-select';
import SelectRepo from '@/pages/source-controls/components/select-repo';
import SelectBranch from '@/pages/source-controls/components/select-branch';
import { LaravelIcon } from '@/icons/laravel';
import { PHPIcon } from '@/icons/php';
import { NodeIcon } from '@/icons/node';
import { WordpressIcon } from '@/icons/wordpress';
import { BunIcon } from '@/icons/bun';
import { FormInput, FormLabel, FormSubmit } from '@/components/form';

const siteTypeIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  laravel: LaravelIcon,
  php: PHPIcon,
  'php-blank': PHPIcon,
  wordpress: WordpressIcon,
  nodejs: NodeIcon,
  mise_nodejs: NodeIcon,
  mise_bun: BunIcon,
  'load-balancer': Network,
  phpmyadmin: Database,
};

type CreateSiteForm = {
  server: string;
  type: string;
  domain: string;
  php_version: string;
  source_control: string;
  repository: string;
  branch: string;
  user: string;
  database: string;
  database_user: string;
} & Record<string, string>;

const extractNameFromDomain = (domain: string): string => {
  if (!domain) return '';
  let name = domain.replace(/^https?:\/\//, '');
  name = name.replace(/^www\./, '');
  const parts = name.split('.');
  if (parts.length > 0 && parts[0]) {
    return parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  return '';
};

const CreateSite = ({
  server,
  defaultOpen,
  onOpenChange,
  children,
}: {
  server?: Server;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) => {
  const page = usePage<SharedData>();
  const [open, setOpen] = useState(defaultOpen || false);
  const [userManuallyEdited, setUserManuallyEdited] = useState(false);

  useEffect(() => {
    if (defaultOpen !== undefined) {
      setOpen(defaultOpen);
    }
  }, [defaultOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  };

  const form = useForm<CreateSiteForm>({
    server: server?.id.toString() || '',
    type: 'laravel',
    domain: '',
    php_version: '',
    source_control: '',
    repository: '',
    branch: '',
    user: '',
    database: '',
    database_user: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    form.post(route('sites.store', { server: form.data.server }));
  };

  useEffect(() => {
    const typeConfig = page.props.configs.site.types[form.data.type];

    if (typeConfig?.form) {
      typeConfig.form.forEach((field: DynamicFieldConfig) => {
        if (field.default !== undefined && (form.data[field.name] === '' || form.data[field.name] === undefined)) {
          form.setData(field.name, String(field.default));
        }
      });
    }
  }, [form.data.type]);

  const getFormField = (field: DynamicFieldConfig) => {
    if (field.name === 'source_control') {
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="source_control">Source Control</FormLabel>
          <SourceControlSelect
            id="source_control"
            value={form.data.source_control}
            onValueChange={(value) => form.setData('source_control', value)}
          />
          <InputError message={form.errors.source_control} />
        </div>
      );
    }

    if (field.name === 'repository') {
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="repository">Repository</FormLabel>
          <SelectRepo
            sourceControlId={form.data.source_control}
            value={form.data.repository}
            onValueChange={(value) => form.setData('repository', value)}
            placeholder="owner/repository"
          />
          <InputError message={form.errors.repository} />
        </div>
      );
    }

    if (field.name === 'branch') {
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="branch">Branch</FormLabel>
          <SelectBranch
            sourceControlId={form.data.source_control}
            repository={form.data.repository}
            value={form.data.branch}
            onValueChange={(value) => form.setData('branch', value)}
            placeholder="e.g. main, master, develop"
          />
          <InputError message={form.errors.branch} />
        </div>
      );
    }

    if (field.name === 'php_version') {
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="php_version">PHP Version</FormLabel>
          <ServiceVersionSelect
            id="php_version"
            serverId={parseInt(form.data.server)}
            service="php"
            value={form.data.php_version}
            onValueChange={(value) => form.setData('php_version', value)}
          />
          <InputError message={form.errors.php_version} />
        </div>
      );
    }

    if (field.name === 'database') {
      const props = (field.componentProps ?? {}) as { defaultCharset?: string; defaultCollation?: string };
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="database">Database</FormLabel>
          <DatabaseSelect
            id="database"
            name="database"
            serverId={parseInt(form.data.server)}
            value={form.data.database}
            onValueChange={(value) => form.setData('database', value)}
            createWithUser={true}
            defaultCharset={props.defaultCharset}
            defaultCollation={props.defaultCollation}
          />
          <InputError message={form.errors.database} />
        </div>
      );
    }

    if (field.name === 'database_user') {
      return (
        <div key={`field-${field.name}`} className="grid gap-2">
          <FormLabel htmlFor="database-user">Database user</FormLabel>
          <DatabaseUserSelect
            id="database-user"
            name="database_user"
            serverId={parseInt(form.data.server)}
            value={form.data.database_user}
            onValueChange={(value) => form.setData('database_user', value)}
            create={false}
          />
          <InputError message={form.errors.database_user} />
        </div>
      );
    }

    return (
      <DynamicField
        key={`field-${field.name}`}
        value={form.data[field.name]}
        onChange={(value) => form.setData(field.name, String(value))}
        config={field}
        error={form.errors[field.name]}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full min-w-4xl max-w-4xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Create site</DialogTitle>
              <DialogDescription>Fill in the details to create a new site.</DialogDescription>
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
              <Form id="create-site-form" onSubmit={submit}>
                <FormFields>
                  {server === undefined && (
                    <div className="grid gap-2">
                      <FormLabel htmlFor="server">Server</FormLabel>
                      <ServerSelect value={form.data.server} onValueChange={(value) => form.setData('server', value ? value.id.toString() : '')} />
                      <InputError message={form.errors.server} />
                    </div>
                  )}

                  {form.data.server && (
                    <div className="grid grid-cols-4 gap-5">
                      <div className="col-span-1 flex flex-col gap-1">
                        <FormLabel htmlFor="type">Site Type</FormLabel>
                        {Object.entries(page.props.configs.site.types).map(([key, type]) => {
                          const Icon = siteTypeIcons[key] || Globe;
                          const isActive = form.data.type === key;
                          return (
                            <button
                              key={`type-${key}`}
                              type="button"
                              onClick={() => form.setData('type', key)}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }`}
                            >
                              <Icon className="size-4 shrink-0" />
                              {type.label}
                            </button>
                          );
                        })}
                        <InputError message={form.errors.type} />
                      </div>

                      <div className="col-span-3">
                        <FormFields>
                          <FormInput
                            label="Domain"
                            value={form.data.domain}
                            onChange={(e) => {
                              const newDomain = e.target.value;
                              if (!userManuallyEdited) {
                                const extractedName = extractNameFromDomain(newDomain);
                                form.setData((prev) => ({ ...prev, domain: newDomain, user: extractedName }));
                              } else {
                                form.setData('domain', newDomain);
                              }
                            }}
                            placeholder="vitodeploy.com"
                            error={form.errors.domain}
                          />

                          <div className="grid gap-2">
                            <div className="flex items-center gap-1">
                              <FormLabel htmlFor="user">Isolated User</FormLabel>
                              <Dialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DialogTrigger asChild>
                                        <button type="button" tabIndex={-1} className="text-muted-foreground hover:text-foreground">
                                          <HelpCircle className="h-4 w-4" />
                                        </button>
                                      </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>Why?</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <DialogContent
                                  showCloseButton={false}
                                  className="w-full max-w-md overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
                                >
                                  <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
                                    <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
                                      <div className="flex flex-col gap-0.5">
                                        <DialogTitle>Why Isolated Users?</DialogTitle>
                                      </div>
                                      <DialogClose asChild>
                                        <Button variant="ghost" size="icon" className="size-7 shrink-0">
                                          <XIcon className="size-4" />
                                          <span className="sr-only">Close</span>
                                        </Button>
                                      </DialogClose>
                                    </DialogHeader>
                                    <div className="p-5">
                                      <DialogDescription>
                                        Isolated users are mandatory to ensure security for your sites. If a site has security vulnerabilities and gets
                                        compromised, the attacker cannot take full control of the server because the site runs under its own isolated user
                                        with limited permissions.
                                      </DialogDescription>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <Input
                              id="user"
                              type="text"
                              value={form.data.user}
                              onChange={(e) => {
                                setUserManuallyEdited(true);
                                form.setData('user', e.target.value);
                              }}
                              placeholder="e.g. mysite"
                            />
                            <p className="text-muted-foreground text-xs">The isolated user for the site. Must be unique on the server.</p>
                            <InputError message={form.errors.user} />
                          </div>

                          {page.props.configs.site.types[form.data.type].form?.map((config) => getFormField(config))}
                        </FormFields>
                      </div>
                    </div>
                  )}
                </FormFields>
              </Form>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-2">
              <FormSubmit form="create-site-form" processing={form.processing} disabled={!form.data.server}>
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

export default CreateSite;
