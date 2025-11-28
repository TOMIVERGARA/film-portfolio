import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import type { User } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, error: 'Usuario y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Find user by username
        const users = await sql`
            SELECT * FROM users 
            WHERE username = ${username} 
            LIMIT 1
        `;

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        const user = users[0];

        // Check if user is active
        if (!user.is_active) {
            return NextResponse.json(
                { success: false, error: 'Usuario desactivado' },
                { status: 403 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Update last login
        await sql`
            UPDATE users 
            SET last_login = NOW() 
            WHERE id = ${user.id}
        `;

        // Generate JWT token
        const { token, jti } = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            is_active: user.is_active,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_login: user.last_login,
        });

        // Calculate token expiration (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Store session in database
        const userAgent = req.headers.get('user-agent') || null;
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            null;

        await sql`
            INSERT INTO user_sessions (user_id, token_jti, expires_at, ip_address, user_agent)
            VALUES (${user.id}, ${jti}, ${expiresAt.toISOString()}, ${ipAddress}, ${userAgent})
        `;

        // Create response with JWT token
        const response = NextResponse.json({
            success: true,
            token: token, // Send token in response body
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
            }
        }, { status: 200 });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Error en el servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Client will remove token from localStorage
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, error: 'Error al cerrar sesión' },
            { status: 500 }
        );
    }
}
