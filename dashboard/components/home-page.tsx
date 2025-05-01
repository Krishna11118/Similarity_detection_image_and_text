"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { HeroSection } from "@/components/hero-section"
import { FeatureSection } from "@/components/feature-section"
import { StatsSection } from "@/components/stats-section"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import type { ImageComparisonData, FormData } from "@/types/types"
import { useToast } from "@/hooks/use-toast"

export function HomePage() {
  const [data, setData] = useState<ImageComparisonData[]>([])
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRun, setLastRun] = useState<Date>(new Date(Date.now() - 3600000)) // 1 hour ago
  const { toast } = useToast()

  useEffect(() => {
    fetchLastRun()
    fetchData()
  }, [])

  const fetchLastRun = async () => {
    try {
      const response = await fetch("/api/last-run")
      if (!response.ok) throw new Error("Failed to fetch last run time")

      const data = await response.json()
      setLastRun(new Date(data.timestamp))
    } catch (error) {
      console.error("Error fetching last run:", error)
      // Keep the default last run time
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch image comparisons
      const comparisonsResponse = await fetch("/api/image-comparisons")
      if (!comparisonsResponse.ok) throw new Error("Failed to fetch image comparisons")

      const comparisonsData = await comparisonsResponse.json()
      setData(comparisonsData)

      // Fetch forms
      const formsResponse = await fetch("/api/forms")
      if (!formsResponse.ok) throw new Error("Failed to fetch forms")

      const formsData = await formsResponse.json()
      setForms(formsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRunModel = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/run-model", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to run model")

      const result = await response.json()
      setLastRun(new Date(result.timestamp))

      toast({
        title: "Success",
        description: "Model run completed successfully.",
      })

      // Refresh data after model run
      fetchData()
    } catch (error) {
      console.error("Error running model:", error)
      toast({
        title: "Error",
        description: "Failed to run model. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar activeItem="home" onNavigate={() => {}} />
        <div className="flex-1">
          <DashboardHeader onRunModel={handleRunModel} isLoading={loading} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="mx-auto max-w-7xl space-y-8">
              <HeroSection lastRun={lastRun} />
              <FeatureSection />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RecentActivity data={data} forms={forms} loading={loading} />
                </div>
                <div className="space-y-8">
                  <StatsSection data={data} loading={loading} />
                  <QuickActions onRunModel={handleRunModel} isLoading={loading} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
