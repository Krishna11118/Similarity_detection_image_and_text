import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await params
    const pathSegments = resolvedParams?.path || []

    const filename = path.basename(pathSegments.join("/"))

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 })
    }

    const decodedFilename = decodeURIComponent(filename)

    const possiblePaths = [
      path.join(process.cwd(), "..", "backend", "uploads", decodedFilename),
      path.join(process.cwd(), "uploads", decodedFilename),
      path.join(process.cwd(), "public", "uploads", decodedFilename),
      path.join(process.cwd(), "public", decodedFilename),
    ]

    let foundPath: string | null = null
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p
        break
      }
    }

    if (!foundPath) {
      return new NextResponse("Image not found", { status: 404 })
    }

    const fileBuffer = fs.readFileSync(foundPath)
    const ext = path.extname(foundPath).toLowerCase()

    let contentType = "application/octet-stream"
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".gif") contentType = "image/gif"
    else if (ext === ".svg") contentType = "image/svg+xml"
    else if (ext === ".webp") contentType = "image/webp"

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error serving uploaded image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
