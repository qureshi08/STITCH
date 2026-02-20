
import React, { useEffect, useState } from 'react';
import {
    Upload,
    Image as ImageIcon,
    History,
    CheckCircle,
    Plus,
    Maximize2,
    Trash2,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Garment } from '@/types';
import Link from 'next/link';
import { createGarment } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Props {
    garments: Garment[];
}

export function Module2Creative({ garments, collectionId }: { garments: Garment[], collectionId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSku, setNewSku] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organization_id || !newName || !newSku) return;

        setIsLoading(true);
        try {
            await createGarment({
                name: newName,
                sku: newSku,
                collection_id: collectionId,
                organization_id: user.organization_id,
                current_stage: 'ILLUSTRATION'
            });
            setNewName('');
            setNewSku('');
            setIsCreating(false);
            router.refresh(); // Refresh to see the new garment
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const activeGarment = garments[0];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-ms-black font-serif">Illustration System</h3>
                <div className="flex gap-2">
                    <span className="text-[10px] font-bold text-ms-gray uppercase tracking-widest bg-ms-beige px-2 py-1 rounded">
                        {garments.length} Items Indexed
                    </span>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="ms-button-secondary py-1 text-[10px] h-auto flex items-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> Add SKU
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Illustration Area */}
                <div className="space-y-6">
                    <div className="ms-card relative bg-ms-beige/10 min-h-[500px] flex flex-col items-center justify-center border-dashed border-2 group">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors">
                                <Maximize2 className="w-4 h-4 text-ms-black" />
                            </button>
                            <button className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors">
                                <History className="w-4 h-4 text-ms-black" />
                            </button>
                        </div>

                        {activeGarment ? (
                            <div className="text-center p-10">
                                <div className="w-32 h-32 bg-white rounded-full border border-ms-border mx-auto mb-6 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-ms-gray/30" />
                                </div>
                                <h4 className="text-lg font-bold text-ms-black font-serif">{activeGarment.name}</h4>
                                <p className="text-xs text-ms-gray mt-1 uppercase tracking-widest">{activeGarment.sku}</p>
                                <button className="ms-button-primary mt-8 py-2 px-8">Update Illustration</button>
                            </div>
                        ) : (
                            <div className="text-center p-10">
                                <ImageIcon className="w-12 h-12 text-ms-gray/30 mx-auto mb-4" />
                                <p className="text-sm font-medium text-ms-black">Concept Image & Digital Illustration</p>
                                <p className="text-xs text-ms-gray mt-2">Drag and drop high-res PSD or Procreate file</p>
                                <button className="ms-button-primary mt-6 py-2 px-8">Upload File</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Flats & Details */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        {isCreating && (
                            <form onSubmit={handleCreate} className="p-4 bg-ms-beige rounded-lg border border-ms-black space-y-4 animate-in fade-in zoom-in-95">
                                <p className="text-[10px] font-black uppercase tracking-widest text-ms-black">New Garment Entity</p>
                                <div className="space-y-3">
                                    <input
                                        autoFocus
                                        placeholder="Garment Name (e.g. Silk Wrap Dress)"
                                        className="w-full bg-white border border-ms-border p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-ms-black"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                    />
                                    <input
                                        placeholder="SKU Code"
                                        className="w-full bg-white border border-ms-border p-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-ms-black font-mono uppercase"
                                        value={newSku}
                                        onChange={e => setNewSku(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={isLoading} className="flex-1 ms-button-primary py-2 text-[10px]">
                                            {isLoading ? 'Creating...' : 'Initialize Asset'}
                                        </button>
                                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-[10px] font-bold uppercase">Cancel</button>
                                    </div>
                                </div>
                            </form>
                        )}
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest flex items-center gap-2">
                            Garment Pipeline <span className="lowercase font-normal opacity-50 font-sans">(Select item to work on)</span>
                        </h4>
                        <div className="space-y-2">
                            {garments.map(g => (
                                <Link
                                    key={g.id}
                                    href={`/collections/${g.collection_id}/garments/${g.id}`}
                                    className="p-3 bg-white border border-ms-border rounded-lg flex items-center justify-between hover:bg-ms-beige transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-ms-beige rounded border border-ms-border flex items-center justify-center">
                                            <ImageIcon className="w-4 h-4 text-ms-gray" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-ms-black">{g.name}</p>
                                            <p className="text-[10px] text-ms-gray uppercase">{g.sku}</p>
                                        </div>
                                    </div>
                                    <div className="status-badge text-[8px] uppercase">{g.current_stage}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-ms-border">
                        <h4 className="text-[10px] font-bold uppercase text-ms-gray tracking-widest">Construction Callouts</h4>
                        <div className="bg-white border border-ms-border rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="ms-table-header">
                                    <tr>
                                        <th className="py-2 px-4">Detail</th>
                                        <th className="py-2 px-4">Zoom Sketch</th>
                                        <th className="py-2 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-ms-border">
                                    {[
                                        { name: 'Contrast Binding', status: 'Pending' },
                                        { name: 'Hidden Zipper', status: 'Uploaded' },
                                    ].map((item, i) => (
                                        <tr key={i} className="group hover:bg-ms-beige/20">
                                            <td className="py-3 px-4 font-medium text-ms-black">{item.name}</td>
                                            <td className="py-3 px-4">
                                                {item.status === 'Uploaded' ? (
                                                    <div className="w-8 h-8 bg-ms-beige rounded border border-ms-border" />
                                                ) : (
                                                    <button className="text-[10px] font-bold text-ms-black underline uppercase tracking-tighter">Add Zoom</button>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Trash2 className="w-4 h-4 text-ms-gray hover:text-red-500 cursor-pointer transition-colors ml-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="ms-card p-5 bg-ms-black text-white">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-60">Creative Protocol</h4>
                        <p className="text-sm italic leading-relaxed">
                            "Ensure all digital illustrations are 300DPI and follow the core season palette."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
