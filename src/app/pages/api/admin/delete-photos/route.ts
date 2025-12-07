import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { public_ids } = body;

        if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
            return NextResponse.json({ error: 'Faltan public_ids' }, { status: 400 });
        }

        // Delete all photos
        const deletePromises = public_ids.map(async (public_id: string) => {
            try {
                const result = await cloudinary.uploader.destroy(public_id, {
                    resource_type: 'image',
                    invalidate: true,
                });
                return { public_id, success: result.result === 'ok', result };
            } catch (err: any) {
                console.error(`Error deleting ${public_id}:`, err);
                return { public_id, success: false, error: err.message };
            }
        });

        const results = await Promise.all(deletePromises);
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.length - successCount;

        return NextResponse.json({
            success: true,
            deleted: successCount,
            failed: failedCount,
            details: results,
        });
    } catch (error: any) {
        console.error('Error deleting photos from Cloudinary:', error);
        return NextResponse.json({ error: 'Error al eliminar fotos', details: error.message }, { status: 500 });
    }
}
