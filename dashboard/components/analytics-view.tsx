"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScoreDistributionChart } from "@/components/score-distribution-chart"
import { MatchCategoryChart } from "@/components/match-category-chart"
import { SimilarityTrendChart } from "@/components/similarity-trend-chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { ImageComparisonData, FormData } from "@/types/types"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsViewProps {
  data?: ImageComparisonData[]
  forms?: FormData[]
  loading?: boolean
}

export function AnalyticsView({ data: propData, forms: propForms, loading: propLoading }: AnalyticsViewProps) {
  const [data, setData] = useState<ImageComparisonData[]>(propData || [])
  const [forms, setForms] = useState<FormData[]>(propForms || [])
  const [loading, setLoading] = useState(propLoading !== undefined ? propLoading : true)
  const { toast } = useToast()

  useEffect(() => {
    if (propData) {
      setData(propData)
    }
    if (propForms) {
      setForms(propForms)
    }
    if (propLoading !== undefined) {
      setLoading(propLoading)
    }
  }, [propData, propForms, propLoading])

  useEffect(() => {
    // Only fetch data if props weren't provided
    if (!propData || !propForms) {
      fetchData()
    }
  }, [propData, propForms])

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
        description: "Failed to fetch analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics data
  const totalComparisons = data.length
  const similarCount = data.filter((item) => item.isSimilar).length
  const notSimilarCount = totalComparisons - similarCount

  const highMatchCount = data.filter((item) => item.similarityScore >= 80).length
  const mediumMatchCount = data.filter((item) => item.similarityScore >= 60 && item.similarityScore < 80).length
  const lowMatchCount = data.filter((item) => item.similarityScore < 60).length

  const averageScore =
    totalComparisons > 0 ? data.reduce((sum, item) => sum + item.similarityScore, 0) / totalComparisons : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[120px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comparisons</CardTitle>
            <CardDescription>All image comparisons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComparisons}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {similarCount} similar / {notSimilarCount} not similar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Match Categories</CardTitle>
            <CardDescription>Distribution by match level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highMatchCount + mediumMatchCount + lowMatchCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {highMatchCount} high / {mediumMatchCount} medium / {lowMatchCount} low
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <CardDescription>Mean similarity score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all comparisons</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Similarity Analysis</CardTitle>
          <CardDescription>Visual representation of image similarity data</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="distribution">
            <TabsList className="mb-4">
              <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
              <TabsTrigger value="categories">Match Categories</TabsTrigger>
              <TabsTrigger value="trend">Similarity Trend</TabsTrigger>
            </TabsList>
            <TabsContent value="distribution" className="h-[350px]">
              <ScoreDistributionChart data={data} />
            </TabsContent>
            <TabsContent value="categories" className="h-[350px]">
              <MatchCategoryChart data={data} />
            </TabsContent>
            <TabsContent value="trend" className="h-[350px]">
              <SimilarityTrendChart data={data} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
