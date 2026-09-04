import { Button } from "@/components/ui/button"
import { formatTimeAgo } from "@/lib/utils"
import { ArrowRight, ImageIcon } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  lastRun: Date
}

export function HeroSection({ lastRun }: HeroSectionProps) {
  return (
    <section className="rounded-lg border border-t-[3px] border-t-primary bg-card p-6 md:p-10">
      <div className="max-w-2xl">
        <p className="wo-eyebrow mb-4">Control Room · Image + Text Similarity</p>

        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Image Similarity <span className="text-primary">Dashboard</span>
        </h1>

        <p className="mb-6 max-w-xl text-muted-foreground md:text-lg">
          Review AI-detected similarity across Kaizen improvement records. Surface likely
          duplicate photos and overlapping text, and trace every match back to the
          submission it came from.
        </p>

        <div className="mb-8 inline-flex items-center gap-2 border-l-[3px] border-primary py-1 pl-3 font-data text-xs uppercase tracking-wider text-muted-foreground">
          Last model run —{" "}
          <span className="font-semibold text-foreground">{formatTimeAgo(lastRun)}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              View comparisons
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/analytics">
              <ImageIcon className="h-4 w-4" />
              Explore analytics
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
