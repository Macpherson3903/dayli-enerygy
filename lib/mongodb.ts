import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

/** Bounded wait; on failure the cached promise is cleared so the next request can retry. */
const options = {
  serverSelectionTimeoutMS: 12_000,
  connectTimeoutMS: 12_000,
};

const RETRYABLE_NETWORK_CODES = [
  "ESERVFAIL",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
];

const maxConnectAttempts = Math.max(
  Number.parseInt(process.env.MONGODB_CONNECT_RETRIES ?? "4", 10) || 4,
  1
);
const retryDelayMs = Math.max(
  Number.parseInt(process.env.MONGODB_CONNECT_RETRY_DELAY_MS ?? "400", 10) ||
    400,
  50
);

let clientPromise: Promise<MongoClient> | undefined;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function isRetryableMongoConnectError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const name = (e as { name?: string }).name ?? "";
  const message = (e as { message?: string }).message ?? "";
  if (
    name === "MongoNetworkError" ||
    name === "MongoServerSelectionError" ||
    name === "MongoTimeoutError"
  ) {
    return true;
  }
  return RETRYABLE_NETWORK_CODES.some((code) => message.includes(code));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(mongoUri: string): Promise<MongoClient> {
  let attempt = 1;
  let lastError: unknown;

  while (attempt <= maxConnectAttempts) {
    const c = new MongoClient(mongoUri, options);
    try {
      await c.connect();
      return c;
    } catch (e) {
      lastError = e;
      try {
        await c.close();
      } catch {
        // Ignore close errors during retry loop.
      }

      if (!isRetryableMongoConnectError(e) || attempt === maxConnectAttempts) {
        throw e;
      }

      const waitMs = retryDelayMs * attempt;
      console.warn(
        `[mongodb] connect attempt ${attempt}/${maxConnectAttempts} failed (${(e as Error).message}). Retrying in ${waitMs}ms...`
      );
      await sleep(waitMs);
      attempt += 1;
    }
  }

  throw lastError;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(
      new Error("MONGODB_URI is not set. Add it to your environment.")
    );
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connectWithRetry(uri).catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }
  if (!clientPromise) {
    clientPromise = connectWithRetry(uri).catch((err) => {
      clientPromise = undefined;
      throw err;
    });
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getClientPromise();
  return c.db(process.env.MONGODB_DB_NAME ?? "dayli_energy");
}
