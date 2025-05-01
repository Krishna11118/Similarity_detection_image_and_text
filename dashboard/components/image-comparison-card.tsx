"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoIcon, ChevronDown, ChevronUp } from "lucide-react"
import type { ImageComparisonData, FormData } from "@/types/types"
import { formatDate } from "@/lib/utils"
// import pathh from "../../backend/uploads"

interface ImageComparisonCardProps {
  data: ImageComparisonData
  queryForm?: FormData
  comparedForm?: FormData
}

export function ImageComparisonCard({ data, queryForm, comparedForm }: ImageComparisonCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Determine the match category and color
  const getMatchCategory = (score: number) => {
    if (score >= 80) return { label: "High Match", color: "bg-green-500" }
    if (score >= 60) return { label: "Medium Match", color: "bg-yellow-500" }
    return { label: "Low Match", color: "bg-red-500" }
  }

  const matchInfo = getMatchCategory(data.similarityScore)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Image Comparison</CardTitle>
          <Badge
            variant="outline"
            className={`${data.isSimilar ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}`}
          >
            {data.isSimilar ? "Similar" : "Not Similar"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Query Image</p>
            <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/${data.queryImagePath}`}
                alt="Query"
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                }}
              />
            </div>
            {queryForm && <p className="text-xs truncate">From: {queryForm.projectName}</p>}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Compared Image</p>
            <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/${data.comparedImagePath}`}
                alt="Compared"
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                }}
              />
            </div>
            {comparedForm && <p className="text-xs truncate">From: {comparedForm.projectName}</p>}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Similarity Score</span>
            <span className="text-sm font-bold">{data.similarityScore.toFixed(2)}%</span>
          </div>
          <Progress value={data.similarityScore} className="h-2" indicatorClassName={matchInfo.color} />
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              {matchInfo.label}
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <InfoIcon className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Image Comparison Details</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="images">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="forms">Form Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="images" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-medium mb-2">Query Image</h3>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/${data.queryImagePath}`}
                            alt="Query"
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                            }}
                          />
                        </div>
                        <p className="text-sm mt-2">Path: {data.queryImagePath}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Compared Image</h3>
                        <div className="aspect-video bg-muted rounded-md overflow-hidden">
                          <img
                            src={`${process.env.NEXT_PUBLIC_IMAGE_ENDPOINT}/${data.comparedImagePath}`}
                            alt="Compared"
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=300&width=400"
                            }}
                          />
                        </div>
                        <p className="text-sm mt-2">Path: {data.comparedImagePath}</p>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">Comparison Results</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm">
                            Similarity Score: <span className="font-bold">{data.similarityScore.toFixed(2)}%</span>
                          </p>
                          <p className="text-sm">
                            Is Similar: <span className="font-bold">{data.isSimilar ? "Yes" : "No"}</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">Query UID: {data.queryUid}</p>
                          <p className="text-sm">Compared UID: {data.comparedUid}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="forms" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Query Form Details</h3>
                        {queryForm ? (
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">Project:</span> {queryForm.projectName}
                            </p>
                            <p>
                              <span className="font-medium">Theme:</span> {queryForm.formTheme}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {queryForm.location}
                            </p>
                            <p>
                              <span className="font-medium">Department:</span> {queryForm.department}
                            </p>
                            <p>
                              <span className="font-medium">Category:</span> {queryForm.category}
                            </p>
                            <p>
                              <span className="font-medium">Sub-Category:</span> {queryForm.subCategory}
                            </p>
                            <p>
                              <span className="font-medium">Gemba Unit:</span> {queryForm.gembaUnit}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No form data available</p>
                        )}
                      </div>
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Compared Form Details</h3>
                        {comparedForm ? (
                          <div className="space-y-2 text-sm">
                            <p>
                              <span className="font-medium">Project:</span> {comparedForm.projectName}
                            </p>
                            <p>
                              <span className="font-medium">Theme:</span> {comparedForm.formTheme}
                            </p>
                            <p>
                              <span className="font-medium">Location:</span> {comparedForm.location}
                            </p>
                            <p>
                              <span className="font-medium">Department:</span> {comparedForm.department}
                            </p>
                            <p>
                              <span className="font-medium">Category:</span> {comparedForm.category}
                            </p>
                            <p>
                              <span className="font-medium">Sub-Category:</span> {comparedForm.subCategory}
                            </p>
                            <p>
                              <span className="font-medium">Gemba Unit:</span> {comparedForm.gembaUnit}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No form data available</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="w-full mt-2 h-7" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show Details
            </>
          )}
        </Button>

        {showDetails && (
          <div className="mt-2 pt-2 border-t text-xs space-y-1">
            <p>
              <span className="font-medium">Query Image:</span> {data.queryImagePath.split("/").pop()}
            </p>
            <p>
              <span className="font-medium">Compared Image:</span> {data.comparedImagePath.split("/").pop()}
            </p>
            {queryForm && comparedForm && (
              <>
                <p>
                  <span className="font-medium">Query Project:</span> {queryForm.projectName}
                </p>
                <p>
                  <span className="font-medium">Compared Project:</span> {comparedForm.projectName}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        Processed: {formatDate(data.processedAt)}
      </CardFooter>
    </Card>
  )
}
