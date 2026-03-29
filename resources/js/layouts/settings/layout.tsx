import { type BreadcrumbItem, type NavItem } from '@/types';
import { ReactNode } from 'react';
import Layout from '@/layouts/app/layout';
import { router } from '@inertiajs/react';
import {
  BellIcon,
  CloudIcon,
  CodeIcon,
  DatabaseIcon,
  KeyIcon,
  ListIcon,
  PlugIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNavItems: NavItem[] = [
  {
    title: 'Profile',
    href: route('profile'),
    icon: UserIcon,
  },
  {
    title: 'Users',
    href: route('users'),
    icon: UsersIcon,
  },
  {
    title: 'Projects',
    href: route('projects'),
    icon: ListIcon,
  },
  {
    title: 'Server Providers',
    href: route('server-providers'),
    icon: CloudIcon,
  },
  {
    title: 'Source Controls',
    href: route('source-controls'),
    icon: CodeIcon,
  },
  {
    title: 'Storage Providers',
    href: route('storage-providers'),
    icon: DatabaseIcon,
  },
  {
    title: 'Notification Channels',
    href: route('notification-channels'),
    icon: BellIcon,
  },
  {
    title: 'SSH Keys',
    href: route('ssh-keys'),
    icon: KeyIcon,
  },
  {
    title: 'API Keys',
    href: route('api-keys'),
    icon: PlugIcon,
  },
];

export default function SettingsLayout({ children, breadcrumbs }: { children: ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <div className="flex min-h-full w-full">
        {/* Settings Sidebar */}
        <aside className="bg-sidebar border-sidebar-border hidden w-56 shrink-0 border-r lg:block">
          <div className="sticky top-0 flex flex-col gap-1 p-3">
            <p className="text-muted-foreground mb-1 px-3 text-xs font-medium uppercase tracking-wider">Settings</p>
            {settingsNavItems.map((item) => {
              const isActive = window.location.href.startsWith(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => router.visit(item.href)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-sidebar-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  )}
                >
                  {item.icon && <item.icon className="size-4 shrink-0" />}
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Layout>
  );
}
