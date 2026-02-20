import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, name, organization_id } = body;

    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_KEY) {
        return NextResponse.json(
            { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Go to Supabase → Settings → API → service_role key.' },
            { status: 500 }
        );
    }

    if (!email || !organization_id) {
        return NextResponse.json({ error: 'Email and organization_id are required.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        SERVICE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Step 1: Invite the user — Supabase sends them a magic link email
    const { data: invite, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { name: name || email },
    });

    if (inviteError) {
        // If user already exists in Auth, look them up
        if (!inviteError.message.includes('already been registered')) {
            return NextResponse.json({ error: inviteError.message }, { status: 400 });
        }
        // User exists — find them and just upsert their org record
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.users?.find(u => u.email === email);
        if (!existing) return NextResponse.json({ error: 'User exists in Auth but could not be found.' }, { status: 400 });

        const { error: memberErr } = await supabaseAdmin.from('organization_members').upsert({
            user_id: existing.id,
            organization_id,
            role: 'CLIENT',
            name: name || email,
            email,
        }, { onConflict: 'user_id' });

        if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 400 });
        return NextResponse.json({ success: true, message: `${email} added as Client (already had an account).` });
    }

    // Step 2: Register them in organization_members as CLIENT
    const { error: memberError } = await supabaseAdmin.from('organization_members').upsert({
        user_id: invite.user.id,
        organization_id,
        role: 'CLIENT',
        name: name || email,
        email,
    }, { onConflict: 'user_id' });

    if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        message: `Invitation email sent to ${email}. They will receive a link to set their password.`
    });
}
