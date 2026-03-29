import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/ui/input-error';
import { cn } from '@/lib/utils';
import { FormLabel } from './form-label';

interface FormCheckboxProps {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    error?: string;
    description?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

const FormCheckbox = ({ label, checked, onCheckedChange, error, description, id, disabled, required, className }: FormCheckboxProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <div className={cn('flex items-center gap-3', className)}>
                <Checkbox
                    id={inputId}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                    className={cn(error && 'border-rose-500')}
                />
                <FormLabel htmlFor={inputId} required={required}>
                    {label}
                </FormLabel>
            </div>
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormCheckbox };
