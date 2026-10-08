import { NextRequest, NextResponse } from "next/server";
import { getAllVideos, addVideo, updateVideo, deleteVideo } from "@/lib/videoStore";

export const runtime = "edge";

export async function GET() {
  try {
    const videos = await getAllVideos();
    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "update" && body.id) {
      const updated = await updateVideo(body.id, body);
      return NextResponse.json({
        success: true,
        video: updated,
      });
    }

    if (!body.title || !body.videoUrl) {
      return NextResponse.json(
        { success: false, error: "Title and Video URL are required" },
        { status: 400 }
      );
    }

    const created = await addVideo({
      productId: body.productId || "all",
      title: body.title,
      videoUrl: body.videoUrl,
      posterUrl: body.posterUrl || "",
      viewsText: body.viewsText || "24.5k",
      badge: body.badge || "NEW",
      active: body.active !== false,
    });

    return NextResponse.json({
      success: true,
      video: created,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save video" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing video id" },
        { status: 400 }
      );
    }

    await deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete video" },
      { status: 500 }
    );
  }
}
