import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { cn } from '@/lib/utils';
import React from 'react';
import { FormLabel } from './form-label';

interface FormInputProps extends React.ComponentProps<'input'> {
    label: string;
    error?: string;
    description?: string;
}

const FormInput = ({ label, error, description, id, required, className, ...props }: FormInputProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <FormLabel htmlFor={inputId} required={required}>{label}</FormLabel>
            <Input
                id={inputId}
                required={required}
                aria-invalid={!!error}
                className={cn(error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20', className)}
                {...props}
            />
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormInput };
