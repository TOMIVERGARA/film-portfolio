import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST: Track a page view
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            sessionId,
            pagePath,
            pageTitle,
            viewDuration
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

        // Insert page view
        await sql`
      INSERT INTO page_views (
        session_id,
        page_path,
        page_title,
        view_duration_seconds
      ) VALUES (
        ${sessionDbId},
        ${pagePath},
        ${pageTitle || null},
        ${viewDuration || null}
      )
    `;

        // Update last activity
        await sql`
      UPDATE visitor_sessions 
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionDbId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error tracking page view:", error);
        return NextResponse.json(
            { error: "Failed to track page view" },
            { status: 500 }
        );
    }
}
