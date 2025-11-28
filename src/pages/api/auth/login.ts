import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import type { User } from '@/lib/db';
import { serialize } from 'cookie';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Usuario y contraseña son requeridos'
                });
            }

            // Find user by username
            const users = await sql`
                SELECT * FROM users 
                WHERE username = ${username} 
                LIMIT 1
            `;

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
            }

            const user = users[0] as User;

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    error: 'Usuario desactivado'
                });
            }

            // Verify password
            const isValidPassword = await verifyPassword(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales inválidas'
                });
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
            const userAgent = req.headers['user-agent'] || null;
            const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
                (req.headers['x-real-ip'] as string) ||
                null;

            await sql`
                INSERT INTO user_sessions (user_id, token_jti, expires_at, ip_address, user_agent)
                VALUES (${user.id}, ${jti}, ${expiresAt.toISOString()}, ${ipAddress}, ${userAgent})
            `;

            // Set cookie using Set-Cookie header
            const cookie = serialize('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            res.setHeader('Set-Cookie', cookie);

            return res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                error: 'Error en el servidor'
            });
        }
    } else if (req.method === 'DELETE') {
        try {
            // Clear cookie
            const cookie = serialize('auth-token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0,
                path: '/',
            });

            res.setHeader('Set-Cookie', cookie);

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al cerrar sesión'
            });
        }
    } else {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} Not Allowed`
        });
    }
}
