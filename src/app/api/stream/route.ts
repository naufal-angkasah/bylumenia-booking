import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Google Drive Video Streaming Proxy API Handler
 * Converts Google Drive file IDs or sharing URLs into direct HTML5 video streamable chunks.
 * Usage: /api/stream?id=YOUR_DRIVE_FILE_ID or /api/stream?url=https://drive.google.com/file/d/ID/view
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let fileId = searchParams.get("id");
  const driveUrl = searchParams.get("url");

  // Extract ID from full URL if provided
  if (!fileId && driveUrl) {
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || driveUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match) {
      fileId = match[1];
    }
  }

  if (!fileId) {
    return NextResponse.json(
      { error: "Parameter 'id' atau 'url' Google Drive wajib disertakan." },
      { status: 400 }
    );
  }

  try {
    // Construct direct Google Drive media stream endpoint
    const targetUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const range = request.headers.get("range");
    const headers: HeadersInit = {};
    if (range) {
      headers["Range"] = range;
    }

    const driveResponse = await fetch(targetUrl, {
      headers,
      redirect: "follow",
    });

    if (!driveResponse.ok && driveResponse.status !== 206) {
      // Fallback redirection if direct streaming is restricted
      return NextResponse.redirect(targetUrl);
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", driveResponse.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");

    const contentLength = driveResponse.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    const contentRange = driveResponse.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    return new NextResponse(driveResponse.body, {
      status: driveResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Gagal melakukan proxy stream video Google Drive:", error);
    return NextResponse.json(
      { error: "Gagal menghubungkan stream video Google Drive." },
      { status: 502 }
    );
  }
}
