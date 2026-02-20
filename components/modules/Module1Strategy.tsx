
import React from 'react';
import { Collection } from '@/types';
import { updateCollection } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle } from 'lucide-react';

interface Props {
    collection: Collection;
}

export function Module1Strategy({ collection }: Props) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        target_audience: collection.target_audience || '',
        season: collection.season || '',
        target_margin_pct: collection.target_margin_pct || 60,
        price_positioning: collection.price_positioning || 'Premium'
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateCollection(collection.id, formData);
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-3">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="ms-button-primary bg-ms-black border-ms-black text-[10px] px-6 py-2 flex items-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Commit Strategy Updates
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="ms-card p-8 space-y-6">
                    <h3 className="text-xl font-bold text-ms-black font-serif italic mb-4">Strategic Objective</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-ms-gray tracking-widest">Target Audience</label>
                            <input
                                type="text"
                                value={formData.target_audience}
                                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                                className="w-full bg-ms-beige/20 border border-ms-border rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-ms-gray tracking-widest">Season Code</label>
                            <input
                                type="text"
                                value={formData.season}
                                onChange={e => setFormData({ ...formData, season: e.target.value })}
                                className="w-full bg-ms-beige/20 border border-ms-border rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-ms-gray tracking-widest">Target Margin</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.target_margin_pct}
                                        onChange={e => setFormData({ ...formData, target_margin_pct: Number(e.target.value) })}
                                        className="w-full bg-ms-beige/20 border border-ms-border rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ms-gray text-xs">%</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-ms-gray tracking-widest">Price Point</label>
                                <select
                                    value={formData.price_positioning}
                                    onChange={e => setFormData({ ...formData, price_positioning: e.target.value })}
                                    className="w-full bg-ms-beige/20 border border-ms-border rounded p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black"
                                >
                                    <option>Bridge</option>
                                    <option>Premium</option>
                                    <option>Luxury</option>
                                    <option>Couture</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="ms-card p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-ms-black mb-6 font-serif italic">Operational Risks</h3>
                    <textarea
                        placeholder="Define constraints..."
                        className="flex-1 w-full bg-ms-beige/20 border border-ms-border rounded p-4 text-sm focus:outline-none focus:ring-1 focus:ring-ms-black resize-none font-serif"
                        defaultValue="Material lead times for Italian silks currently 6 weeks. Sampling capacity locked for next 14 days."
                    />
                    <div className="mt-8 flex items-center justify-between p-4 bg-ms-black text-white rounded">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Initial Scope Approved</span>
                        </div>
                        <div className="w-8 h-4 bg-white/20 rounded-full relative">
                            <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
