// pages/api/photos.ts
import type { NextApiRequest, NextApiResponse } from 'next';
const cloudinary = require('cloudinary').v2;

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


                    const resources = await cloudinary.api.resources_by_asset_folder(folder.path, {
                        media_metadata: true,
                        image_metadata: true,
                    });

                    photos = resources.resources
                        .filter((r: { resource_type: string; secure_url: any; }) => r.resource_type === 'image' && typeof r.secure_url === 'string')
                        .map((r: { secure_url: any; public_id: any; metadata: { notes: any; }; }) => {
                            // URL original
                            const original = r.secure_url!;
                            // Partimos en dos por "/upload/"
                            const [prefix, suffix] = original.split('/upload/');
                            // Construimos la transformación que quieras
                            const transform = 'w_1000,c_scale,q_auto,f_auto';
                            // Volvemos a unir
                            const urlOptimizada = `${prefix}/upload/${transform}/${suffix}`;

                            return {
                                url: urlOptimizada,
                                width: 200,
                                photo_metadata: {
                                    public_id: r.public_id,
                                    notes: r.metadata?.notes,
                                }
                            };
                        });

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