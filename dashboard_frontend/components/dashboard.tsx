"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimilarityResults } from "@/components/similarity-results"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ModelRunStatus } from "@/components/model-run-status"
import { AnalyticsView } from "@/components/analytics-view"
import type { ImageComparisonData, FormData } from "@/types/types"
import { useToast } from "@/hooks/use-toast"

export function Dashboard() {
  const [data, setData] = useState<ImageComparisonData[]>([])
  const [forms, setForms] = useState<FormData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
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
      const comparisonsResponse = await fetch(`/api/image-comparisons?filter=${activeTab}`)
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

  useEffect(() => {
    fetchData()
  }, [activeTab])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar activeItem={activeTab} onNavigate={setActiveTab} />
        <div className="flex-1">
          {/* <DashboardHeader onRunModel={handleRunModel} isLoading={loading} /> */}
          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-2xl font-bold">Image Similarity Dashboard</h1>
                <ModelRunStatus lastRun={lastRun} />
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Comparisons</TabsTrigger>
                  <TabsTrigger value="high">High Match (80-100%)</TabsTrigger>
                  <TabsTrigger value="medium">Medium Match (60-80%)</TabsTrigger>
                  <TabsTrigger value="low">Low Match (0-60%)</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <SimilarityResults data={data} forms={forms} loading={loading} filter="all" />
                </TabsContent>

                <TabsContent value="high">
                  <SimilarityResults data={data} forms={forms} loading={loading} filter="high" />
                </TabsContent>

                <TabsContent value="medium">
                  <SimilarityResults data={data} forms={forms} loading={loading} filter="medium" />
                </TabsContent>

                <TabsContent value="low">
                  <SimilarityResults data={data} forms={forms} loading={loading} filter="low" />
                </TabsContent>

                <TabsContent value="analytics">
                  <AnalyticsView data={data} forms={forms} loading={loading} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
