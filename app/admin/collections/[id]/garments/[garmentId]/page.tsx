
import { createClient } from '@/lib/supabase/server';
import { getGarmentDetail, getCollectionDetail } from '@/lib/api';
import { GarmentDetailClient } from '@/components/GarmentDetailClient';
import { redirect } from 'next/navigation';

export default async function GarmentDetailPage({
    params
}: {
    params: Promise<{ id: string, garmentId: string }>
}) {
    const { id, garmentId } = await params;
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

    const [garment, collection] = await Promise.all([
        getGarmentDetail(garmentId, supabase),
        getCollectionDetail(id, supabase)
    ]);

    if (!garment) {
        return <div className="p-20 text-center font-serif italic">Garment not found.</div>;
    }

    const user = {
        id: authUser.id,
        email: authUser.email || '',
        name: member.name || authUser.user_metadata?.name || 'User',
        role: 'ADMIN' as const,
        organization_id: member.organization_id
    };

    return (
        <GarmentDetailClient
            id={id}
            garmentId={garmentId}
            initialGarment={garment}
            initialCollection={collection}
            user={user}
        />
    );
}
