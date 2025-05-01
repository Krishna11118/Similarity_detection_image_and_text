"use client"

import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PlayIcon, Loader2 } from "lucide-react"

interface DashboardHeaderProps {
  onRunModel: () => void
  isLoading: boolean
}

export function DashboardHeader({ onRunModel, isLoading }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4 md:gap-2 lg:gap-4">
        <form className="flex-1 sm:flex-initial">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <Button onClick={onRunModel} disabled={isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running Model...
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              Run Model
            </>
          )}
        </Button>
        <Button size="sm" variant="outline">
          Export Results
        </Button>
      </div>
    </header>
  )
}
