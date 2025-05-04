// pages/api/photos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type Photo = {
    url: string;
    width: number;
    photo_metadata: { public_id?: string, notes?: string };
};

type Roll = {
    id: string;
    metadata: {
        name?: string;
        date?: string;
        filmstock?: string;
    };
    photos: Photo[];
};

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        // 1) Listar carpetas en la raíz
        const folderList = await cloudinary.api.sub_folders('/portfolio/', { max_results: 100 });

        // Procesar todos los folders y luego filtrar
        const allRolls = await Promise.all(
            folderList.folders.map(async (folder: { path: any; name: any; }) => {
                // 2) Cargar manifest.json (raw resource)
                let rollMetadata = null;

                try {
                    const rawList = await cloudinary.api.resources_by_asset_folder(folder.path, {
                        type: 'upload',
                        max_results: 50,
                        resource_type: 'raw',
                    });

                    const manifestResource = rawList.resources.find((r: { public_id: string }) =>
                        r.public_id.toLowerCase().includes('manifest')
                    );

                    if (manifestResource) {
                        const resp = await fetch(manifestResource.secure_url);
                        const metadata = await resp.json();

                        // Verificar que el metadata no esté vacío
                        if (metadata && Object.keys(metadata).length > 0) {
                            rollMetadata = metadata;
                        }
                    }
                } catch (err) {
                    console.warn('No se encontró manifest raw en:', folder.path, err);
                    return null; // Retornar null si no hay manifest o está vacío
                }

                // Si no hay metadata válido, descartar el roll
                if (!rollMetadata) {
                    return null;
                }

                // 3) Listar imágenes de ese folder
                let photos: Photo[] = [];
                try {
                    console.log('Cargando fotos para:', folder.path, typeof folder.path);
                    const resources = await cloudinary.api.resources_by_asset_folder(folder.path, {
                        media_metadata: true,
                        image_metadata: true,
                    });
                    console.log('Recuperadas fotos:', resources.resources.length);
                    console.log('Recuperadas fotos:', resources.resources);


                } catch (err) {
                    console.warn('Error al cargar fotos para:', folder.path, err);
                    return null;
                }

                // Si no hay fotos, descartar el roll
                if (photos.length === 0) {
                    return null;
                }

                return {
                    id: folder.name,
                    metadata: rollMetadata as any,
                    photos
                };
            })
        );

        // Filtrar los rolls que son null (no cumplen las condiciones)
        const rolls = allRolls.filter(roll => roll !== null) as Roll[];

        return new Response(JSON.stringify(rolls), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: 'Error fetching data from Cloudinary.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}