// Cloudflare D1 Database Helper for Zupe Store

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta?: any;
}

let cachedDb: any = null;

async function getD1Database(): Promise<any | null> {
  if (cachedDb && typeof cachedDb.prepare === "function") {
    return cachedDb;
  }

  // 1. Fast direct bindings in globalThis or process.env (0ms CPU)
  if ((globalThis as any).DB && typeof (globalThis as any).DB.prepare === "function") {
    cachedDb = (globalThis as any).DB;
    return cachedDb;
  }
  if ((globalThis as any).__cf_env__?.DB && typeof (globalThis as any).__cf_env__.DB.prepare === "function") {
    cachedDb = (globalThis as any).__cf_env__.DB;
    return cachedDb;
  }
  if ((process.env as any).DB && typeof (process.env as any).DB.prepare === "function") {
    cachedDb = (process.env as any).DB;
    return cachedDb;
  }

  // 2. Try @opennextjs/cloudflare getCloudflareContext
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as any;
    if (env?.DB && typeof env.DB.prepare === "function") {
      cachedDb = env.DB;
      return cachedDb;
    }
  } catch (err) {
    // Not running inside OpenNext async context or package not found
  }

  return null;
}

export async function executeD1Query<T = any>(
  query: string,
  params: any[] = []
): Promise<T[] | null> {
  // 1. Check for Cloudflare Worker environment binding (env.DB)
  const db = await getD1Database();

  if (db && typeof db.prepare === "function") {
    try {
      const stmt = db.prepare(query);
      const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
      const trimmedQuery = query.trim().toUpperCase();
      if (trimmedQuery.startsWith("SELECT") || trimmedQuery.startsWith("PRAGMA")) {
        const res = await boundStmt.all();
        return (res.results as T[]) || [];
      } else {
        const res = await boundStmt.run();
        return (res.results as T[]) || [];
      }
    } catch (err) {
      console.warn("D1 direct binding query execution failed:", err);
    }
  }

  // 2. Check for Cloudflare REST API execution if account ID and token are present
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || "4eed09d0032a07881825f4e926cb997f";
  const databaseId =
    process.env.CLOUDFLARE_D1_DATABASE_ID || "1ebc3c22-07be-4f35-b437-5292d137d246";
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (databaseId && apiToken && accountId) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: query,
          params: params,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.result && json.result[0]?.results) {
          return json.result[0].results as T[];
        }
      }
    } catch (err) {
      console.warn("Cloudflare D1 REST API query failed:", err);
    }
  }

  return null;
}
