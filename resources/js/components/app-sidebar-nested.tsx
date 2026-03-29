import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
  ArrowLeftIcon,
  BellIcon,
  BookOpen,
  ChevronRightIcon,
  CloudIcon,
  CodeIcon,
  CogIcon,
  DatabaseIcon,
  Folder,
  KeyIcon,
  ListIcon,
  MousePointerClickIcon,
  PuzzleIcon,
  PlugIcon,
  ServerIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  {
    title: 'Plugins',
    href: route('plugins'),
    icon: PuzzleIcon,
  },
  {
    title: 'Vito Settings',
    href: route('vito-settings'),
    icon: SettingsIcon,
  },
];

const mainNavItems: NavItem[] = [
  {
    title: 'Servers',
    href: route('servers'),
    icon: ServerIcon,
  },
  {
    title: 'Sites',
    href: route('sites.all'),
    icon: MousePointerClickIcon,
  },
  {
    title: 'Settings',
    href: route('profile'),
    icon: CogIcon,
  },
];

const footerNavItems: NavItem[] = [
  {
    title: 'Repository',
    href: 'https://github.com/vitodeploy/vito',
    icon: Folder,
  },
  {
    title: 'Documentation',
    href: 'https://vitodeploy.com',
    icon: BookOpen,
  },
];

const settingsRoutes = [
  route('profile'),
  route('users'),
  route('projects'),
  route('server-providers'),
  route('source-controls'),
  route('storage-providers'),
  route('notification-channels'),
  route('ssh-keys'),
  route('api-keys'),
  route('plugins'),
  route('vito-settings'),
];

export function AppSidebar() {
  const isSettingsPage = settingsRoutes.some((r) => window.location.href.startsWith(r));

  const getMenuItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = item.onlyActivePath ? window.location.href === item.href : window.location.href.startsWith(item.href);

      if (item.children && item.children.length > 0) {
        return (
          <Collapsible key={`${item.title}-${item.href}`} defaultOpen={isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton disabled={item.isDisabled || false}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>{getMenuItems(item.children)}</SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        );
      }

      return (
        <SidebarMenuItem key={`${item.title}-${item.href}`}>
          <SidebarMenuButton onClick={() => router.visit(item.href)} isActive={isActive} disabled={item.isDisabled || false}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  if (isSettingsPage) {
    return (
      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={route('servers')} prefetch>
                  <AppLogo />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => router.visit(route('servers'))}>
            <ArrowLeftIcon className="size-4" />
            Back to App
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{getMenuItems(settingsNavItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={route('servers')} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{getMenuItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={`${item.title}-${item.href}`}>
              <SidebarMenuButton asChild tooltip={{ children: item.title, hidden: false }}>
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.icon && <Icon iconNode={item.icon} />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
