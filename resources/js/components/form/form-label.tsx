import { Label } from '@/components/ui/label';

interface FormLabelProps {
    htmlFor: string;
    required?: boolean;
    children: React.ReactNode;
}

const FormLabel = ({ htmlFor, required, children }: FormLabelProps) => (
    <Label htmlFor={htmlFor}>
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
);

export { FormLabel };
