import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import TextLink from '@/components/text-link';
import { FormInput, FormPassword, FormCheckbox, FormSubmit } from '@/components/form';
import AuthLayout from '@/layouts/auth/layout';

export default function Login() {
  const page = usePage<{
    demo: boolean;
  }>();

  const form = useForm<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    email: page.props.demo ? 'demo@vitodeploy.com' : '',
    password: page.props.demo ? 'password' : '',
    remember: false,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post('/login', {
      onFinish: () => form.reset('password'),
    });
  };

  return (
    <AuthLayout title="Log in to your account" description="Use your social account to log in.">
      <Head title="Log in" />

      <form onSubmit={submit} className="p-5">
        <div className="grid gap-6">
          <FormInput
            label="Email address"
            type="email"
            required
            autoFocus
            tabIndex={1}
            autoComplete="email"
            value={form.data.email}
            onChange={(e) => form.setData('email', e.target.value)}
            placeholder="email@example.com"
            error={form.errors.email}
          />

          <FormPassword
            label="Password"
            required
            tabIndex={2}
            autoComplete="current-password"
            value={form.data.password}
            onChange={(e) => form.setData('password', e.target.value)}
            placeholder="Password"
            error={form.errors.password}
            labelRight={
              <TextLink href="/forgot-password" className="text-sm" tabIndex={5}>
                Forgot password?
              </TextLink>
            }
          />

          <FormCheckbox
            label="Remember me"
            checked={form.data.remember}
            onCheckedChange={(checked) => form.setData('remember', !!checked)}
          />

          <FormSubmit processing={form.processing} className="mt-4 w-full" tabIndex={4}>
            Log in
          </FormSubmit>
        </div>
      </form>
    </AuthLayout>
  );
}
