"use client"

import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageCircle } from 'lucide-react';
import { getComments, createComment, createNotification } from '@/lib/api';
import { Comment } from '@/types';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface CommentThreadProps {
    entityType: string;
    entityId: string;
    collectionId?: string;
}

export function CommentThread({ entityType, entityId, collectionId }: CommentThreadProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const load = async () => {
        const data = await getComments(entityType, entityId);
        setComments(data);
        setIsLoading(false);
    };

    useEffect(() => { load(); }, [entityId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;
        setIsSending(true);

        await createComment({
            entity_type: entityType,
            entity_id: entityId,
            organization_id: user.organization_id,
            author_name: user.name,
            author_role: user.role,
            content: text.trim(),
        });

        // Trigger notifications
        try {
            const targetCollectionId = collectionId || (entityType === 'collection' ? entityId : null);

            if (user.role === 'CLIENT') {
                // Notify all admins in the org
                const { data: admins } = await supabase
                    .from('organization_members')
                    .select('user_id')
                    .eq('organization_id', user.organization_id)
                    .eq('role', 'ADMIN');

                if (admins) {
                    for (const admin of admins) {
                        await createNotification({
                            organization_id: user.organization_id,
                            user_id: admin.user_id,
                            title: 'New Client Comment',
                            content: `${user.name} commented on a ${entityType.replace('garment_', '').replace('_', ' ')}.`,
                            type: 'INFO',
                            link: entityType === 'collection'
                                ? `/collections/${entityId}?tab=comments`
                                : `/collections/${targetCollectionId || 'unknown'}/garments/${entityId}?tab=workflow`
                        });
                    }
                }
            } else if (targetCollectionId) {
                // Notify assigned clients
                const { data: clients } = await supabase
                    .from('collection_assignments')
                    .select('user_id')
                    .eq('collection_id', targetCollectionId);

                if (clients) {
                    for (const client of clients) {
                        await createNotification({
                            organization_id: user.organization_id,
                            user_id: client.user_id,
                            title: 'New Message from Maryam',
                            content: `New update in ${entityType.replace('garment_', '').replace('_', ' ')} discussion.`,
                            type: 'INFO',
                            link: entityType === 'collection'
                                ? `/collections/${entityId}?tab=comments`
                                : `/collections/${targetCollectionId}/garments/${entityId}?tab=workflow`
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Silent fail on notification:', e);
        }

        setText('');
        await load();
        setIsSending(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="ms-card p-8 space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black border-b border-ms-border pb-4">
                    Comments & Notes
                </h3>

                {isLoading ? (
                    <div className="py-8 flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-ms-gray" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="py-12 text-center">
                        <MessageCircle className="w-10 h-10 text-ms-gray/20 mx-auto mb-3" />
                        <p className="text-sm font-bold text-ms-black">No comments yet</p>
                        <p className="text-xs text-ms-gray mt-1">Start a thread below.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {comments.map(c => (
                            <div key={c.id} className={`flex gap-4 ${c.author_role === 'ADMIN' ? '' : 'flex-row-reverse'}`}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${c.author_role === 'ADMIN' ? 'bg-ms-black text-white' : 'bg-ms-beige text-ms-black border border-ms-border'
                                    }`}>
                                    {c.author_name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                </div>
                                <div className={`flex-1 max-w-sm ${c.author_role !== 'ADMIN' ? 'items-end flex flex-col' : ''}`}>
                                    <div className={`rounded-2xl px-5 py-4 ${c.author_role === 'ADMIN' ? 'bg-ms-black text-white rounded-tl-none' : 'bg-ms-beige border border-ms-border rounded-tr-none'
                                        }`}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${c.author_role === 'ADMIN' ? 'opacity-40' : 'text-ms-gray opacity-60'}`}>
                                            {c.author_name} · {c.author_role}
                                        </p>
                                        <p className={`text-sm leading-relaxed ${c.author_role === 'ADMIN' ? 'text-white' : 'text-ms-black'}`}>
                                            {c.content}
                                        </p>
                                    </div>
                                    <p className="text-[8px] text-ms-gray opacity-40 mt-1.5 font-bold px-2">
                                        {new Date(c.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-ms-border">
                    <input
                        type="text"
                        placeholder="Add a comment or note..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        className="flex-1 bg-ms-beige/20 border border-ms-border rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !text.trim()}
                        className="px-5 py-3 bg-ms-black text-white rounded-xl hover:bg-ms-black/80 transition-colors disabled:opacity-40 flex items-center gap-2"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
