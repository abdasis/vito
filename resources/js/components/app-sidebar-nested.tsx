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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeftIcon,
  BellIcon,
  BookOpen,
  BoxIcon,
  ChartLineIcon,
  ChevronRightIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  CodeIcon,
  CogIcon,
  CommandIcon,
  DatabaseIcon,
  FlameIcon,
  Folder,
  GlobeIcon,
  HomeIcon,
  KeyIcon,
  ListEndIcon,
  ListIcon,
  LockIcon,
  LogsIcon,
  MousePointerClickIcon,
  PuzzleIcon,
  PlugIcon,
  RocketIcon,
  ServerIcon,
  Settings2Icon,
  SettingsIcon,
  SignpostIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import PHPIcon from '@/icons/php';
import siteHelper from '@/lib/site-helper';

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

const getServerNavItems = (serverId: number, siteId: number | null, services: Record<string, string>, isMenuDisabled: boolean): NavItem[] => [
  {
    title: 'Overview',
    href: route('servers.show', { server: serverId }),
    onlyActivePath: route('servers.show', { server: serverId }),
    icon: HomeIcon,
  },
  {
    title: 'Database',
    href: route('databases', { server: serverId }),
    icon: DatabaseIcon,
    isDisabled: isMenuDisabled,
    hidden: !services['database'],
    children: [
      {
        title: 'Databases',
        href: route('databases', { server: serverId }),
        onlyActivePath: route('databases', { server: serverId }),
      },
      {
        title: 'Users',
        href: route('database-users', { server: serverId }),
      },
    ],
  },
  {
    title: 'Backups',
    href: route('backups', { server: serverId }),
    icon: CloudUploadIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Sites',
    href: route('sites', { server: serverId }),
    icon: MousePointerClickIcon,
    isDisabled: isMenuDisabled,
    hidden: !services['webserver'],
    children:
      siteId
        ? [
            {
              title: 'All sites',
              href: route('sites', { server: serverId }),
              onlyActivePath: route('sites', { server: serverId }),
            },
            {
              title: 'Application',
              href: route('application', { server: serverId, site: siteId }),
              onlyActivePath: route('application', { server: serverId, site: siteId }),
            },
            {
              title: 'Domains',
              href: route('hosted-domains', { server: serverId, site: siteId }),
              onlyActivePath: route('hosted-domains', { server: serverId, site: siteId }),
            },
            {
              title: 'Features',
              href: route('site-features', { server: serverId, site: siteId }),
            },
            {
              title: 'Commands',
              href: route('commands', { server: serverId, site: siteId }),
            },
            {
              title: 'Workers',
              href: route('workers.site', { server: serverId, site: siteId }),
              isDisabled: isMenuDisabled,
              hidden: !services['process_manager'],
            },
            {
              title: 'CronJobs',
              href: route('cronjobs.site', { server: serverId, site: siteId }),
              isDisabled: isMenuDisabled,
            },
            {
              title: 'Redirects',
              href: route('redirects', { server: serverId, site: siteId }),
            },
            {
              title: 'Logs',
              href: route('sites.logs', { server: serverId, site: siteId }),
            },
            {
              title: 'Settings',
              href: route('site-settings', { server: serverId, site: siteId }),
            },
          ]
        : [],
  },
  {
    title: 'PHP',
    href: route('php', { server: serverId }),
    icon: PHPIcon,
    isDisabled: isMenuDisabled,
    hidden: !services['php'],
  },
  {
    title: 'Firewall',
    href: route('firewall', { server: serverId }),
    icon: FlameIcon,
    isDisabled: isMenuDisabled,
    hidden: !services['firewall'],
  },
  {
    title: 'CronJobs',
    href: route('cronjobs', { server: serverId }),
    icon: ClockIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Workers',
    href: route('workers', { server: serverId }),
    icon: ListEndIcon,
    isDisabled: isMenuDisabled,
    hidden: !services['process_manager'],
  },
  {
    title: 'SSH Keys',
    href: route('server-ssh-keys', { server: serverId }),
    icon: KeyIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'SSL',
    href: route('server-ssls', { server: serverId }),
    icon: LockIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Services',
    href: route('services', { server: serverId }),
    icon: CogIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Monitoring',
    href: route('monitoring', { server: serverId }),
    icon: ChartLineIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Logs',
    href: route('logs', { server: serverId }),
    icon: LogsIcon,
    children: [
      {
        title: 'Server logs',
        href: route('logs', { server: serverId }),
        onlyActivePath: route('logs', { server: serverId }),
      },
      {
        title: 'Remote logs',
        href: route('logs.remote', { server: serverId }),
        onlyActivePath: route('logs.remote', { server: serverId }),
      },
    ],
  },
  {
    title: 'Features',
    href: route('server-features', { server: serverId }),
    icon: BoxIcon,
    isDisabled: isMenuDisabled,
  },
  {
    title: 'Settings',
    href: route('server-settings', { server: serverId }),
    icon: Settings2Icon,
  },
];

export function AppSidebar() {
  const page = usePage<SharedData>();
  const isSettingsPage = settingsRoutes.some((r) => window.location.href.startsWith(r));
  const server = page.props.server;
  const storedSite = siteHelper.getStoredSite();
  const site = page.props.site || (storedSite?.server_id === server?.id ? storedSite : null) || null;
  const isServerPage = !!server;

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
      <Sidebar collapsible="offcanvas" variant="inset">
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

  if (isServerPage && server) {
    const isMenuDisabled = server.status !== 'ready';
    const serverNavItems = getServerNavItems(server.id, site?.id ?? null, server.services, isMenuDisabled);

    return (
      <Sidebar collapsible="offcanvas" variant="inset">
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
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => router.visit(route('servers'))}>
            <ArrowLeftIcon className="size-4" />
            Back to Servers
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{server.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{getMenuItems(serverNavItems.filter((item) => !item.hidden))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{getMenuItems(mainNavItems)}</SidebarMenu>
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
    <Sidebar collapsible="offcanvas" variant="inset">
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
