"use client";

import * as React from "react";
import {
  CirclePlus,
  Camera,
  Image,
  Home,
  ChartArea,
  Download,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-0 rounded-none hover:bg-transparent active:bg-transparent focus:bg-transparent"
            >
              <a href="#">
                <img
                  src="/favicon.ico"
                  alt="Portfolio Admin Logo"
                  className="w-8 h-8"
                />
                <span className="text-base font-semibold">portfolio admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="text-white border p-5 border-neutral-700 rounded-none hover:bg-neutral-600/20 active:bg-neutral-600/20 min-w-8 duration-200 ease-linear font-sans"
                >
                  <Home />
                  <span>home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="text-white border p-5 border-neutral-700 rounded-none hover:bg-neutral-600/20 active:bg-neutral-600/20 min-w-8 duration-200 ease-linear font-sans"
                >
                  <CirclePlus />
                  <span>quick create roll</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>statistics</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="text-white border p-5 border-neutral-700 rounded-none hover:bg-neutral-600/20 active:bg-neutral-600/20 min-w-8 duration-200 ease-linear font-sans"
                >
                  <ChartArea />
                  <span>key metrics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="text-white border p-5 border-neutral-700 rounded-none hover:bg-neutral-600/20 active:bg-neutral-600/20 min-w-8 duration-200 ease-linear font-sans"
                >
                  <Download />
                  <span>export</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
