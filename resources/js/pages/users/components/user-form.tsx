import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormEventHandler, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, XIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types/user';
import FormSuccessful from '@/components/form-successful';

const UserForm = ({ user, children }: { user?: User; children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  const form = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.is_admin ? 'admin' : 'user',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    if (user) {
      form.patch(route('users.update', user.id));
      return;
    }

    form.post(route('users.store'), {
      onSuccess() {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-0 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-xl ring-1 ring-foreground/8 backdrop-blur-sm"
      >
        <div className="flex flex-col gap-0 overflow-hidden rounded-xl bg-background/90 ring-1 ring-foreground/6">
          <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-foreground/6 bg-muted/30 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <DialogTitle>{user ? `Edit ${user.name}` : 'Create user'}</DialogTitle>
              <DialogDescription>
                {user ? `Fill the form to edit ${user.name}` : 'Fill the form to create a new user'}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <XIcon className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="p-5">
              <Form id="user-form" onSubmit={submit}>
                <FormFields>
                  <FormField>
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" name="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                    <InputError message={form.errors.name} />
                  </FormField>
                  <FormField>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" name="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    <InputError message={form.errors.email} />
                  </FormField>
                  <FormField>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      value={form.data.password}
                      onChange={(e) => form.setData('password', e.target.value)}
                    />
                    <InputError message={form.errors.password} />
                  </FormField>
                  <FormField>
                    <Label htmlFor="role">Role</Label>
                    <Select value={form.data.role} onValueChange={(value) => form.setData('role', value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem key="role-user" value="user">
                            user
                          </SelectItem>
                          <SelectItem key="role-admin" value="admin">
                            admin
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <InputError message={form.errors.role} />
                  </FormField>
                </FormFields>
              </Form>
            </div>
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-xl border-t border-foreground/6 bg-muted/30 px-5 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button form="user-form" type="button" onClick={submit} disabled={form.processing}>
              {form.processing && <LoaderCircle className="animate-spin" />}
              <FormSuccessful successful={form.recentlySuccessful} />
              Save
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
