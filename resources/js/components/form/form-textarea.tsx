import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React from 'react';

interface FormTextareaProps extends React.ComponentProps<'textarea'> {
    label: string;
    error?: string;
    description?: string;
}

const FormTextarea = ({ label, error, description, id, className, ...props }: FormTextareaProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Textarea
                id={inputId}
                aria-invalid={!!error}
                className={cn(error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20', className)}
                {...props}
            />
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormTextarea };
