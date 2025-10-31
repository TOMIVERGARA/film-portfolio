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
        const rollId = body.rollId;
        const metadata = body.metadata || {};

        if (!rollId) {
            return NextResponse.json({ error: 'rollId is required' }, { status: 400 });
        }

        const folderPath = `/portfolio/${rollId}`;

        const manifestBuffer = Buffer.from(JSON.stringify(metadata));
        const manifestBase64 = manifestBuffer.toString('base64');
        const manifestDataURI = `data:application/json;base64,${manifestBase64}`;

        const result = await cloudinary.uploader.upload(manifestDataURI, {
            folder: folderPath,
            asset_folder: folderPath,
            public_id: 'manifest',
            resource_type: 'raw',
            format: 'json',
            overwrite: true,
        });

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Error updating manifest:', error);
        return NextResponse.json({ error: 'Error updating manifest', details: error.message }, { status: 500 });
    }
}
