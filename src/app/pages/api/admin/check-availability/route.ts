import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { username, email } = await request.json();

        const results: {
            usernameAvailable: boolean;
            emailAvailable: boolean;
        } = {
            usernameAvailable: true,
            emailAvailable: true,
        };

        // Check username availability
        if (username) {
            const existingUsername = await sql`
        SELECT id FROM users WHERE LOWER(username) = LOWER(${username})
      `;
            results.usernameAvailable = existingUsername.length === 0;
        }

        // Check email availability
        if (email) {
            const existingEmail = await sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${email})
      `;
            results.emailAvailable = existingEmail.length === 0;
        }

        return NextResponse.json({
            success: true,
            ...results,
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Error al verificar disponibilidad",
            },
            { status: 500 }
        );
    }
}
