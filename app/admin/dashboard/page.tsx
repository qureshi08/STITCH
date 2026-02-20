
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats, getCollections } from '@/lib/api';
import { AdminDashboardContent } from '@/components/AdminDashboardContent';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) redirect('/login');

    const { data: member } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

    if (member?.role !== 'ADMIN') {
        redirect('/client/dashboard');
    }

    const user = {
        id: authUser.id,
        email: authUser.email || '',
        name: member.name || authUser.user_metadata?.name || 'User',
        role: 'ADMIN' as const,
        organization_id: member.organization_id
    };

    const [stats, collections] = await Promise.all([
        getDashboardStats(user.organization_id, 'ADMIN', user.id, supabase),
        getCollections(user.organization_id, 'ADMIN', user.id, supabase)
    ]);

    const recentCollections = collections.slice(0, 3);

    return (
        <AdminDashboardContent
            user={user}
            stats={stats}
            recentCollections={recentCollections}
        />
    );
}
