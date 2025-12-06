import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
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
        const formData = await req.formData();
        const rollId = formData.get('rollId') as string;
        const rollName = formData.get('rollName') as string;
        const rollDate = formData.get('rollDate') as string;
        const filmstock = formData.get('filmstock') as string;

        const files = formData.getAll('files') as File[];
        const notes = formData.getAll('notes') as string[];

        if (!rollId || !rollName || files.length === 0) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        const folderPath = `/portfolio/${rollId}`;

        // Upload each file using a stream to avoid building huge data URIs in memory
        const uploadPromises = files.map(async (file, index) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new Promise((resolve, reject) => {
                const stream = new Readable();
                stream.push(buffer);
                stream.push(null);

                const options: any = {
                    folder: folderPath,
                    asset_folder: folderPath,
                    resource_type: 'auto',
                };

                if (notes[index]) {
                    options.context = { notes: notes[index] };
                    options.metadata = { notes: notes[index] };
                }

                const uploadStream = cloudinary.uploader.upload_stream(options, (err: any, result: any) => {
                    if (err) return reject(err);
                    resolve(result);
                });

                stream.pipe(uploadStream);
            });
        });

        const uploadResults = await Promise.all(uploadPromises);

        const manifest = {
            name: rollName,
            date: rollDate,
            filmstock: filmstock,
        };

        const manifestBuffer = Buffer.from(JSON.stringify(manifest));
        // Upload manifest as raw json
        await new Promise((resolve, reject) => {
            const stream = new Readable();
            stream.push(manifestBuffer);
            stream.push(null);

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folderPath, asset_folder: folderPath, public_id: 'manifest', resource_type: 'raw', format: 'json' },
                (err: any, res: any) => {
                    if (err) return reject(err);
                    resolve(res);
                }
            );

            stream.pipe(uploadStream);
        });

        return NextResponse.json({ success: true, uploadedImages: uploadResults.length, rollId });
    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json({ error: 'Error al subir archivos', details: error.message }, { status: 500 });
    }
}
