import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, revokeSession } from '@/lib/auth';

/**
 * POST /pages/api/admin/logout
 * Revoke the current session
 */
export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(req);

        if (authResult.isValid && authResult.user) {
            // Revoke the session from database
            const revoked = await revokeSession(authResult.user.jti);

            if (revoked) {
                return NextResponse.json({
                    success: true,
                    message: 'Sesión cerrada correctamente'
                }, { status: 200 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Sesión cerrada'
        }, { status: 200 });

    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json(
            { success: false, error: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
}
