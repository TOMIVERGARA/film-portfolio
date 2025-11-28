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
