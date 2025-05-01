import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    // Test the connection by getting server info
    await client.db("admin").command({ ping: 1 })

    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to MongoDB",
    })
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to MongoDB",
      },
      { status: 500 },
    )
  }
}
