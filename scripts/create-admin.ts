#!/usr/bin/env node

/**
 * Script to create the first admin user
 * Run: npm run init-admin
 */

import { sql } from '../src/lib/db.js';
import { hashPassword } from '../src/lib/auth.js';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function createAdminUser() {
    console.log('\n🔧 Creación de usuario administrador\n');

    try {
        // Check if any users exist
        const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
        const userCount = parseInt(existingUsers[0].count as string);

        if (userCount > 0) {
            console.log('⚠️  Ya existen usuarios en la base de datos.');
            const proceed = await question('¿Deseas crear otro usuario? (s/n): ');
            if (proceed.toLowerCase() !== 's') {
                console.log('Operación cancelada.');
                rl.close();
                process.exit(0);
            }
        }

        // Gather user information
        const username = await question('Nombre de usuario: ');
        const email = await question('Email: ');
        const password = await question('Contraseña: ');
        const fullName = await question('Nombre completo (opcional): ');

        if (!username || !email || !password) {
            console.error('❌ Usuario, email y contraseña son requeridos');
            rl.close();
            process.exit(1);
        }

        // Validate password strength
        if (password.length < 8) {
            console.error('❌ La contraseña debe tener al menos 8 caracteres');
            rl.close();
            process.exit(1);
        }

        // Hash password
        console.log('\n🔐 Encriptando contraseña...');
        const passwordHash = await hashPassword(password);

        // Create user
        console.log('👤 Creando usuario...');
        const newUsers = await sql`
      INSERT INTO users (username, email, password_hash, full_name, role, is_active)
      VALUES (${username}, ${email}, ${passwordHash}, ${fullName || null}, 'admin', true)
      RETURNING id, username, email, full_name, role, created_at
    `;

        const newUser = newUsers[0];

        console.log('\n✅ Usuario creado exitosamente!\n');
        console.log('Detalles del usuario:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`ID:       ${newUser.id}`);
        console.log(`Usuario:  ${newUser.username}`);
        console.log(`Email:    ${newUser.email}`);
        console.log(`Nombre:   ${newUser.full_name || 'N/A'}`);
        console.log(`Rol:      ${newUser.role}`);
        console.log(`Creado:   ${newUser.created_at}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error: any) {
        console.error('\n❌ Error al crear usuario:', error.message);

        if (error.message.includes('unique')) {
            console.error('\nEl usuario o email ya existe en la base de datos.');
        }

        process.exit(1);
    } finally {
        rl.close();
    }
}

createAdminUser();
