import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Helper to parse user agent
function parseUserAgent(userAgent: string) {
    const isMobile = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
    const isTablet = /Tablet|iPad/.test(userAgent);

    let browser = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    let os = "Unknown";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    return {
        isMobile,
        isTablet,
        isDesktop: !isMobile && !isTablet,
        browser,
        os,
        deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop"
    };
}

// Helper to get geographic data from IP (using a free service)
async function getGeoData(ip: string) {
    try {
        // Using ipapi.co free tier (1000 requests/day)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (response.ok) {
            const data = await response.json();
            return {
                country: data.country_name,
                countryCode: data.country_code,
                city: data.city,
                region: data.region,
                timezone: data.timezone
            };
        }
    } catch (error) {
        console.error("Failed to fetch geo data:", error);
    }

    return {
        country: null,
        countryCode: null,
        city: null,
        region: null,
        timezone: null
    };
}

// POST: Create or update a session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            sessionId,
            screenWidth,
            screenHeight,
            referrer,
            utmSource,
            utmMedium,
            utmCampaign,
            blockedMobile
        } = body;

        // Get user agent and IP
        const userAgent = request.headers.get("user-agent") || "";
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // Parse user agent
        const deviceInfo = parseUserAgent(userAgent);

        // Get geographic data
        const geoData = await getGeoData(ip);

        // Check if session exists
        const existingSession = await sql`
      SELECT id FROM visitor_sessions 
      WHERE session_id = ${sessionId}
    `;

        if (existingSession.length > 0) {
            // Update existing session
            await sql`
        UPDATE visitor_sessions 
        SET 
          last_activity_at = CURRENT_TIMESTAMP,
          blocked_mobile = COALESCE(${blockedMobile}, blocked_mobile)
        WHERE session_id = ${sessionId}
      `;

            return NextResponse.json({
                success: true,
                sessionId,
                action: "updated"
            });
        } else {
            // Create new session
            const result = await sql`
        INSERT INTO visitor_sessions (
          session_id,
          user_agent,
          is_mobile,
          is_desktop,
          browser,
          os,
          device_type,
          screen_width,
          screen_height,
          ip_address,
          country,
          country_code,
          city,
          region,
          timezone,
          referrer,
          utm_source,
          utm_medium,
          utm_campaign,
          blocked_mobile
        ) VALUES (
          ${sessionId},
          ${userAgent},
          ${deviceInfo.isMobile},
          ${deviceInfo.isDesktop},
          ${deviceInfo.browser},
          ${deviceInfo.os},
          ${deviceInfo.deviceType},
          ${screenWidth},
          ${screenHeight},
          ${ip},
          ${geoData.country},
          ${geoData.countryCode},
          ${geoData.city},
          ${geoData.region},
          ${geoData.timezone},
          ${referrer},
          ${utmSource},
          ${utmMedium},
          ${utmCampaign},
          ${blockedMobile || false}
        )
        RETURNING id
      `;

            return NextResponse.json({
                success: true,
                sessionId,
                id: result[0].id,
                action: "created",
                deviceInfo,
                geoData
            });
        }
    } catch (error) {
        console.error("Error managing session:", error);
        return NextResponse.json(
            { error: "Failed to manage session" },
            { status: 500 }
        );
    }
}

// PATCH: End a session
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId } = body;

        await sql`
      UPDATE visitor_sessions 
      SET 
        ended_at = CURRENT_TIMESTAMP,
        duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER
      WHERE session_id = ${sessionId} AND ended_at IS NULL
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error ending session:", error);
        return NextResponse.json(
            { error: "Failed to end session" },
            { status: 500 }
        );
    }
}
