# Vittal Digital — Development, Git & Deployment Guidelines

> [!IMPORTANT]
> **Branch Isolation Warning:**
> This branch (`vittaldigital`) is a **completely standalone project** (Vittal Digital Store). It is **NEVER to be merged into `main` or any other branch**, and `main` is **never to be merged into `vittaldigital`**.

---

## 1. Project Infrastructure Details

| Resource | Value |
| :--- | :--- |
| **Project Name** | Vittal Digital |
| **Git Branch** | `vittaldigital` |
| **Production Domain** | `https://vittaldigital.com` |
| **Cloudflare Worker Service** | `vittaldigital` (Production) |
| **Cloudflare Account ID** | `4eed09d0032a07881825f4e926cb997f` |
| **Cloudflare Dashboard URL** | [View vittaldigital Worker](https://dash.cloudflare.com/4eed09d0032a07881825f4e926cb997f/workers/services/view/vittaldigital/production) |
| **D1 Database Name** | `vittaldigital-db` |
| **D1 Database ID** | `ff60b17f-319d-42b6-9ff7-2ce4684a91d7` |
| **R2 Storage Bucket** | `stibe-media` |
| **Support Email** | `support@vittaldigital.com` |
| **Admin Email** | `admin@vittaldigital.com` |

---

## 2. Core Operational Rules (Zero-Mistake Policy)

### Rule 1: Always Verify Active Branch First
Before editing any file, creating a commit, or triggering a build:
```bash
git branch --show-current
```
Must output: `vittaldigital`

### Rule 2: Strictly Isolated Commits
Never push to `main` when working on this project. Always push to `origin vittaldigital`:
```bash
git add <files>
git commit -m "feat(branding): description"
git push origin vittaldigital
```

### Rule 3: Never Merge with `main`
- Do not run `git merge main`
- Do not run `git merge vittaldigital` from `main`
- Do not create Pull Requests merging these two branches on GitHub

### Rule 4: Preserve `wrangler.json` Settings
The `wrangler.json` file in this branch must always retain:
```json
{
  "name": "vittaldigital",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "vittaldigital-db",
      "database_id": "ff60b17f-319d-42b6-9ff7-2ce4684a91d7"
    }
  ]
}
```
Never overwrite this file with `zupe-store` configuration.

---

## 3. Deployment Workflow

Deploying Vittal Digital to Cloudflare Workers is automated:

1. **Clean stale build artifacts if switching branches:**
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

2. **Verify TypeScript compilation:**
   ```bash
   npx tsc --noEmit
   ```

3. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```
   *(Runs Next.js build + OpenNext bundle + Wrangler deploy directly to `vittaldigital` worker)*

4. **Verify Deployment:**
   - Confirm Wrangler output displays: `Uploaded vittaldigital`
   - Check live site at [vittaldigital.com](https://vittaldigital.com)

