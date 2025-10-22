import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'portfolio2025';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json(
                { success: false, error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error en el servidor' },
            { status: 500 }
        );
    }
}
