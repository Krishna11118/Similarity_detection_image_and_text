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

  // Calculate stats
  const totalComparisons = data.length
  const highMatchCount = data.filter((item) => item.similarityScore >= 80).length
  const mediumMatchCount = data.filter((item) => item.similarityScore >= 60 && item.similarityScore < 80).length
  const lowMatchCount = data.filter((item) => item.similarityScore < 60).length

  const highMatchPercentage = (highMatchCount / totalComparisons) * 100
  const mediumMatchPercentage = (mediumMatchCount / totalComparisons) * 100
  const lowMatchPercentage = (lowMatchCount / totalComparisons) * 100

  const averageScore = data.reduce((sum, item) => sum + item.similarityScore, 0) / totalComparisons

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
              <span>High Match ({highMatchCount})</span>
              <span className="font-medium">{highMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={highMatchPercentage} className="h-2" indicatorClassName="bg-green-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Medium Match ({mediumMatchCount})</span>
              <span className="font-medium">{mediumMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={mediumMatchPercentage} className="h-2" indicatorClassName="bg-yellow-500" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Low Match ({lowMatchCount})</span>
              <span className="font-medium">{lowMatchPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={lowMatchPercentage} className="h-2" indicatorClassName="bg-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Similarity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{averageScore.toFixed(1)}%</span>
            <span className="text-xs text-muted-foreground">Across {totalComparisons} comparisons</span>
          </div>
          <Progress
            value={averageScore}
            className="h-2 mt-4"
            indicatorClassName={
              averageScore >= 80 ? "bg-green-500" : averageScore >= 60 ? "bg-yellow-500" : "bg-red-500"
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}
