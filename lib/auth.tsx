
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
    const supabase = createClient();

    const fetchUserRole = async (supabaseUser: any) => {
        try {
            const { data: member, error } = await supabase
                .from('organization_members')
                .select('role, organization_id, name')
                .eq('user_id', supabaseUser.id)
                .maybeSingle();

            if (error) throw error;

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: member?.name || supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
                role: (member?.role as UserRole) || 'CLIENT',
                organization_id: member?.organization_id || ORG_ID,
            });
        } catch (err) {
            console.error('STITCH Auth Sync Error:', err);
            // Fallback for UI robustness
            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: 'Studio User',
                role: 'CLIENT',
                organization_id: ORG_ID,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchUserRole(session.user);
            } else {
                setIsLoading(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) await fetchUserRole(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
            }
        });

        init();
        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<{ error: string | null }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };
            if (data.user) await fetchUserRole(data.user);
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
