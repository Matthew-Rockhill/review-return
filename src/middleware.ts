// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // If user is not signed in and the current path is not / or /auth/*, redirect to /auth/signin
  if (!request.cookies.get('session') && !request.nextUrl.pathname.startsWith('/auth') && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If user is signed in and the current path is / or /auth/*, redirect based on role
  if (request.cookies.get('session')) {
    const userId = request.cookies.get('userId')?.value;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/auth')) {
        if (user?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};