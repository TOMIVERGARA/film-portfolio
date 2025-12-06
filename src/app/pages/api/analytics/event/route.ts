import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST: Track an event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            sessionId,
            eventType,
            eventCategory,
            eventLabel,
            eventValue,
            metadata
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

        // Insert event
        await sql`
      INSERT INTO visitor_events (
        session_id,
        event_type,
        event_category,
        event_label,
        event_value,
        metadata
      ) VALUES (
        ${sessionDbId},
        ${eventType},
        ${eventCategory || null},
        ${eventLabel || null},
        ${eventValue || null},
        ${metadata ? JSON.stringify(metadata) : null}
      )
    `;

        // Update session flags for specific events
        if (eventType === "about_me_opened") {
            await sql`
        UPDATE visitor_sessions 
        SET viewed_about_me = true
        WHERE id = ${sessionDbId}
      `;
        }

        // Update last activity
        await sql`
      UPDATE visitor_sessions 
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionDbId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error tracking event:", error);
        return NextResponse.json(
            { error: "Failed to track event" },
            { status: 500 }
        );
    }
}
