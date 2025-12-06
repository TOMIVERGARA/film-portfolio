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

        // Insert or update performance metrics
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
