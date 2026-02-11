import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { User } from '@/types/user';

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get('currentUser')?.value;
    if (currentUser) {
        const currentUserData: User = JSON.parse(currentUser);
        // console.log("🚀 ~ middleware ~ currentUser:", currentUserData?.permission);
    }

    // console.log('request.nextUrl.pathname', request.nextUrl.pathname);
    // if (currentUser && !request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    //     return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    // }

    // if (!currentUser && !request.nextUrl.pathname.startsWith('/login')) {
    //     return Response.redirect(new URL('/login', request.url));
    // }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\.png$).*)'],
};
