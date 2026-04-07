import { type NextRequest, NextResponse } from 'next/server'

// Middleware simplificat - fara redirect automat
// Lasam loginul sa faca redirectul manual
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}