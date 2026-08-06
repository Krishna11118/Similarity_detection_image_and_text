import { MongoClient, ServerApiVersion } from "mongodb"

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let cachedPromise: Promise<MongoClient> | null = null

export function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    return Promise.reject(
      new Error("Please add your MONGODB_URI to environment variables.")
    )
  }

  if (!cachedPromise) {
    if (process.env.NODE_ENV === "development") {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }
      if (!globalWithMongo._mongoClientPromise) {
        const client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
      }
      cachedPromise = globalWithMongo._mongoClientPromise
    } else {
      const client = new MongoClient(uri, options)
      cachedPromise = client.connect()
    }
  }

  return cachedPromise
}

const clientPromise: Promise<MongoClient> = {
  then(onfulfilled, onrejected) {
    return getMongoClient().then(onfulfilled, onrejected)
  },
  catch(onrejected) {
    return getMongoClient().catch(onrejected)
  },
  finally(onfinally) {
    return getMongoClient().finally(onfinally)
  },
  [Symbol.toStringTag]: "Promise",
}

export default clientPromise
