import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const client = await clientPromise
    const db = client.db("form_db")

    // Build query based on filter
    let query = {}
    if (filter === "high") {
      query = { similarityScore: { $gte: 80 } }
    } else if (filter === "medium") {
      query = { similarityScore: { $gte: 60, $lt: 80 } }
    } else if (filter === "low") {
      query = { similarityScore: { $lt: 60 } }
    }

    // Get image comparisons
    const comparisons = await db.collection("image_similarity_results").find(query).limit(limit).toArray()

    // Convert MongoDB ObjectId to string
    const formattedComparisons = comparisons.map((comparison) => ({
      ...comparison,
      _id: comparison._id.toString(),
    }))

    return NextResponse.json(formattedComparisons)
  } catch (error) {
    console.error("Error fetching image comparisons:", error)
    return NextResponse.json({ error: "Failed to fetch image comparisons" }, { status: 500 })
  }
}
