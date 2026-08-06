import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("form_db")

    // Get forms
    const forms = await db.collection("forms").find({}).toArray()

    // Convert MongoDB ObjectId to string
    const formattedForms = forms.map((form) => ({
      ...form,
      _id: form._id.toString(),
    }))

    return NextResponse.json(formattedForms)
  } catch (error) {
    console.error("Error fetching forms:", error)
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 })
  }
}
