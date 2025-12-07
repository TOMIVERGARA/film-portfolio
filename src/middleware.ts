import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Middleware disabled - using client-side AuthGuard instead
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
