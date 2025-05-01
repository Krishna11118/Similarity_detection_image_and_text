"use client"

import { useState, useEffect } from "react"
import { ImageComparisonCard } from "@/components/image-comparison-card"
import type { ImageComparisonData, FormData } from "@/types/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface SimilarityResultsProps {
  data?: ImageComparisonData[]
  forms?: FormData[]
  loading?: boolean
  filter: "all" | "high" | "medium" | "low"
}

export function SimilarityResults({
  data: propData,
  forms: propForms,
  loading: propLoading,
  filter,
}: SimilarityResultsProps) {
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
  }, [propData, propForms, filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch image comparisons
      const comparisonsResponse = await fetch(`/api/image-comparisons?filter=${filter}`)
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

  // Filter data based on the selected category if needed
  const filteredData = data.filter((item) => {
    if (filter === "all") return true
    if (filter === "high") return item.similarityScore >= 80
    if (filter === "medium") return item.similarityScore >= 60 && item.similarityScore < 80
    if (filter === "low") return item.similarityScore < 60
    return true
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[400px] rounded-lg" />
        ))}
      </div>
    )
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No image comparisons found</h3>
        <p className="text-muted-foreground mt-2">There are no image comparisons in this category.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredData.map((item) => (
        <ImageComparisonCard
          key={item._id}
          data={item}
          queryForm={forms.find((form) => form.uid === item.queryUid)}
          comparedForm={forms.find((form) => form.uid.toString() === item.comparedUid)}
        />
      ))}
    </div>
  )
}
