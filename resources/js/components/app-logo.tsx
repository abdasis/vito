import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AppLogo() {
  const { auth } = usePage<SharedData>().props;
  const user = auth.user;
  const project = auth.currentProject;

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-md text-[10px]">{initials(user.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate font-medium">{project?.name ?? user.name}</span>
    </>
  );
}
