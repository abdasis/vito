import { useEffect, useState } from 'react';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DynamicFieldConfig } from '@/types/dynamic-field-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlertIcon } from 'lucide-react';
import ServerProviderSelect from '@/pages/server-providers/components/server-provider-select';
import { FormInput, FormSelect, FormTextarea } from '@/components/form';
import InputError from '@/components/ui/input-error';

interface DynamicFieldProps {
  value: string | number | boolean | string[] | undefined;
  onChange: (value: string | number | boolean | string[]) => void;
  config: DynamicFieldConfig;
  error?: string;
}

export default function DynamicField({ value, onChange, config, error }: DynamicFieldProps) {
  const defaultLabel = config.name.replaceAll('_', ' ');
  const label = config?.label || defaultLabel;
  const [initialValue, setInitialValue] = useState(false);

  if (!value) {
    value = config?.default || '';
  }

  useEffect(() => {
    if (!initialValue) {
      if (config.type === 'checkbox') {
        onChange((value as boolean) || false);
      } else {
        onChange(value);
      }
      setInitialValue(true);
    }
  }, [initialValue, setInitialValue, onChange, value, config]);

  // Handle alert
  if (config?.type === 'alert') {
    return (
      <div className="grid gap-2">
        <Alert>
          {!Array.isArray(config.options) && config.options?.type === 'warning' && <TriangleAlertIcon className="text-warning!" />}
          {config.label && <AlertTitle>{config.label}</AlertTitle>}
          <AlertDescription>
            {config.description}
            {config.link && (
              <a href={config.link.url} target="_blank" className="text-primary underline">
                {config.link.label}
              </a>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle checkbox (Switch)
  if (config?.type === 'checkbox') {
    return (
      <div className="grid gap-2">
        <div className="flex items-center gap-3">
          <Switch id={`switch-${config.name}`} defaultChecked={value as boolean} onCheckedChange={onChange} />
          <Label htmlFor={`switch-${config.name}`}>{label}</Label>
        </div>
        {config.description && !error && <p className="text-muted-foreground text-xs">{config.description}</p>}
        <InputError message={error} />
      </div>
    );
  }

  // Handle select
  if (config?.type === 'select' && config.options) {
    const options = Array.isArray(config.options)
      ? config.options.map((item) => ({ value: item, label: item }))
      : [];

    return (
      <FormSelect
        id={`field-${config.name}`}
        label={label}
        value={value as string}
        onValueChange={(v) => onChange(v)}
        options={options}
        placeholder={config.placeholder || `Select ${label}`}
        description={config.description}
        error={error}
      />
    );
  }

  // Handle textarea
  if (config?.type === 'textarea') {
    return (
      <FormTextarea
        id={`field-${config.name}`}
        label={label}
        name={config.name}
        defaultValue={(value as string) || ''}
        placeholder={config.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={config.className}
        description={config.description}
        error={error}
      />
    );
  }

  // Handle password
  if (config?.type === 'password') {
    return (
      <FormInput
        id={`field-${config.name}`}
        label={label}
        type="password"
        name={config.name}
        defaultValue={(value as string) || ''}
        placeholder={config.placeholder}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        description={config.description}
        error={error}
      />
    );
  }

  // Handle password with visibility toggle
  if (config?.type === 'password-with-toggle') {
    return (
      <div className="grid gap-2">
        <Label htmlFor={`field-${config.name}`} className="capitalize">
          {label}
        </Label>
        <PasswordInput
          name={config.name}
          id={`field-${config.name}`}
          defaultValue={(value as string) || ''}
          placeholder={config.placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {config.description && !error && <p className="text-muted-foreground text-xs">{config.description}</p>}
        <InputError message={error} />
      </div>
    );
  }

  // Handle server provider select
  if (config?.type === 'component' && config?.name === 'server_provider') {
    return (
      <div className="grid gap-2">
        <Label htmlFor={`field-${config.name}`} className="capitalize">
          {label}
        </Label>
        <ServerProviderSelect value={value as string} onValueChange={(v) => onChange(v)} />
        {config.description && !error && <p className="text-muted-foreground text-xs">{config.description}</p>}
        <InputError message={error} />
      </div>
    );
  }

  // Default to text input
  return (
    <FormInput
      id={`field-${config.name}`}
      label={label}
      type="text"
      name={config.name}
      defaultValue={(value as string) || ''}
      placeholder={config.placeholder}
      onChange={(e) => onChange(e.target.value)}
      description={config.description}
      error={error}
    />
  );
}
