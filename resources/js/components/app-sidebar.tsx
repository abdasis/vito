"use client"

import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BellIcon,
  BookOpen,
  ChevronRightIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  CodeIcon,
  CogIcon,
  DatabaseIcon,
  FlameIcon,
  Folder,
  KeyIcon,
  ListIcon,
  MousePointerClickIcon,
  PlugIcon,
  RocketIcon,
  ServerIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { Link, router, usePage } from "@inertiajs/react"
import { SharedData, NavItem } from "@/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Icon } from "@/components/icon"

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const page = usePage<SharedData>()
  const { auth, server, site } = page.props
  const user = auth.user
  const workspaceName = auth.currentProject?.name ?? user.name

  const isServerMenuDisabled = !server || server.status !== "ready"

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const teams = [
    {
      name: workspaceName,
      logo: (
        <Avatar className="size-5 rounded-sm">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-sm text-[10px]">{initials}</AvatarFallback>
        </Avatar>
      ),
      plan: user.email,
    },
  ]

  const mainNavItems: NavItem[] = [
    {
      title: "Servers",
      href: route("servers"),
      icon: ServerIcon,
    },
    {
      title: "Sites",
      href: route("sites.all"),
      icon: MousePointerClickIcon,
    },
    {
      title: "Settings",
      href: route("settings"),
      icon: CogIcon,
      children: [
        { title: "Profile", href: route("profile"), icon: UserIcon },
        { title: "Users", href: route("users"), icon: UsersIcon },
        { title: "Projects", href: route("projects"), icon: ListIcon },
        { title: "Server Providers", href: route("server-providers"), icon: CloudIcon },
        { title: "Source Controls", href: route("source-controls"), icon: CodeIcon },
        { title: "Storage Providers", href: route("storage-providers"), icon: DatabaseIcon },
        { title: "Notification Channels", href: route("notification-channels"), icon: BellIcon },
        { title: "SSH Keys", href: route("ssh-keys"), icon: KeyIcon },
        { title: "API Keys", href: route("api-keys"), icon: PlugIcon },
      ],
    },
  ]

  const serverNavItems: NavItem[] = server
    ? [
        {
          title: "Overview",
          href: route("servers.show", { server: server.id }),
          onlyActivePath: route("servers.show", { server: server.id }),
          icon: ServerIcon,
          isDisabled: isServerMenuDisabled,
        },
        {
          title: "Database",
          href: route("databases", { server: server.id }),
          icon: DatabaseIcon,
          isDisabled: isServerMenuDisabled,
          children: [
            {
              title: "Databases",
              href: route("databases", { server: server.id }),
              onlyActivePath: route("databases", { server: server.id }),
              icon: DatabaseIcon,
            },
            { title: "Users", href: route("database-users", { server: server.id }), icon: UsersIcon },
            { title: "Backups", href: route("backups", { server: server.id }), icon: CloudUploadIcon },
          ],
        },
        {
          title: "Sites",
          href: route("sites", { server: server.id }),
          icon: MousePointerClickIcon,
          isDisabled: isServerMenuDisabled,
          children: site
            ? [
                { title: "All sites", href: route("sites", { server: server.id }), onlyActivePath: route("sites", { server: server.id }), icon: MousePointerClickIcon },
                { title: "Application", href: route("application", { server: server.id, site: site.id }), icon: RocketIcon },
              ]
            : [],
        },
        { title: "Firewall", href: route("firewall", { server: server.id }), icon: FlameIcon, isDisabled: isServerMenuDisabled },
        { title: "CronJobs", href: route("cronjobs", { server: server.id }), icon: ClockIcon, isDisabled: isServerMenuDisabled },
      ]
    : []

  const footerNavItems: NavItem[] = [
    { title: "Repository", href: "https://github.com/vitodeploy/vito", icon: Folder },
    { title: "Documentation", href: "https://vitodeploy.com", icon: BookOpen },
  ]

  const renderMenuItems = (items: NavItem[]): React.ReactNode => {
    return items.map((item) => {
      const isActive = item.onlyActivePath
        ? window.location.href === item.href
        : window.location.href.startsWith(item.href)

      if (item.children && item.children.length > 0) {
        return (
          <Collapsible key={`${item.title}-${item.href}`} defaultOpen={isActive} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton disabled={item.isDisabled ?? false} tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>{renderMenuItems(item.children)}</SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )
      }

      return (
        <SidebarMenuItem key={`${item.title}-${item.href}`}>
          <SidebarMenuButton
            onClick={() => router.visit(item.href)}
            isActive={isActive}
            disabled={item.isDisabled ?? false}
            tooltip={item.title}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(mainNavItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {serverNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(serverNavItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={`${item.title}-${item.href}`}>
              <SidebarMenuButton asChild tooltip={item.title}>
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
      <SidebarRail />
    </Sidebar>
  )
}
