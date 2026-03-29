import { ReactNode, useState, FormEventHandler, useEffect } from 'react';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoaderCircle, HelpCircle, XIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="source_control">Source Control</Label>
          <SourceControlSelect
            id="source_control"
            value={form.data.source_control}
            onValueChange={(value) => form.setData('source_control', value)}
          />
          <InputError message={form.errors.source_control} />
        </FormField>
      );
    }

    if (field.name === 'repository') {
      return (
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="repository">Repository</Label>
          <SelectRepo
            sourceControlId={form.data.source_control}
            value={form.data.repository}
            onValueChange={(value) => form.setData('repository', value)}
            placeholder="owner/repository"
          />
          <InputError message={form.errors.repository} />
        </FormField>
      );
    }

    if (field.name === 'branch') {
      return (
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="branch">Branch</Label>
          <SelectBranch
            sourceControlId={form.data.source_control}
            repository={form.data.repository}
            value={form.data.branch}
            onValueChange={(value) => form.setData('branch', value)}
            placeholder="e.g. main, master, develop"
          />
          <InputError message={form.errors.branch} />
        </FormField>
      );
    }

    if (field.name === 'php_version') {
      return (
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="php_version">PHP Version</Label>
          <ServiceVersionSelect
            id="php_version"
            serverId={parseInt(form.data.server)}
            service="php"
            value={form.data.php_version}
            onValueChange={(value) => form.setData('php_version', value)}
          />
          <InputError message={form.errors.php_version} />
        </FormField>
      );
    }

    if (field.name === 'database') {
      const props = (field.componentProps ?? {}) as { defaultCharset?: string; defaultCollation?: string };
      return (
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="database">Database</Label>
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
        </FormField>
      );
    }

    if (field.name === 'database_user') {
      return (
        <FormField key={`field-${field.name}`}>
          <Label htmlFor="database-user">Database user</Label>
          <DatabaseUserSelect
            id="database-user"
            name="database_user"
            serverId={parseInt(form.data.server)}
            value={form.data.database_user}
            onValueChange={(value) => form.setData('database_user', value)}
            create={false}
          />
          <InputError message={form.errors.database_user} />
        </FormField>
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
        className="w-full max-w-3xl overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
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
                    <FormField>
                      <Label htmlFor="server">Server</Label>
                      <ServerSelect value={form.data.server} onValueChange={(value) => form.setData('server', value ? value.id.toString() : '')} />
                      <InputError message={form.errors.server} />
                    </FormField>
                  )}

                  {form.data.server && (
                    <>
                      <FormField>
                        <Label htmlFor="type">Site Type</Label>
                        <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select site type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {Object.entries(page.props.configs.site.types).map(([key, type]) => (
                                <SelectItem key={`type-${key}`} value={key}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <InputError message={form.errors.type} />
                      </FormField>

                      <FormField>
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          type="text"
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
                        />
                        <InputError message={form.errors.domain} />
                      </FormField>

                      <FormField>
                        <Label htmlFor="user" className="flex items-center gap-1">
                          Isolated User
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
                        </Label>
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
                      </FormField>

                      {page.props.configs.site.types[form.data.type].form?.map((config) => getFormField(config))}
                    </>
                  )}
                </FormFields>
              </Form>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-2">
              <Button type="submit" form="create-site-form" disabled={form.processing || !form.data.server}>
                {form.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} Create
              </Button>
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
