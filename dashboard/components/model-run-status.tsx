import { Clock } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils"

interface ModelRunStatusProps {
  lastRun: Date
}

export function ModelRunStatus({ lastRun }: ModelRunStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>Last model run: {formatTimeAgo(lastRun)}</span>
    </div>
  )
}
