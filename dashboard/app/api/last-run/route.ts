import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("form_db")

    // Get the most recent model run
    const lastRun = await db.collection("model_runs").find({}).sort({ timestamp: -1 }).limit(1).toArray()

    if (lastRun.length === 0) {
      // If no runs found, return a default date (1 hour ago)
      const defaultDate = new Date(Date.now() - 3600000)
      return NextResponse.json({ timestamp: defaultDate })
    }

    return NextResponse.json({
      timestamp: lastRun[0].timestamp,
      runId: lastRun[0]._id.toString(),
    })
  } catch (error) {
    console.error("Error fetching last run:", error)
    // Return a default date if there's an error
    const defaultDate = new Date(Date.now() - 3600000)
    return NextResponse.json({ timestamp: defaultDate })
  }
}
