import { useState, useEffect } from 'react';

export interface ImageLoadInfo {
    image: HTMLImageElement | null;
    loadTime: number | null;
}

function useImage(url: string, onLoad?: (loadTime: number) => void): HTMLImageElement | null {
    const [image, setImage] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const startTime = performance.now();
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
            const loadTime = performance.now() - startTime;
            setImage(img);
            if (onLoad) {
                onLoad(loadTime);
            }
        };
    }, [url, onLoad]);

    return image;
}

export default useImage;