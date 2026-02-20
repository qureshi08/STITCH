
"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Loader2, Users, Mail, Shield, Plus, X, CheckCircle2, AlertCircle, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminClientsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: '', name: '' });
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') router.push('/');
    }, [user, router]);

    async function loadClients() {
        if (!user?.organization_id || user.role !== 'ADMIN') return;
        setIsLoading(true);
        const { data } = await supabase
            .from('organization_members')
            .select('*')
            .eq('organization_id', user.organization_id)
            .eq('role', 'CLIENT')
            .order('created_at', { ascending: false });
        setClients(data || []);
        setIsLoading(false);
    }

    useEffect(() => {
        if (user) loadClients();
    }, [user?.organization_id]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteForm.email || !user?.organization_id) return;
        setIsSending(true);
        setFeedback(null);

        try {
            const res = await fetch('/api/invite-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: inviteForm.email.trim().toLowerCase(),
                    name: inviteForm.name.trim(),
                    organization_id: user.organization_id,
                }),
            });
            const data = await res.json();

            if (!res.ok || data.error) {
                setFeedback({ type: 'error', message: data.error || 'Invitation failed.' });
            } else {
                setFeedback({ type: 'success', message: data.message || 'Invitation sent!' });
                setInviteForm({ email: '', name: '' });
                setShowInviteForm(false);
                setTimeout(() => setFeedback(null), 6000);
                loadClients();
            }
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.message || 'Network error.' });
        } finally {
            setIsSending(false);
        }
    };

    const handleRemove = async (userId: string, name: string) => {
        if (!confirm(`Remove ${name} from the portal? They will lose access immediately.`)) return;
        await supabase.from('organization_members').delete().eq('user_id', userId);
        loadClients();
    };

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-ms-gray" /></div>;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Client Roster</h1>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-3">
                        {clients.length} client portal{clients.length !== 1 ? 's' : ''} active
                    </p>
                </div>
                <button
                    onClick={() => { setShowInviteForm(!showInviteForm); setFeedback(null); }}
                    className="ms-button-primary bg-ms-black py-3 px-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                    {showInviteForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showInviteForm ? 'Cancel' : 'Invite Client'}
                </button>
            </div>

            {/* Feedback Banner */}
            {feedback && (
                <div className={cn(
                    "p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-2 duration-300",
                    feedback.type === 'success' ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                )}>
                    {feedback.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    }
                    <div>
                        <p className={cn("font-bold text-sm", feedback.type === 'success' ? "text-green-900" : "text-red-900")}>
                            {feedback.type === 'success' ? 'Invitation Sent' : 'Something went wrong'}
                        </p>
                        <p className={cn("text-[11px] mt-1", feedback.type === 'success' ? "text-green-700" : "text-red-700")}>
                            {feedback.message}
                        </p>
                        {feedback.type === 'error' && feedback.message.includes('SUPABASE_SERVICE_ROLE_KEY') && (
                            <p className="text-[11px] text-red-600 mt-2 font-bold">
                                → Go to Supabase Dashboard → Settings → API → Copy the <code>service_role</code> secret key → Add it as <code>SUPABASE_SERVICE_ROLE_KEY</code> in your Vercel environment variables (or .env.local for local dev).
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Invite Form */}
            {showInviteForm && (
                <div className="ms-card p-10 border-ms-black animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-ms-black mb-6 flex items-center gap-2">
                        <Send className="w-4 h-4" /> Send Client Invitation
                    </h3>
                    <p className="text-sm text-ms-gray mb-8 leading-relaxed">
                        Fill in the client's details below. They will receive an email with a secure link to set their password and access their portal.
                    </p>
                    <form onSubmit={handleInvite} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray block">Client Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Jaweria Khan"
                                    value={inviteForm.name}
                                    onChange={e => setInviteForm({ ...inviteForm, name: e.target.value })}
                                    className="w-full bg-ms-beige/20 border border-ms-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ms-black"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-ms-gray block">Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="client@example.com"
                                    value={inviteForm.email}
                                    onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
                                    className="w-full bg-ms-beige/20 border border-ms-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ms-black"
                                />
                            </div>
                        </div>
                        <div className="bg-ms-beige/30 rounded-xl p-5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mb-2">What happens next?</p>
                            <ol className="text-xs text-ms-gray space-y-1 list-decimal list-inside leading-relaxed">
                                <li>Client receives an invitation email from STITCH.</li>
                                <li>They click the link to set their own password.</li>
                                <li>They log in and immediately see their personal client portal.</li>
                                <li>You can then assign collections to them from the Collections page.</li>
                            </ol>
                        </div>
                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full bg-ms-black text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-ms-black/80 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Invitation...</> : <><Send className="w-4 h-4" /> Send Invitation</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Client List */}
            {clients.length === 0 && !showInviteForm ? (
                <div className="ms-card p-32 text-center border-dashed border-2 bg-ms-beige/5">
                    <Users className="w-14 h-14 text-ms-gray/20 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold font-serif italic">No Clients Yet</h3>
                    <p className="text-sm text-ms-gray mt-3 max-w-sm mx-auto">
                        Click "Invite Client" above to onboard your first client. They'll receive a secure email invitation.
                    </p>
                </div>
            ) : clients.length > 0 && (
                <div className="ms-card overflow-hidden">
                    <div className="p-5 border-b border-ms-border bg-ms-beige/10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black">Active Client Accounts</h3>
                    </div>
                    <div className="divide-y divide-ms-border">
                        {clients.map((c) => (
                            <div key={c.user_id} className="p-6 flex items-center justify-between hover:bg-ms-beige/10 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-ms-black text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                                        {(c.name || c.email || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-ms-black">{c.name || 'Unnamed Client'}</p>
                                        <p className="text-[10px] text-ms-gray font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                            <Mail className="w-3 h-3" /> {c.email || c.user_id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-blue-100 flex items-center gap-1.5">
                                        <Shield className="w-3 h-3" /> Client Portal
                                    </span>
                                    <button
                                        onClick={() => handleRemove(c.user_id, c.name || c.email)}
                                        className="p-2 text-ms-gray hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove client access"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
