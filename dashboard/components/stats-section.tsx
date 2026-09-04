import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { ImageComparisonData } from "@/types/types"

interface StatsSectionProps {
  data: ImageComparisonData[]
  loading: boolean
}

export function StatsSection({ data, loading }: StatsSectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Key Metrics</h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Calculate stats (guard against divide-by-zero when there is no data)
  const totalComparisons = data.length
  const highMatchCount = data.filter((item) => item.similarityScore >= 80).length
  const mediumMatchCount = data.filter((item) => item.similarityScore >= 60 && item.similarityScore < 80).length
  const lowMatchCount = data.filter((item) => item.similarityScore < 60).length

  const pct = (n: number) => (totalComparisons ? (n / totalComparisons) * 100 : 0)
  const highMatchPercentage = pct(highMatchCount)
  const mediumMatchPercentage = pct(mediumMatchCount)
  const lowMatchPercentage = pct(lowMatchCount)

  const averageScore = totalComparisons
    ? data.reduce((sum, item) => sum + item.similarityScore, 0) / totalComparisons
    : 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Key Metrics</h2>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Match Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>High match ({highMatchCount})</span>
              <span className="font-data font-medium">{highMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={highMatchPercentage} className="h-2" indicatorClassName="bg-chart-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Medium match ({mediumMatchCount})</span>
              <span className="font-data font-medium">{mediumMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={mediumMatchPercentage} className="h-2" indicatorClassName="bg-primary" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Low match ({lowMatchCount})</span>
              <span className="font-data font-medium">{lowMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={lowMatchPercentage} className="h-2" indicatorClassName="bg-chart-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Similarity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="font-data text-3xl font-bold">
              {totalComparisons ? `${averageScore.toFixed(1)}%` : "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalComparisons ? `Across ${totalComparisons} comparisons` : "No comparisons yet"}
            </span>
          </div>
          <Progress
            value={averageScore}
            className="h-2 mt-4"
            indicatorClassName={
              averageScore >= 80 ? "bg-chart-2" : averageScore >= 60 ? "bg-primary" : "bg-chart-3"
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
