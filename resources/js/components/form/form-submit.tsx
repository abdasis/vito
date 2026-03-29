import { Button } from '@/components/ui/button';
import FormSuccessful from '@/components/form-successful';
import { LoaderCircle } from 'lucide-react';
import React from 'react';

type ButtonProps = React.ComponentProps<typeof Button>;

interface FormSubmitProps extends Omit<ButtonProps, 'type' | 'disabled'> {
    processing: boolean;
    successful?: boolean;
    disabled?: boolean;
}

const FormSubmit = ({ processing, successful = false, children, disabled, ...props }: FormSubmitProps) => {
    return (
        <Button type="submit" disabled={processing || disabled} {...props}>
            {processing ? <LoaderCircle className="animate-spin" /> : <FormSuccessful successful={successful} />}
            {children}
        </Button>
    );
};

export { FormSubmit };
