
"use client"

import React from 'react';
import { Settings, Database, Bell, Shield, Palette } from 'lucide-react';

const sections = [
    {
        icon: Database,
        title: 'Database & Backend',
        description: 'Supabase project settings, Row Level Security policies, and API keys.',
        status: 'Connected',
        statusColor: 'bg-green-50 text-green-700',
    },
    {
        icon: Bell,
        title: 'Notifications',
        description: 'Configure email and in-app alert preferences for invoices and stage changes.',
        status: 'Active',
        statusColor: 'bg-blue-50 text-blue-700',
    },
    {
        icon: Shield,
        title: 'Access Control',
        description: 'Manage user roles and organization membership permissions.',
        status: 'RBAC Active',
        statusColor: 'bg-purple-50 text-purple-700',
    },
    {
        icon: Palette,
        title: 'Branding',
        description: 'Customize the studio name, logo, and portal appearance.',
        status: 'Default Theme',
        statusColor: 'bg-ms-beige text-ms-gray',
    },
];

export default function AdminSettingsPage() {
    return (
        <div className="space-y-10 pb-20">
            <div>
                <h1 className="text-4xl font-bold text-ms-black font-serif italic tracking-tighter">Studio Settings</h1>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ms-gray mt-3">System configuration and access management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((s, i) => (
                    <div key={i} className="ms-card p-8 flex gap-6 items-start hover:border-ms-black/20 transition-all">
                        <div className="w-12 h-12 bg-ms-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-ms-black text-sm">{s.title}</h3>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${s.statusColor}`}>{s.status}</span>
                            </div>
                            <p className="text-[11px] text-ms-gray leading-relaxed">{s.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ms-card p-8 border-dashed bg-ms-beige/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray text-center">
                    Advanced configuration options are managed directly in your Supabase project dashboard.
                </p>
            </div>
        </div>
    );
}
