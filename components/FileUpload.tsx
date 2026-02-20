
"use client"

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface UploadedFile {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

interface FileUploadProps {
    entityType: string; // 'collection' | 'garment' | 'sample'
    entityId: string;
    accept?: string; // e.g. "image/*,.pdf,.dxf"
    maxSizeMB?: number;
    label?: string;
    onUploadComplete?: (file: UploadedFile) => void;
}

export function FileUpload({
    entityType,
    entityId,
    accept = 'image/*,.pdf,.dxf,.xlsx',
    maxSizeMB = 20,
    label = 'Upload Files',
    onUploadComplete,
}: FileUploadProps) {
    const { user } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState<{ file: File; status: 'uploading' | 'done' | 'error'; url?: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || !user) return;

        for (const file of Array.from(files)) {
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`${file.name} exceeds ${maxSizeMB}MB limit.`);
                continue;
            }

            const uploadKey = `${entityType}/${entityId}/${Date.now()}-${file.name}`;
            setUploads(prev => [...prev, { file, status: 'uploading' }]);

            try {
                // Upload to Supabase Storage bucket 'stitch-files'
                const { data: storageData, error: storageError } = await supabase.storage
                    .from('stitch-files')
                    .upload(uploadKey, file, { upsert: false });

                if (storageError) throw storageError;

                const { data: { publicUrl } } = supabase.storage
                    .from('stitch-files')
                    .getPublicUrl(uploadKey);

                // Save file record to DB
                const { data: record } = await supabase.from('files').insert([{
                    organization_id: user.organization_id,
                    entity_type: entityType,
                    entity_id: entityId,
                    file_name: file.name,
                    file_type: file.type.startsWith('image') ? 'image' : file.name.endsWith('.pdf') ? 'pdf' : 'other',
                    url: publicUrl,
                    uploaded_by: user.name,
                    size_bytes: file.size,
                }]).select().single();

                setUploads(prev => prev.map(u =>
                    u.file === file ? { ...u, status: 'done', url: publicUrl } : u
                ));

                onUploadComplete?.({
                    id: record?.id || '',
                    name: file.name,
                    url: publicUrl,
                    type: file.type,
                    size: file.size,
                });
            } catch (err) {
                console.error('Upload error:', err);
                setUploads(prev => prev.map(u =>
                    u.file === file ? { ...u, status: 'error' } : u
                ));
            }
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image')) return <Image className="w-4 h-4" />;
        if (file.name.endsWith('.pdf')) return <FileText className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-ms-black bg-ms-beige/30 scale-[1.01]'
                        : 'border-ms-border hover:border-ms-black hover:bg-ms-beige/10'
                    }`}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-ms-beige rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-ms-black" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-ms-black">{label}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-ms-gray mt-1 opacity-60">
                            Drag & drop or click — PDF, DXF, Images, XLSX — Max {maxSizeMB}MB
                        </p>
                    </div>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={accept}
                    className="hidden"
                    onChange={e => handleFiles(e.target.files)}
                />
            </div>

            {/* Upload Progress */}
            {uploads.length > 0 && (
                <div className="space-y-2">
                    {uploads.map((u, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-ms-beige/20 border border-ms-border rounded-lg">
                            <div className="text-ms-gray">{getFileIcon(u.file)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-ms-black truncate">{u.file.name}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-ms-gray opacity-60 mt-0.5">
                                    {(u.file.size / 1024).toFixed(0)} KB
                                </p>
                            </div>
                            {u.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-ms-gray flex-shrink-0" />}
                            {u.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                            {u.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
