import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    // 1. Update the session (Standard Supabase Auth refresh)
    const response = await updateSession(request)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // 2. Public route check
    const isPublicRoute = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/api/') || pathname.includes('.')

    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
        // Fetch role from database - Deterministic source of truth
        const { data: member } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', user.id)
            .single()

        const role = member?.role

        // 3. Handle Login Redirection
        if (pathname === '/login' || pathname === '/') {
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            if (role === 'CLIENT') return NextResponse.redirect(new URL('/client/dashboard', request.url))
        }

        // 4. Role-based Route Protection
        if (pathname.startsWith('/admin') && role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/client/dashboard', request.url))
        }

        if (pathname.startsWith('/client') && role !== 'CLIENT') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
