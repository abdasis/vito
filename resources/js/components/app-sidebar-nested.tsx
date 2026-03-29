import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
  BookOpen,
  ChevronRightIcon,
  CogIcon,
  Folder,
  MousePointerClickIcon,
  ServerIcon,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Icon } from '@/components/icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export function AppSidebar() {
  const page = usePage();

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
                <SidebarMenuSub className="">{getMenuItems(item.children)}</SidebarMenuSub>
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

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" asChild>
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
