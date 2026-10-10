import { NextRequest, NextResponse } from "next/server";
import { uploadMedia, uploadBase64Media } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct file upload from browser)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folderParam = formData.get("folder") as string | null;
      const folder: "videos" | "images" =
        folderParam === "images" || (file?.type.startsWith("image/") ?? false)
          ? "images"
          : "videos";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file was provided in the upload request" },
          { status: 400 }
        );
      }

      // Check max file size (e.g. 100MB)
      const MAX_SIZE = 100 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max size is 100MB.`,
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const publicUrl = await uploadMedia(
        arrayBuffer,
        file.name,
        file.type,
        folder
      );

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: file.name,
        size: file.size,
        type: file.type,
        folder,
      });
    }

    // 2. JSON Body (Base64 data URL upload)
    const body = await req.json();
    if (body.dataUrl) {
      const folder: "videos" | "images" =
        body.folder === "images" ? "images" : "videos";
      const publicUrl = await uploadBase64Media(body.dataUrl, folder);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        folder,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid upload request format" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Admin upload API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to upload file to media storage",
      },
      { status: 500 }
    );
  }
}
