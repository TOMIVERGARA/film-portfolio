import { NextRequest, NextResponse } from 'next/server';
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const publicId = body.public_id || body.publicId;
        const notes = body.notes || '';

        if (!publicId) {
            return NextResponse.json({ error: 'public_id is required' }, { status: 400 });
        }

        // Use explicit to update metadata/context for an existing uploaded resource
        const result = await cloudinary.uploader.explicit(publicId, {
            type: 'upload',
            metadata: notes ? { notes } : {},
            context: notes ? { notes } : {},
        });

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Error updating metadata:', error);
        return NextResponse.json({ error: 'Error updating metadata', details: error.message }, { status: 500 });
    }
}
