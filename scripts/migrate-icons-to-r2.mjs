import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  console.log("1. Fetching store_categories from D1...");
  // Write query output to a temp file
  const tmpJsonPath = path.join(process.cwd(), "scratch", "categories_raw.json");
  if (!fs.existsSync(path.dirname(tmpJsonPath))) {
    fs.mkdirSync(path.dirname(tmpJsonPath), { recursive: true });
  }

  const rawOut = execSync(
    'npx wrangler d1 execute zupe-store-db --remote --command="SELECT config_data FROM integrations_config WHERE provider=\'store_categories\';" --json',
    { maxBuffer: 10 * 1024 * 1024, encoding: "utf-8" }
  );

  const parsedOut = JSON.parse(rawOut);
  const configStr = parsedOut[0].results[0].config_data;
  const categories = JSON.parse(configStr);

  console.log(`Found ${categories.length} categories.`);

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (cat.customIcon && cat.customIcon.startsWith("data:")) {
      console.log(`Processing category: ${cat.id} (${cat.name}), base64 length: ${cat.customIcon.length}`);
      
      const match = cat.customIcon.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        console.warn(`Could not parse base64 for ${cat.id}`);
        continue;
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const ext = mimeType.includes("webp") ? "webp" : mimeType.includes("png") ? "png" : "jpg";

      const tmpImgPath = path.join(process.cwd(), "scratch", `icon_${cat.id}.${ext}`);
      fs.writeFileSync(tmpImgPath, Buffer.from(base64Data, "base64"));

      const r2Key = `icons/cat-${cat.id}.${ext}`;
      console.log(`Uploading ${r2Key} to Cloudflare R2 stibe-media...`);

      execSync(
        `npx wrangler r2 object put "stibe-media/${r2Key}" --file="${tmpImgPath}" --content-type="${mimeType}" --remote`,
        { stdio: "inherit" }
      );

      const r2Url = `https://pub-abec22fbfdb8446490341e69eabe6a1c.r2.dev/${r2Key}`;
      cat.customIcon = r2Url;
      console.log(`Updated ${cat.id} customIcon -> ${r2Url}`);

      // clean up local temp file
      try { fs.unlinkSync(tmpImgPath); } catch {}
    }
  }

  // Now write the updated categories back to D1!
  console.log("\nUpdating store_categories in D1 with clean R2 URLs...");
  const newJsonStr = JSON.stringify(categories);
  console.log(`New store_categories size: ${newJsonStr.length} bytes (was ${configStr.length} bytes!)`);

  const sqlFile = path.join(process.cwd(), "scratch", "update_categories.sql");
  // Escape single quotes for SQL
  const escapedJson = newJsonStr.replace(/'/g, "''");
  fs.writeFileSync(
    sqlFile,
    `UPDATE integrations_config SET config_data = '${escapedJson}', updated_at = datetime('now') WHERE provider = 'store_categories';`
  );

  execSync(`npx wrangler d1 execute zupe-store-db --remote --file="${sqlFile}"`, {
    stdio: "inherit",
  });

  console.log("\nMigration completed successfully! Cleaned up 1.67 MB of payload!");
}

main().catch(console.error);
