import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST: Track performance metrics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      pageLoadTime,
      canvasInitTime,
      firstPhotoLoadTime,
      avgPhotoLoadTime,
      totalPhotosLoaded,
      connectionType,
      connectionEffectiveType
    } = body;

    // Get session ID from database
    const session = await sql`
      SELECT id FROM visitor_sessions 
      WHERE session_id = ${sessionId}
      LIMIT 1
    `;

    if (session.length === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const sessionDbId = session[0].id;

    // Use UPSERT: Insert or update if session_id already exists
    // This assumes there's a unique constraint on session_id
    await sql`
      INSERT INTO performance_metrics (
        session_id,
        page_load_time_ms,
        canvas_init_time_ms,
        first_photo_load_time_ms,
        avg_photo_load_time_ms,
        total_photos_loaded,
        connection_type,
        connection_effective_type
      ) VALUES (
        ${sessionDbId},
        ${pageLoadTime || null},
        ${canvasInitTime || null},
        ${firstPhotoLoadTime || null},
        ${avgPhotoLoadTime || null},
        ${totalPhotosLoaded || null},
        ${connectionType || null},
        ${connectionEffectiveType || null}
      )
      ON CONFLICT (session_id)
      DO UPDATE SET
        page_load_time_ms = COALESCE(EXCLUDED.page_load_time_ms, performance_metrics.page_load_time_ms),
        canvas_init_time_ms = COALESCE(EXCLUDED.canvas_init_time_ms, performance_metrics.canvas_init_time_ms),
        first_photo_load_time_ms = COALESCE(EXCLUDED.first_photo_load_time_ms, performance_metrics.first_photo_load_time_ms),
        avg_photo_load_time_ms = COALESCE(EXCLUDED.avg_photo_load_time_ms, performance_metrics.avg_photo_load_time_ms),
        total_photos_loaded = COALESCE(EXCLUDED.total_photos_loaded, performance_metrics.total_photos_loaded),
        connection_type = COALESCE(EXCLUDED.connection_type, performance_metrics.connection_type),
        connection_effective_type = COALESCE(EXCLUDED.connection_effective_type, performance_metrics.connection_effective_type)
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking performance:", error);
    return NextResponse.json(
      { error: "Failed to track performance" },
      { status: 500 }
    );
  }
}
