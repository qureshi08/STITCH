
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
        // Check real Supabase session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                await resolveSupabaseUser(session.user);
            }
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                await resolveSupabaseUser(session.user);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const resolveSupabaseUser = async (supabaseUser: any) => {
        try {
            // Look up role in organization_members
            const { data: member } = await supabase
                .from('organization_members')
                .select('role, organization_id')
                .eq('user_id', supabaseUser.id)
                .single();

            const role: UserRole = (member?.role as UserRole) || 'CLIENT';
            const orgId = member?.organization_id || ORG_ID;

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.name || supabaseUser.email || 'User',
                role,
                organization_id: orgId,
            });
        } catch (err) {
            console.error('Failed to resolve user role:', err);
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
