import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { FormLabel } from './form-label';

interface FormPasswordProps extends Omit<React.ComponentProps<'input'>, 'type'> {
    label: string;
    error?: string;
    description?: string;
    labelRight?: React.ReactNode;
}

const FormPassword = ({ label, error, description, labelRight, id, required, className, ...props }: FormPasswordProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const [visible, setVisible] = useState(false);

    return (
        <div className="grid gap-2">
            <div className="flex items-center">
                <FormLabel htmlFor={inputId} required={required}>{label}</FormLabel>
                {labelRight && <div className="ml-auto">{labelRight}</div>}
            </div>
            <div className="relative">
                <Input
                    id={inputId}
                    type={visible ? 'text' : 'password'}
                    required={required}
                    aria-invalid={!!error}
                    className={cn('pr-10', error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20', className)}
                    {...props}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    onClick={() => setVisible((v) => !v)}
                >
                    {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    <span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
                </button>
            </div>
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormPassword };
