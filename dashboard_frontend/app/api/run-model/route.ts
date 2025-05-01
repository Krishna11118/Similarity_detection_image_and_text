import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db("form_db")

    // In a real application, you would trigger your model to run here
    // For now, we'll just update the lastRun timestamp in the database

    const result = await db.collection("model_runs").insertOne({
      timestamp: new Date(),
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      message: "Model run successfully",
      runId: result.insertedId.toString(),
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Error running model:", error)
    return NextResponse.json({ error: "Failed to run model" }, { status: 500 })
  }
}
