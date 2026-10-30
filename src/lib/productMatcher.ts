// Intelligent Product Matcher & Image Normalizer Utility
// Resolves CSV product names, titles, and handles to actual catalog product slugs

export interface CatalogProduct {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  price?: number;
  images?: string[];
  poster_image?: string;
}

// Known aliases to match various platform export naming conventions
const KNOWN_ALIASES: Record<string, string> = {
  "hot wheels": "hot-weels",
  "hot weels": "hot-weels",
  "hot-wheels": "hot-weels",
  "hot wheels assorted car set": "hot-weels",
  "hot weels assorted car set": "hot-weels",
  "assorted car set": "hot-weels",
  "hot wheels cars": "hot-weels",
  "hot wheels die cast": "hot-weels",
  "hotwheels": "hot-weels",
  "dynamic water ripple night light": "dynamic-water-ripple-night-light",
  "water ripple lamp": "dynamic-water-ripple-night-light",
  "water-ripple-lamp": "dynamic-water-ripple-night-light",
  "ripple light": "dynamic-water-ripple-night-light",
  "ripple lamp": "dynamic-water-ripple-night-light",
  "crystal lamp": "dynamic-water-ripple-night-light",
  "tf20 multipurpose powerbank with airpods": "tf20-multipurpose-powerbank-with-airpods",
  "powerbank earbuds": "tf20-multipurpose-powerbank-with-airpods",
  "powerbank with airpods": "tf20-multipurpose-powerbank-with-airpods",
  "tf20 powerbank": "tf20-multipurpose-powerbank-with-airpods",
  "tf20": "tf20-multipurpose-powerbank-with-airpods",
  "solar helicopter car fragrance": "car-fragrance-helicopter",
  "car fragrance helicopter": "car-fragrance-helicopter",
  "helicopter perfume": "car-fragrance-helicopter",
  "solar helicopter": "car-fragrance-helicopter",
  "helicopter": "car-fragrance-helicopter",
  "mini portable steam iron": "mini-portable-steam-iron",
  "mini steam iron": "mini-portable-steam-iron",
  "portable steam iron": "mini-portable-steam-iron",
  "steam iron": "mini-portable-steam-iron",
  "portable menstrual heating pad": "portable-menstrual-heating-pad",
  "menstrual heating pad": "portable-menstrual-heating-pad",
  "heating pad": "portable-menstrual-heating-pad",
  "foldable mini washing machine": "foldable-mini-washing-machine",
  "mini washing machine": "foldable-mini-washing-machine",
  "portable washer": "foldable-mini-washing-machine",
  "instant heating faucet tap": "instant-heating-faucet-tap",
  "heating faucet": "instant-heating-faucet-tap",
  "mini thermal pocket printer": "mini-thermal-pocket-printer",
  "thermal printer": "mini-thermal-pocket-printer",
  "pocket printer": "mini-thermal-pocket-printer",
  "portable mesh nebulizer": "portable-mesh-nebulizer",
  "mesh nebulizer": "portable-mesh-nebulizer",
  "hot air popcorn maker": "hot-air-popcorn-maker",
  "popcorn maker": "hot-air-popcorn-maker",
};

/**
 * Normalizes an image URL: preserves base64 data URLs, full HTTP/S URLs,
 * and ensures relative paths have a leading slash so they load from public.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "/images/placeholder.png";
  const trimmed = url.trim();
  if (!trimmed) return "/images/placeholder.png";
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * Clean & slugify string
 */
export function slugifyString(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate Levenshtein distance between two short words
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row: number[] = [];
  for (let i = 0; i <= b.length; i++) row[i] = i;

  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      let val: number;
      if (a[i - 1] === b[j - 1]) {
        val = row[j - 1];
      } else {
        val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Intelligently resolve a raw product string (from CSV product_name or slug)
 * to an existing product in the catalog.
 */
export function resolveProductMatch(
  rawInput: string,
  catalog: CatalogProduct[] = []
): { matchedProduct: CatalogProduct | null; resolvedSlug: string; matchType: string } {
  const clean = (rawInput || "").toLowerCase().trim();
  if (!clean) {
    return { matchedProduct: null, resolvedSlug: "", matchType: "none" };
  }

  const slugified = slugifyString(clean);

  // 1. Check known alias mapping
  if (KNOWN_ALIASES[clean]) {
    const targetSlug = KNOWN_ALIASES[clean];
    const found = catalog.find(
      (p) => (p.slug || "").toLowerCase() === targetSlug || (p.id || "").toLowerCase() === targetSlug
    );
    if (found) {
      return { matchedProduct: found, resolvedSlug: found.slug || found.id, matchType: "alias" };
    }
  }

  for (const [aliasKey, targetSlug] of Object.entries(KNOWN_ALIASES)) {
    if (clean.includes(aliasKey) || aliasKey.includes(clean) || slugified.includes(slugifyString(aliasKey))) {
      const found = catalog.find(
        (p) => (p.slug || "").toLowerCase() === targetSlug || (p.id || "").toLowerCase() === targetSlug
      );
      if (found) {
        return { matchedProduct: found, resolvedSlug: found.slug || found.id, matchType: "alias-partial" };
      }
    }
  }

  // 2. Exact match on slug, ID, or full name
  const exact = catalog.find((p) => {
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pId = (p.id || "").toLowerCase().trim();
    const pName = (p.name || "").toLowerCase().trim();
    return pSlug === clean || pId === clean || pName === clean || pSlug === slugified || pId === slugified;
  });
  if (exact) {
    return { matchedProduct: exact, resolvedSlug: exact.slug || exact.id, matchType: "exact" };
  }

  // 3. Substring containment match on slug, ID, or name
  const substringMatch = catalog.find((p) => {
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pId = (p.id || "").toLowerCase().trim();
    const pName = (p.name || "").toLowerCase().trim();
    const pSlugClean = pSlug.replace(/[^a-z0-9]/g, "");
    const cleanNoSpecial = clean.replace(/[^a-z0-9]/g, "");

    return (
      (pSlug && (clean.includes(pSlug) || pSlug.includes(clean))) ||
      (pId && (clean.includes(pId) || pId.includes(clean))) ||
      (pName && (clean.includes(pName) || pName.includes(clean))) ||
      (pSlugClean && cleanNoSpecial.includes(pSlugClean)) ||
      (cleanNoSpecial && pSlugClean && pSlugClean.includes(cleanNoSpecial))
    );
  });
  if (substringMatch) {
    return {
      matchedProduct: substringMatch,
      resolvedSlug: substringMatch.slug || substringMatch.id,
      matchType: "substring",
    };
  }

  // 4. Token overlap & fuzzy matching (e.g. "Hot Wheels Assorted Car Set" vs "hot weels")
  const stopWords = new Set(["the", "a", "an", "and", "or", "for", "with", "in", "of", "to", "set", "pack"]);
  const inputTokens = clean
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  let bestMatch: CatalogProduct | null = null;
  let highestScore = 0;

  for (const p of catalog) {
    const pSlug = (p.slug || "").toLowerCase();
    const pName = (p.name || "").toLowerCase();
    const targetTokens = `${pName} ${pSlug}`
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w));

    let score = 0;
    for (const inToken of inputTokens) {
      for (const tToken of targetTokens) {
        if (inToken === tToken) {
          score += 3;
        } else if (inToken.includes(tToken) || tToken.includes(inToken)) {
          score += 2;
        } else if (Math.abs(inToken.length - tToken.length) <= 1 && levenshtein(inToken, tToken) <= 1) {
          // e.g. "wheels" vs "weels" (distance = 1)
          score += 2.5;
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = p;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return {
      matchedProduct: bestMatch,
      resolvedSlug: bestMatch.slug || bestMatch.id,
      matchType: `fuzzy-score-${highestScore}`,
    };
  }

  // Fallback: slugify input
  return { matchedProduct: null, resolvedSlug: slugified, matchType: "fallback-slugified" };
}
