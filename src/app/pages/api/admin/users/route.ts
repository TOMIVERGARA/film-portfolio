import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, validateUsername, validateEmail, validatePassword, verifyAuth } from '@/lib/auth';
import type { User } from '@/lib/db';

// GET /pages/api/admin/users - Get all users
export async function GET(req: NextRequest) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const users = await sql`
            SELECT id, username, email, full_name, is_active, role, created_at, updated_at, last_login
            FROM users
            ORDER BY created_at DESC
        `;

        return NextResponse.json({ success: true, users }, { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}

// POST /pages/api/admin/users - Create new user
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
        const { username, email, password, full_name, role = 'admin' } = await req.json();

        // Validate required fields
        if (!username || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Usuario, email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Validate username
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.valid) {
            return NextResponse.json(
                { success: false, error: usernameValidation.error },
                { status: 400 }
            );
        }

        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            return NextResponse.json(
                { success: false, error: emailValidation.error },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { success: false, errors: passwordValidation.errors },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await sql`
            SELECT id FROM users WHERE username = ${username} LIMIT 1
        `;

        if (existingUsername.length > 0) {
            return NextResponse.json(
                { success: false, error: 'El nombre de usuario ya existe' },
                { status: 409 }
            );
        }

        // Check if email already exists
        const existingEmail = await sql`
            SELECT id FROM users WHERE email = ${email} LIMIT 1
        `;

        if (existingEmail.length > 0) {
            return NextResponse.json(
                { success: false, error: 'El email ya está registrado' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const newUsers = await sql`
            INSERT INTO users (username, email, password_hash, full_name, role)
            VALUES (${username}, ${email}, ${passwordHash}, ${full_name || null}, ${role})
            RETURNING id, username, email, full_name, is_active, role, created_at, updated_at
        `;

        return NextResponse.json(
            { success: true, user: newUsers[0] },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, error: 'Error al crear usuario' },
            { status: 500 }
        );
    }
}
