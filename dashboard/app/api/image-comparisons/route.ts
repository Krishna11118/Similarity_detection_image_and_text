// import { NextResponse } from "next/server"
// import clientPromise from "@/lib/mongodb"

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const filter = searchParams.get("filter") || "all"
//     const limit = Number.parseInt(searchParams.get("limit") || "100")

//     const client = await clientPromise
//     const db = client.db("form_db")

//     // Build query based on filter
//     let query = {}
//     if (filter === "high") {
//       query = { similarityScore: { $gte: 80 } }
//     } else if (filter === "medium") {
//       query = { similarityScore: { $gte: 60, $lt: 80 } }
//     } else if (filter === "low") {
//       query = { similarityScore: { $lt: 60 } }
//     }

//     // Get image comparisons
//     const comparisons = await db.collection("image_similarity_results").find(query).limit(limit).toArray()

//     // Convert MongoDB ObjectId to string
//     const formattedComparisons = comparisons.map((comparison) => ({
//       ...comparison,
//       _id: comparison._id.toString(),
//     }))

//     return NextResponse.json(formattedComparisons)
//   } catch (error) {
//     console.error("Error fetching image comparisons:", error)
//     return NextResponse.json({ error: "Failed to fetch image comparisons" }, { status: 500 })
//   }
// }


import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import path from "path";

export const dynamic = "force-dynamic";

function formatImagePath(rawPath: string | undefined | null): string {
  if (!rawPath) return "/placeholder.svg";
  if (
    (rawPath.startsWith("http://") || rawPath.startsWith("https://")) &&
    !rawPath.includes("github.com")
  ) {
    return rawPath;
  }
  const filename = path.basename(rawPath);
  return `/api/uploads/${filename}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const limit = Number.parseInt(searchParams.get("limit") || "100");

    const client = await clientPromise;
    const db = client.db("form_db");

    // Build query based on filter
    let query = {};
    if (filter === "high") {
      query = { similarityScore: { $gte: 80 } };
    } else if (filter === "medium") {
      query = { similarityScore: { $gte: 60, $lt: 80 } };
    } else if (filter === "low") {
      query = { similarityScore: { $lt: 60 } };
    }

    // Get image comparisons
    const comparisons = await db
      .collection("image_similarity_results")
      .find(query)
      .limit(limit)
      .toArray();

    // Fetch forms to get before and after picture paths
    const forms = await db
      .collection("forms")
      .find({ uid: { $in: comparisons.map((c) => c.queryUid) } })
      .toArray();

    // Create a map of forms by uid for quick lookup
    const formMap = forms.reduce((map: Record<string, { beforePicturePaths: string[]; afterPicturePaths: string[] }>, form) => {
      map[form.uid] = {
        beforePicturePaths: form.beforePicturePaths || [],
        afterPicturePaths: form.afterPicturePaths || [],
      };
      return map;
    }, {} as Record<string, { beforePicturePaths: string[]; afterPicturePaths: string[] }>);

    // Format comparisons and include form picture paths with /api/uploads/ endpoint
    const formattedComparisons = comparisons.map((comparison) => {
      const formData = formMap[comparison.queryUid] || {
        beforePicturePaths: [],
        afterPicturePaths: [],
      };

      return {
        ...comparison,
        _id: comparison._id.toString(),
        queryImagePath: formatImagePath(comparison.queryImagePath),
        comparedImagePath: formatImagePath(comparison.comparedImagePath),
        beforePicturePaths: formData.beforePicturePaths.map(formatImagePath),
        afterPicturePaths: formData.afterPicturePaths.map(formatImagePath),
      };
    });

    return NextResponse.json(formattedComparisons);
  } catch (error) {
    console.error("Error fetching image comparisons:", error);
    return NextResponse.json(
      { error: "Failed to fetch image comparisons" },
      { status: 500 }
    );
  }
}