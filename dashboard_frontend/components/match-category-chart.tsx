import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "@/components/ui/chart"
import type { ImageComparisonData } from "@/types/types"

interface MatchCategoryChartProps {
  data: ImageComparisonData[]
}

export function MatchCategoryChart({ data }: MatchCategoryChartProps) {
  // Count by category
  const highCount = data.filter((item) => item.similarityScore >= 80).length
  const mediumCount = data.filter((item) => item.similarityScore >= 60 && item.similarityScore < 80).length
  const lowCount = data.filter((item) => item.similarityScore < 60).length

  const chartData = [
    { name: "High Match (80-100%)", value: highCount, color: "hsl(142, 76%, 36%)" },
    { name: "Medium Match (60-80%)", value: mediumCount, color: "hsl(48, 96%, 53%)" },
    { name: "Low Match (0-60%)", value: lowCount, color: "hsl(0, 84%, 60%)" },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} comparisons`, "Count"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
