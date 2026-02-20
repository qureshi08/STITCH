
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User, UserRole } from '@/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ORG_ID = '11111111-1111-1111-1111-111111111111';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);

    const resolveSupabaseUser = async (supabaseUser: any) => {
        if (!supabaseUser || isResolving) return;
        setIsResolving(true);
        // We keep isLoading true while resolving to prevent UI flicker

        try {
            // maybeSingle() is the correct tool here — it returns null if no row found
            // rather than erroring out like .single() does
            const { data: member, error: dbError } = await supabase
                .from('organization_members')
                .select('role, organization_id')
                .eq('user_id', supabaseUser.id)
                .maybeSingle();

            if (dbError) throw dbError;

            let role: UserRole = 'CLIENT';
            let orgId = ORG_ID;

            if (member) {
                role = (member.role as UserRole) || 'CLIENT';
                orgId = member.organization_id || ORG_ID;
            } else {
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                if (adminEmail && supabaseUser.email?.toLowerCase() === adminEmail.toLowerCase()) {
                    role = 'ADMIN';
                    fetch('/api/setup-admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: supabaseUser.id,
                            email: supabaseUser.email,
                            name: supabaseUser.user_metadata?.name || supabaseUser.email,
                            organization_id: ORG_ID,
                        }),
                    }).catch(() => { });
                }
            }

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
                role,
                organization_id: orgId,
            });
        } catch (err) {
            console.error('STITCH Auth Error:', err);
            // On failure, we still want the user to be able to see the app
            if (supabaseUser) {
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    name: 'Studio User',
                    role: 'CLIENT',
                    organization_id: ORG_ID,
                });
            }
        } finally {
            setIsLoading(false);
            setIsResolving(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (mounted) {
                if (session?.user) {
                    await resolveSupabaseUser(session.user);
                } else {
                    setIsLoading(false);
                }
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) await resolveSupabaseUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
            }
        });

        init();

        // FAIL-SAFE: The portal must always open within 6 seconds
        const failSafe = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 6000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(failSafe);
        };
    }, []);

    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };
            if (data.user) await resolveSupabaseUser(data.user);
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Authentication failed' };
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
