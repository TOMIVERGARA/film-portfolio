import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon serverless SQL client
export const sql = neon(process.env.DATABASE_URL);

// Types for database models
export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    full_name: string | null;
    is_active: boolean;
    role: string;
    created_at: Date;
    updated_at: Date;
    last_login: Date | null;
}

export interface UserSession {
    id: string;
    user_id: string;
    token_jti: string;
    expires_at: Date;
    created_at: Date;
    ip_address: string | null;
    user_agent: string | null;
}

// Omit sensitive fields when returning user data
export type SafeUser = Omit<User, 'password_hash'>;
