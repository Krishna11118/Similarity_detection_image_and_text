import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "@/components/ui/chart"
import type { ImageComparisonData } from "@/types/types"

interface ScoreDistributionChartProps {
  data: ImageComparisonData[]
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  // Create bins for the histogram (0-10, 10-20, ..., 90-100)
  const bins = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}-${(i + 1) * 10}`,
    count: 0,
    min: i * 10,
    max: (i + 1) * 10,
  }))

  // Count scores in each bin
  data.forEach((item) => {
    const binIndex = Math.min(Math.floor(item.similarityScore / 10), 9)
    bins[binIndex].count++
  })

  // Get color based on score range
  const getBarColor = (min: number) => {
    if (min >= 80) return "hsl(142, 76%, 36%)" // Green for high
    if (min >= 60) return "hsl(48, 96%, 53%)" // Yellow for medium
    return "hsl(0, 84%, 60%)" // Red for low
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={bins} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="range"
          label={{
            value: "Similarity Score Range (%)",
            position: "insideBottom",
            offset: -30,
          }}
        />
        <YAxis
          label={{
            value: "Number of Comparisons",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value) => [`${value} comparisons`, "Count"]}
          labelFormatter={(label) => `Score Range: ${label}%`}
        />
        <Bar dataKey="count" name="Number of Comparisons">
          {bins.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.min)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
