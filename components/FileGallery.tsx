
"use client"

import React, { useEffect, useState } from 'react';
import { FileText, Image, File, Download, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { FileRecord } from '@/types';
import { FileUpload } from './FileUpload';

interface FileGalleryProps {
    entityType: string;
    entityId: string;
    canUpload?: boolean;
    compact?: boolean;
}

export function FileGallery({ entityType, entityId, canUpload = false, compact = false }: FileGalleryProps) {
    const { user } = useAuth();
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadFiles = async () => {
        try {
            const { data } = await supabase
                .from('files')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });
            setFiles((data as FileRecord[]) || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [entityId]);

    const handleDelete = async (file: FileRecord) => {
        if (!confirm(`Delete "${file.file_name}"?`)) return;
        try {
            const path = new URL(file.url).pathname.split('/stitch-files/')[1];
            await supabase.storage.from('stitch-files').remove([path]);
            await supabase.from('files').delete().eq('id', file.id);
            setFiles(prev => prev.filter(f => f.id !== file.id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const getIcon = (f: FileRecord) => {
        if (f.file_type === 'image') return <Image className="w-5 h-5" />;
        if (f.file_type === 'pdf') return <FileText className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    if (isLoading) {
        return (
            <div className="p-10 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-ms-gray" />
                <span className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-40">Loading Files...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {canUpload && user?.role === 'ADMIN' && (
                <FileUpload
                    entityType={entityType}
                    entityId={entityId}
                    onUploadComplete={() => loadFiles()}
                />
            )}

            {files.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-ms-border rounded-xl">
                    <File className="w-10 h-10 text-ms-gray/20 mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray opacity-40">No files uploaded yet</p>
                </div>
            ) : (
                <div className={compact ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                    {files.map(file => (
                        <div key={file.id} className="flex items-center gap-4 p-4 bg-ms-beige/10 border border-ms-border rounded-xl hover:border-ms-black/20 transition-all group">
                            {/* Preview for images */}
                            {file.file_type === 'image' ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-ms-beige">
                                    <img src={file.url} alt={file.file_name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-lg bg-ms-beige flex items-center justify-center flex-shrink-0 text-ms-black">
                                    {getIcon(file)}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-ms-black truncate">{file.file_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60">{file.file_type?.toUpperCase()}</p>
                                    {file.size_bytes && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-ms-gray/20" />
                                            <p className="text-[9px] font-mono text-ms-gray opacity-60">{formatSize(file.size_bytes)}</p>
                                        </>
                                    )}
                                    {file.uploaded_by && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-ms-gray/20" />
                                            <p className="text-[9px] text-ms-gray opacity-60">by {file.uploaded_by}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-ms-beige rounded-lg transition-colors text-ms-gray hover:text-ms-black"
                                    title="Open"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <a
                                    href={file.url}
                                    download={file.file_name}
                                    className="p-2 hover:bg-ms-beige rounded-lg transition-colors text-ms-gray hover:text-ms-black"
                                    title="Download"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                {user?.role === 'ADMIN' && (
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-ms-gray hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
