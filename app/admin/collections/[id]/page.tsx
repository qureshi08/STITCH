
import { createClient } from '@/lib/supabase/server';
import { getCollectionDetail, getCollectionGarments } from '@/lib/api';
import { CollectionDetailClient } from '@/components/CollectionDetailClient';
import { redirect, notFound } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminCollectionDetailPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params;
    const { tab } = await searchParams;
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

    const [collection, garments] = await Promise.all([
        getCollectionDetail(id, supabase),
        getCollectionGarments(id, supabase)
    ]);

    if (!collection) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-ms-gray/20 mb-4" />
                <h2 className="text-xl font-bold font-serif">Collection Not Found</h2>
                <Link href="/admin/collections" className="text-ms-black underline mt-4 text-sm font-bold uppercase tracking-widest">Back to Collections</Link>
            </div>
        );
    }

    const user = {
        id: authUser.id,
        email: authUser.email || '',
        name: member.name || authUser.user_metadata?.name || 'User',
        role: 'ADMIN' as const,
        organization_id: member.organization_id
    };

    return (
        <CollectionDetailClient
            id={id}
            initialCollection={collection}
            initialGarments={garments}
            user={user}
            initialTab={tab}
        />
    );
}

