"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayIcon, BarChart2, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  onRunModel: () => void
  isLoading: boolean
}

export function QuickActions({ onRunModel, isLoading }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button onClick={onRunModel} disabled={isLoading} className="w-full justify-start gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Model...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              Run Similarity Model
            </>
          )}
        </Button>

        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link href="/dashboard">
            <ImageIcon className="h-4 w-4" />
            View All Comparisons
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link href="/analytics">
            <BarChart2 className="h-4 w-4" />
            View Analytics
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
