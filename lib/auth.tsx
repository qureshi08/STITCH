
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

    useEffect(() => {
        let mounted = true;

        // Check real Supabase session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    if (session?.user) {
                        await resolveSupabaseUser(session.user);
                    } else {
                        setIsLoading(false);
                    }
                }
            } catch (e) {
                console.error('Auth init error:', e);
                if (mounted) setIsLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await resolveSupabaseUser(session.user);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        // Safety timeout — never stay on loading for more than 10s
        const timer = setTimeout(() => {
            if (mounted) setIsLoading(false);
        }, 10000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const resolveSupabaseUser = async (supabaseUser: any) => {
        try {
            // Look up role in organization_members
            const { data: member } = await supabase
                .from('organization_members')
                .select('role, organization_id')
                .eq('user_id', supabaseUser.id)
                .single();

            // Layer 1: Check organization_members table
            let role: UserRole = 'CLIENT';
            let orgId = ORG_ID;

            if (member) {
                role = (member.role as UserRole) || 'CLIENT';
                orgId = member.organization_id || ORG_ID;
            } else {
                // Layer 2: Bootstrap — if no DB record, check if this is the designated admin email.
                const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                if (adminEmail && supabaseUser.email?.toLowerCase() === adminEmail.toLowerCase()) {
                    role = 'ADMIN';
                    // Silently persist the admin row to the DB so this only needs to run once
                    fetch('/api/setup-admin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: supabaseUser.id,
                            email: supabaseUser.email,
                            name: supabaseUser.user_metadata?.name || supabaseUser.email,
                            organization_id: ORG_ID,
                        }),
                    }).catch(() => { }); // silent — env var is the fallback if this fails
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
            console.error('Failed to resolve user role:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.user) await resolveSupabaseUser(data.user);
        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
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
