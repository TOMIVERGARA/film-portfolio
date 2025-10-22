import { NextRequest, NextResponse } from 'next/server';
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const rollId = formData.get('rollId') as string;
        const rollName = formData.get('rollName') as string;
        const rollDate = formData.get('rollDate') as string;
        const filmstock = formData.get('filmstock') as string;
        
        const files = formData.getAll('files') as File[];
        const notes = formData.getAll('notes') as string[];

        if (!rollId || !rollName || files.length === 0) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        const folderPath = `/portfolio/${rollId}`;

        const uploadPromises = files.map(async (file, index) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            const dataURI = `data:${file.type};base64,${base64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: folderPath,
                asset_folder: folderPath,
                context: notes[index] ? { notes: notes[index] } : {},
                metadata: notes[index] ? { notes: notes[index] } : {},
            });

            return result;
        });

        const uploadResults = await Promise.all(uploadPromises);

        const manifest = {
            name: rollName,
            date: rollDate,
            filmstock: filmstock,
        };

        const manifestBuffer = Buffer.from(JSON.stringify(manifest));
        const manifestBase64 = manifestBuffer.toString('base64');
        const manifestDataURI = `data:application/json;base64,${manifestBase64}`;

        await cloudinary.uploader.upload(manifestDataURI, {
            folder: folderPath,
            asset_folder: folderPath,
            public_id: 'manifest',
            resource_type: 'raw',
            format: 'json',
        });

        return NextResponse.json({
            success: true,
            uploadedImages: uploadResults.length,
            rollId,
        });
    } catch (error: any) {
        console.error('Error uploading to Cloudinary:', error);
        return NextResponse.json(
            { error: 'Error al subir archivos', details: error.message },
            { status: 500 }
        );
    }
}
