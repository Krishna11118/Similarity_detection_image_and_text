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

    // 1. Try local filesystem (for local development)
    const possiblePaths = [
      path.join(process.cwd(), "..", "backend", "uploads", decodedFilename),
      path.join(process.cwd(), "uploads", decodedFilename),
      path.join(process.cwd(), "public", "uploads", decodedFilename),
      path.join(process.cwd(), "public", decodedFilename),
    ]

    let foundPath: string | null = null
    for (const p of possiblePaths) {
      try {
        if (fs.existsSync(p)) {
          foundPath = p
          break
        }
      } catch {
        // Ignore filesystem permission or path restrictions on cloud platforms
      }
    }

    if (foundPath) {
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
    }

    // 2. Fallback for Vercel / Deployed environments:
    // Proxy request to backend service URL (e.g. BACKEND_URL or NEXT_PUBLIC_IMAGE_ENDPOINT)
    const backendBaseUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_IMAGE_ENDPOINT ||
      "http://localhost:8000"

    const backendImageUrl = `${backendBaseUrl.replace(/\/$/, "")}/uploads/${encodeURIComponent(decodedFilename)}`

    try {
      const backendRes = await fetch(backendImageUrl)
      if (backendRes.ok) {
        const imageBuffer = await backendRes.arrayBuffer()
        const contentType =
          backendRes.headers.get("content-type") || "image/jpeg"

        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600, must-revalidate",
          },
        })
      }
    } catch (proxyError) {
      console.error("Failed to proxy image from backend:", proxyError)
    }

    return new NextResponse("Image not found", { status: 404 })
  } catch (error) {
    console.error("Error serving uploaded image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
