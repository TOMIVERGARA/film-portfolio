import { SimulationNodeDatum } from "d3-force";

export interface Roll {
    id: string;
    metadata: {
        name?: string;
        date?: string;
        filmstock?: string;
    };
    photos: {
        url: string;
        width: number;
        photo_metadata: { public_id?: string; notes?: string };
    }[];
}

export interface GraphNode extends SimulationNodeDatum {
    id: string;
    imageUrl?: string; // Hacerlo opcional para nodos de etiqueta
    width: number;
    height: number;
    rolloId: string;
    note?: string;
    rolloCenter: { x: number; y: number };
    x?: number;
    y?: number;
    isLabel?: boolean; // Nuevo campo para identificar nodos de etiqueta
    isCentral?: boolean; // Nuevo campo para identificar nodo central
    metadata?: {
        // Nuevo campo para almacenar metadata
        name?: string;
        date?: string;
        filmstock?: string;
    };
}