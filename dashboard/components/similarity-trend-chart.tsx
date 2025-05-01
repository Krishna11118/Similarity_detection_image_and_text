import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "@/components/ui/chart"
import type { ImageComparisonData } from "@/types/types"

interface SimilarityTrendChartProps {
  data: ImageComparisonData[]
}

export function SimilarityTrendChart({ data }: SimilarityTrendChartProps) {
  // Sort data by processedAt date
  const sortedData = [...data].sort((a, b) => new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime())

  // Format data for the chart
  const chartData = sortedData.map((item, index) => ({
    id: index,
    score: item.similarityScore,
    date: new Date(item.processedAt).toLocaleDateString(),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="id"
          label={{
            value: "Comparison Index",
            position: "insideBottom",
            offset: -30,
          }}
        />
        <YAxis
          domain={[0, 100]}
          label={{
            value: "Similarity Score (%)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value) => [`${value}%`, "Similarity Score"]}
          labelFormatter={(label) => `Comparison #${Number.parseInt(label) + 1}`}
        />
        <ReferenceLine y={80} stroke="hsl(142, 76%, 36%)" strokeDasharray="3 3" label="High Match" />
        <ReferenceLine y={60} stroke="hsl(48, 96%, 53%)" strokeDasharray="3 3" label="Medium Match" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
