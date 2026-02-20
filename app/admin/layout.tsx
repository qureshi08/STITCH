
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ShellLayoutClient } from '@/components/ShellLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

    if (member?.role !== 'ADMIN') {
        redirect('/client/dashboard');
    }

    return (
        <ShellLayoutClient role="ADMIN">
            {children}
        </ShellLayoutClient>
    );
}
