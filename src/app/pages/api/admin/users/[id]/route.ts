import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword, validatePassword, verifyAuth } from '@/lib/auth';
import type { User } from '@/lib/db';

// GET /pages/api/admin/users/[id] - Get user by ID
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;

        const users = await sql`
            SELECT id, username, email, full_name, is_active, role, created_at, updated_at, last_login
            FROM users
            WHERE id = ${id}
            LIMIT 1
        `;

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user: users[0] }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: 'Error al obtener usuario' },
            { status: 500 }
        );
    }
}

// PATCH /pages/api/admin/users/[id] - Update user
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;
        const { username, email, password, full_name, is_active, role } = await req.json();

        // Check if user exists first
        const existingUsers = await sql`
            SELECT id FROM users WHERE id = ${id} LIMIT 1
        `;

        if (existingUsers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Handle password update separately if provided
        if (password !== undefined && password !== '') {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return NextResponse.json(
                    { success: false, errors: passwordValidation.errors },
                    { status: 400 }
                );
            }

            const passwordHash = await hashPassword(password);
            await sql`
                UPDATE users 
                SET password_hash = ${passwordHash}, updated_at = NOW()
                WHERE id = ${id}
            `;
        }

        // Update other fields
        if (username !== undefined || email !== undefined || full_name !== undefined ||
            is_active !== undefined || role !== undefined) {

            // Get current user data
            const currentUser = await sql`
                SELECT username, email, full_name, is_active, role 
                FROM users 
                WHERE id = ${id} 
                LIMIT 1
            `;

            if (currentUser.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'Usuario no encontrado' },
                    { status: 404 }
                );
            }

            const current = currentUser[0] as User;

            // Use current values if not provided
            const newUsername = username !== undefined ? username : current.username;
            const newEmail = email !== undefined ? email : current.email;
            const newFullName = full_name !== undefined ? full_name : current.full_name;
            const newIsActive = is_active !== undefined ? is_active : current.is_active;
            const newRole = role !== undefined ? role : current.role;

            await sql`
                UPDATE users
                SET username = ${newUsername},
                    email = ${newEmail},
                    full_name = ${newFullName},
                    is_active = ${newIsActive},
                    role = ${newRole},
                    updated_at = NOW()
                WHERE id = ${id}
            `;
        }

        // Fetch and return updated user
        const updatedUsers = await sql`
            SELECT id, username, email, full_name, is_active, role, created_at, updated_at, last_login
            FROM users
            WHERE id = ${id}
            LIMIT 1
        `;

        return NextResponse.json(
            { success: true, user: updatedUsers[0] },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Error al actualizar usuario' },
            { status: 500 }
        );
    }
}

// DELETE /pages/api/admin/users/[id] - Delete user
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Verify authentication
    const authResult = await verifyAuth(req);
    if (!authResult.isValid) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { id } = await params;

        // Check if user exists
        const users = await sql`
            SELECT id FROM users WHERE id = ${id} LIMIT 1
        `;

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Delete user (sessions will be deleted automatically due to CASCADE)
        await sql`DELETE FROM users WHERE id = ${id}`;

        return NextResponse.json(
            { success: true, message: 'Usuario eliminado correctamente' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, error: 'Error al eliminar usuario' },
            { status: 500 }
        );
    }
}
