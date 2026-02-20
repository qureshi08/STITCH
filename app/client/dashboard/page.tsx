
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats, getCollections } from '@/lib/api';
import { ClientDashboardContent } from '@/components/ClientDashboardContent';
import { redirect } from 'next/navigation';

export default async function ClientDashboard() {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) redirect('/login');

    const { data: member } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

    if (member?.role !== 'CLIENT') {
        redirect('/admin/dashboard');
    }

    const [stats, collections] = await Promise.all([
        getDashboardStats(member.organization_id, 'CLIENT', authUser.id, supabase),
        getCollections(member.organization_id, 'CLIENT', authUser.id, supabase)
    ]);

    return (
        <ClientDashboardContent
            stats={stats}
            collections={collections}
        />
    );
}
