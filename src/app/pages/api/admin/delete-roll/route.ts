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
        const { rollId } = body;

        if (!rollId) {
            return NextResponse.json({ error: 'rollId es requerido' }, { status: 400 });
        }

        const folderPath = `portfolio/${rollId}`;

        // Delete the entire folder and all its contents
        try {
            let deletedImagesCount = 0;
            let deletedRawCount = 0;

            // Step 1: Delete all image resources
            try {
                const imageResources = await cloudinary.api.resources_by_asset_folder(folderPath, {
                    type: 'upload',
                    resource_type: 'image',
                    max_results: 500,
                });

                if (imageResources.resources && imageResources.resources.length > 0) {
                    const imagePublicIds = imageResources.resources.map((r: any) => r.public_id);
                    console.log('Deleting images:', imagePublicIds);

                    await cloudinary.api.delete_resources(imagePublicIds, {
                        type: 'upload',
                        resource_type: 'image',
                        invalidate: true,
                    });

                    deletedImagesCount = imagePublicIds.length;
                }
            } catch (imgErr: any) {
                console.log('No images to delete or error:', imgErr.message);
            }

            // Step 2: Delete all raw resources (manifest)
            try {
                const rawResources = await cloudinary.api.resources_by_asset_folder(folderPath, {
                    type: 'upload',
                    resource_type: 'raw',
                    max_results: 50,
                });

                if (rawResources.resources && rawResources.resources.length > 0) {
                    const rawPublicIds = rawResources.resources.map((r: any) => r.public_id);
                    console.log('Deleting raw resources:', rawPublicIds);

                    await cloudinary.api.delete_resources(rawPublicIds, {
                        type: 'upload',
                        resource_type: 'raw',
                    });

                    deletedRawCount = rawPublicIds.length;
                }
            } catch (rawErr: any) {
                console.log('No raw resources to delete or error:', rawErr.message);
            }

            // Step 3: Delete the folder itself (should be empty now)
            try {
                await cloudinary.api.delete_folder(folderPath);
                console.log('Folder deleted successfully:', folderPath);
            } catch (folderErr: any) {
                // If folder still not empty, try to get remaining resources
                console.error('Error deleting folder, checking for remaining resources:', folderErr);

                // Try to list any remaining resources
                try {
                    const remaining = await cloudinary.api.resources_by_asset_folder(folderPath, {
                        max_results: 100,
                    });
                    console.log('Remaining resources:', remaining.resources?.length || 0);

                    // If there are remaining resources, delete them
                    if (remaining.resources && remaining.resources.length > 0) {
                        const remainingIds = remaining.resources.map((r: any) => r.public_id);
                        await cloudinary.api.delete_resources(remainingIds, {
                            invalidate: true,
                        });
                        // Try deleting folder again
                        await cloudinary.api.delete_folder(folderPath);
                    }
                } catch (cleanupErr) {
                    console.error('Cleanup error:', cleanupErr);
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Roll eliminado completamente',
                deletedImages: deletedImagesCount,
                deletedRaw: deletedRawCount,
            });
        } catch (err: any) {
            console.error('Error deleting roll folder:', err);
            return NextResponse.json({
                error: 'Error al eliminar el roll',
                details: err.message || 'Unknown error',
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            error: 'Error al procesar la solicitud',
            details: error.message,
        }, { status: 500 });
    }
}
