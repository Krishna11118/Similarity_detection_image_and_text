"use client"

import { ImageIcon, BarChartIcon, SettingsIcon, HomeIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps {
  activeItem: string
  onNavigate: (item: string) => void
}

export function DashboardSidebar({ activeItem, onNavigate }: DashboardSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Image Similarity</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={activeItem === "home"} onClick={() => onNavigate("home")}>
              <a href="/">
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={
                activeItem === "all" || activeItem === "high" || activeItem === "medium" || activeItem === "low"
              }
              onClick={() => onNavigate("all")}
            >
              <a href="/dashboard">
                <ImageIcon className="h-4 w-4" />
                <span>Image Comparisons</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={activeItem === "analytics"} onClick={() => onNavigate("analytics")}>
              <a href="/analytics">
                <BarChartIcon className="h-4 w-4" />
                <span>Analytics</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
