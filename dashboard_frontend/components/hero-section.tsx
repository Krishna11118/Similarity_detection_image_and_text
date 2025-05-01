import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatTimeAgo } from "@/lib/utils"
import { ArrowRight, Clock, ImageIcon } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  lastRun: Date
}

export function HeroSection({ lastRun }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-background to-muted p-6 md:p-10">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-primary/10 to-transparent" />

      <div className="relative z-10 max-w-2xl">
        <Badge className="mb-4" variant="outline">
          <Clock className="mr-1 h-3 w-3" /> Last run: {formatTimeAgo(lastRun)}
        </Badge>

        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Image Similarity <span className="text-primary">Dashboard</span>
        </h1>

        <p className="mb-6 text-muted-foreground md:text-lg">
          Analyze and compare images with advanced AI technology. Identify similarities, detect patterns, and gain
          insights from your visual data with our powerful image comparison platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/analytics">
              <ImageIcon className="h-4 w-4" />
              Explore Analytics
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 -mb-24 -mr-24 h-[350px] w-[350px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-32 -mb-12 -mr-12 h-[250px] w-[250px] rounded-full bg-secondary/20 blur-3xl" />
    </div>
  )
}
