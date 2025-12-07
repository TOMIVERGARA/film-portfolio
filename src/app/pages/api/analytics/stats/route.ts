import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAuth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

// GET: Get aggregated statistics
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.isValid) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") || "7days"; // 7days, 30days, 90days, all

        let dateFilter = "";
        switch (period) {
            case "7days":
                dateFilter = "WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'";
                break;
            case "30days":
                dateFilter = "WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'";
                break;
            case "90days":
                dateFilter = "WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'";
                break;
            default:
                dateFilter = "";
        }

        // Get overall stats
        const overallStats = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(DISTINCT session_id) as unique_sessions,
        SUM(CASE WHEN blocked_mobile THEN 1 ELSE 0 END) as mobile_blocked,
        SUM(CASE WHEN is_mobile THEN 1 ELSE 0 END) as mobile_visitors,
        SUM(CASE WHEN is_desktop THEN 1 ELSE 0 END) as desktop_visitors,
        SUM(CASE WHEN viewed_about_me THEN 1 ELSE 0 END) as about_me_views,
        AVG(duration_seconds)::INTEGER as avg_duration,
        MAX(started_at) as last_visit
      FROM visitor_sessions
      ${dateFilter ? sql.unsafe(dateFilter) : sql``}
    `;

        // Get page views count
        const pageViewsResult = await sql`
      SELECT COUNT(*) as total_views
      FROM page_views pv
      JOIN visitor_sessions vs ON pv.session_id = vs.id
      ${dateFilter ? sql.unsafe(dateFilter.replace('started_at', 'vs.started_at')) : sql``}
    `;

        // Get top countries
        const topCountries = await sql`
      SELECT 
        country,
        country_code,
        COUNT(*) as count
      FROM visitor_sessions
      ${dateFilter ? sql.unsafe(dateFilter) : sql``}
      AND country IS NOT NULL
      GROUP BY country, country_code
      ORDER BY count DESC
      LIMIT 10
    `;

        // Get browser distribution
        const browserStats = await sql`
      SELECT 
        browser,
        COUNT(*) as count
      FROM visitor_sessions
      ${dateFilter ? sql.unsafe(dateFilter) : sql``}
      GROUP BY browser
      ORDER BY count DESC
    `;

        // Get OS distribution
        const osStats = await sql`
      SELECT 
        os,
        COUNT(*) as count
      FROM visitor_sessions
      ${dateFilter ? sql.unsafe(dateFilter) : sql``}
      GROUP BY os
      ORDER BY count DESC
    `;

        // Get performance metrics
        const performanceStats = await sql`
      SELECT 
        AVG(page_load_time_ms)::INTEGER as avg_page_load,
        AVG(canvas_init_time_ms)::INTEGER as avg_canvas_init,
        AVG(first_photo_load_time_ms)::INTEGER as avg_first_photo,
        AVG(avg_photo_load_time_ms)::INTEGER as avg_photo_load,
        AVG(total_photos_loaded)::INTEGER as avg_photos_loaded
      FROM performance_metrics pm
      JOIN visitor_sessions vs ON pm.session_id = vs.id
      ${dateFilter ? sql.unsafe(dateFilter.replace('started_at', 'vs.started_at')) : sql``}
    `;

        // Get top events
        const topEvents = await sql`
      SELECT 
        event_type,
        event_category,
        COUNT(*) as count
      FROM visitor_events ve
      JOIN visitor_sessions vs ON ve.session_id = vs.id
      ${dateFilter ? sql.unsafe(dateFilter.replace('started_at', 'vs.started_at')) : sql``}
      GROUP BY event_type, event_category
      ORDER BY count DESC
      LIMIT 10
    `;

        // Get daily sessions for chart (last 30 days)
        const dailySessions = await sql`
      SELECT 
        DATE(started_at) as date,
        COUNT(*) as sessions,
        COUNT(DISTINCT session_id) as unique_visitors
      FROM visitor_sessions
      WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(started_at)
      ORDER BY date ASC
    `;

        return NextResponse.json({
            success: true,
            period,
            stats: {
                overview: overallStats[0],
                pageViews: pageViewsResult[0],
                topCountries,
                browsers: browserStats,
                os: osStats,
                performance: performanceStats[0],
                topEvents,
                dailySessions
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
