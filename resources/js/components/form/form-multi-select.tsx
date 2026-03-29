import InputError from '@/components/ui/input-error';
import { MultiSelect } from '@/components/multi-select';
import { cn } from '@/lib/utils';
import React from 'react';
import { FormLabel } from './form-label';

interface MultiSelectOption {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface FormMultiSelectProps {
    label: string;
    options: MultiSelectOption[];
    onValueChange: (value: string[]) => void;
    defaultValue?: string[];
    placeholder?: string;
    error?: string;
    description?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    maxCount?: number;
    className?: string;
}

const FormMultiSelect = ({ label, options, onValueChange, defaultValue, placeholder, error, description, id, disabled, required, maxCount, className }: FormMultiSelectProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <FormLabel htmlFor={inputId} required={required}>{label}</FormLabel>
            <MultiSelect
                options={options}
                onValueChange={onValueChange}
                defaultValue={defaultValue}
                placeholder={placeholder}
                maxCount={maxCount}
                disabled={disabled}
                className={cn(
                    error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20',
                    className,
                )}
            />
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormMultiSelect };
export type { MultiSelectOption };
