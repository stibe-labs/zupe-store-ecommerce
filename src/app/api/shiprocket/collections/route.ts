import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      data: {
        total: 1,
        collections: [
          {
            id: 5001,
            title: "Vittal Digital Sachets",
            handle: "all-packs",
            body_html: "<p>Authentic Herbal Jam sachets</p>",
            image: {
              src: "https://vittaldigital.com/tj/turkiye-jam-3-strips.png",
            },
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch collections" }, { status: 500 });
  }
}
