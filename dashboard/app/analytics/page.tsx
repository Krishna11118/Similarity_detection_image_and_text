'use client';

import { AnalyticsView } from "@/components/analytics-view"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AnalyticsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar activeItem="analytics" onNavigate={() => {}} />
        <div className="flex-1">
          {/* <DashboardHeader onRunModel={() => {}} isLoading={false} /> */}
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
              <AnalyticsView />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
