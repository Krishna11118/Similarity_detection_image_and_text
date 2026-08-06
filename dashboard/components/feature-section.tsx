import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, BarChart2, Zap, Search, RefreshCw, FileText } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: ImageIcon,
      title: "Image Comparison",
      description: "Compare images with precision and identify similarities across your visual data.",
    },
    {
      icon: BarChart2,
      title: "Advanced Analytics",
      description: "Gain insights with comprehensive analytics and visualizations of your comparison data.",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Process images quickly with our optimized similarity detection algorithms.",
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find similar images across your entire database with intelligent search capabilities.",
    },
    {
      icon: RefreshCw,
      title: "Real-time Updates",
      description: "See results immediately with real-time processing and instant feedback.",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Generate comprehensive reports with detailed similarity metrics and insights.",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Key Features</h2>
        <p className="text-muted-foreground mt-2">Powerful tools to analyze and understand your image data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="overflow-hidden border-none shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <CardHeader className="pb-2">
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
