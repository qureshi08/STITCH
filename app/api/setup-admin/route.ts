import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Called transparently on first admin login if no organization_members row exists.
 * Creates the admin's DB row so role is persisted permanently — no more env var needed after this runs once.
 */
export async function POST(req: NextRequest) {
    const { user_id, email, name, organization_id } = await req.json();

    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_KEY) {
        // Silently skip — env var fallback in auth.tsx will handle the session
        return NextResponse.json({ skipped: true, reason: 'No service role key configured' });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        SERVICE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await supabaseAdmin.from('organization_members').upsert({
        user_id,
        organization_id,
        role: 'ADMIN',
        name: name || email,
        email,
    }, { onConflict: 'user_id' });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
