import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyAuth } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

// DELETE: Clear all analytics data
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all analytics data in order to respect foreign key constraints
    await sql`DELETE FROM performance_metrics`;
    await sql`DELETE FROM page_views`;
    await sql`DELETE FROM visitor_events`;
    await sql`DELETE FROM visitor_sessions`;

    return NextResponse.json({
      success: true,
      message: "Todas las métricas han sido eliminadas",
    });
  } catch (error) {
    console.error("Error clearing analytics:", error);
    return NextResponse.json(
      { error: "Error al eliminar las métricas" },
      { status: 500 }
    );
  }
}
