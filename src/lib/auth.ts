import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { SafeUser } from './db';

// Environment variables validation
const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}

// JWT Token payload interface
export interface JWTPayload {
    userId: string;
    username: string;
    email: string;
    role: string;
    jti: string; // JWT ID for session tracking
    iat?: number;
    exp?: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: SafeUser): { token: string; jti: string } {
    const jti = randomUUID();

    const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        jti,
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return { token, jti };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una minúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): {
    valid: boolean;
    error?: string;
} {
    if (username.length < 3) {
        return { valid: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    if (username.length > 50) {
        return { valid: false, error: 'El nombre de usuario no puede tener más de 50 caracteres' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { valid: false, error: 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos' };
    }

    return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): {
    valid: boolean;
    error?: string;
} {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { valid: false, error: 'El formato del email no es válido' };
    }

    return { valid: true };
}

/**
 * Verify authentication from request (for API routes)
 * This function:
 * 1. Extracts and validates the JWT token
 * 2. Verifies the session exists and is active in the database
 * 3. Checks that the session hasn't expired
 */
export async function verifyAuth(request: Request): Promise<{
    isValid: boolean;
    user?: JWTPayload;
    error?: string;
}> {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return { isValid: false, error: 'No token provided' };
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return { isValid: false, error: 'Invalid or expired token' };
        }

        // Verify session exists and is active in database
        const { sql } = await import('./db');
        const sessions = await sql`
            SELECT 
                us.id,
                us.expires_at,
                u.is_active as user_is_active
            FROM user_sessions us
            JOIN users u ON u.id = us.user_id
            WHERE us.token_jti = ${decoded.jti}
            AND us.user_id = ${decoded.userId}
            LIMIT 1
        `;

        if (sessions.length === 0) {
            return { isValid: false, error: 'Session not found' };
        }

        const session = sessions[0];

        // Check if session has expired
        const now = new Date();
        const expiresAt = new Date(session.expires_at);
        if (now > expiresAt) {
            return { isValid: false, error: 'Session expired' };
        }

        // Check if user account is still active
        if (!session.user_is_active) {
            return { isValid: false, error: 'User account is inactive' };
        }

        return { isValid: true, user: decoded };
    } catch (error) {
        console.error('Authentication verification failed:', error);
        return { isValid: false, error: 'Authentication failed' };
    }
}

/**
 * Revoke a session (for logout)
 */
export async function revokeSession(jti: string): Promise<boolean> {
    try {
        const { sql } = await import('./db');
        await sql`
            DELETE FROM user_sessions
            WHERE token_jti = ${jti}
        `;
        return true;
    } catch (error) {
        console.error('Failed to revoke session:', error);
        return false;
    }
}

/**
 * Clean up expired sessions
 */
export async function cleanExpiredSessions(): Promise<number> {
    try {
        const { sql } = await import('./db');
        const result = await sql`
            DELETE FROM user_sessions
            WHERE expires_at < NOW()
            RETURNING id
        `;
        return result.length;
    } catch (error) {
        console.error('Failed to clean expired sessions:', error);
        return 0;
    }
}

