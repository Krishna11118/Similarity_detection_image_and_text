import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { ImageComparisonData, FormData } from "@/types/types"

interface RecentActivityProps {
  data: ImageComparisonData[]
  forms: FormData[]
  loading: boolean
}

export function RecentActivity({ data, forms, loading }: RecentActivityProps) {
  // Get the 5 most recent comparisons
  const recentComparisons = [...data]
    .sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest image comparisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Determine the match category and color
  const getMatchCategory = (score: number) => {
    if (score >= 80) return { label: "High Match", color: "bg-green-100 text-green-800 border-green-300" }
    if (score >= 60) return { label: "Medium Match", color: "bg-yellow-100 text-yellow-800 border-yellow-300" }
    return { label: "Low Match", color: "bg-red-100 text-red-800 border-red-300" }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest image comparisons</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link href="/dashboard">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentComparisons.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No recent comparisons found</p>
          ) : (
            recentComparisons.map((comparison) => {
              const matchInfo = getMatchCategory(comparison.similarityScore)
              const queryForm = forms.find((form) => form.uid === comparison.queryUid)
              const comparedForm = forms.find((form) => form.uid.toString() === comparison.comparedUid)

              return (
                <div key={comparison._id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={matchInfo.color}>
                        {matchInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(comparison.processedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={`/${comparison.queryImagePath}`}
                          alt="Query"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{queryForm?.projectName || "Unknown Project"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {comparison.queryImagePath.split("/").pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <span className="text-lg font-bold">{comparison.similarityScore.toFixed(1)}%</span>
                    <p className="text-xs text-muted-foreground">Similarity</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={`/${comparison.comparedImagePath}`}
                          alt="Compared"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comparedForm?.projectName || "Unknown Project"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {comparison.comparedImagePath.split("/").pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
