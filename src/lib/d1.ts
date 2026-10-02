// Cloudflare D1 Database Helper for Zupe Store

export interface D1QueryResult<T = any> {
  results: T[];
  success: boolean;
  meta?: any;
}

export async function executeD1Query<T = any>(
  query: string,
  params: any[] = []
): Promise<T[] | null> {
  // 1. Check for Cloudflare Worker environment binding (env.DB)
  const globalEnv = (globalThis as any).process?.env || {};
  const cfBinding = (globalThis as any).DB;

  if (cfBinding && typeof cfBinding.prepare === "function") {
    try {
      const stmt = cfBinding.prepare(query);
      const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
      const res = await boundStmt.all();
      return (res.results as T[]) || [];
    } catch (err) {
      console.warn("D1 direct binding query execution failed:", err);
    }
  }

  // 2. Check for Cloudflare REST API execution if account ID and token are present
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || "4eed09d0032a07881825f4e926cb997f";
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
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
