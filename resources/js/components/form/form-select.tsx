import InputError from '@/components/ui/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FormLabel } from './form-label';

interface SelectOption {
    value: string;
    label: string;
}

interface FormSelectProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
    description?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

const FormSelect = ({ label, value, onValueChange, options, placeholder, error, description, id, disabled, required, className }: FormSelectProps) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="grid gap-2">
            <FormLabel htmlFor={inputId} required={required}>{label}</FormLabel>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger
                    id={inputId}
                    aria-invalid={!!error}
                    className={cn(
                        'w-full',
                        error && 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/20',
                        className,
                    )}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {description && !error && <p className="text-muted-foreground text-xs">{description}</p>}
            <InputError message={error} />
        </div>
    );
};

export { FormSelect };
export type { SelectOption };
