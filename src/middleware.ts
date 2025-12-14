import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';

    // If trying to access admin routes without token
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If trying to access login page with token
    if (isLoginPage) {
        if (token) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
