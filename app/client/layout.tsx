
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShellLayoutClient } from '@/components/ShellLayoutClient';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    // Server-side check for hard protection
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (member?.role !== 'CLIENT') {
        redirect('/admin/dashboard');
    }

    return (
        <ShellLayoutClient role="CLIENT">
            {children}
        </ShellLayoutClient>
    );
}
