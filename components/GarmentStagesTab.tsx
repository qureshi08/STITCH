"use client"

import React, { useState } from 'react';
import {
    CheckCircle2, Circle, ChevronDown, ChevronUp,
    FileText, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Garment, GarmentStage } from '@/types';
import { FileGallery } from './FileGallery';
import { CommentThread } from './CommentThread';

interface GarmentStagesTabProps {
    garment: Garment;
}

const STAGES: GarmentStage[] = [
    'ILLUSTRATION', 'PATTERN', 'TECH_PACK', 'SAMPLING',
    'PRE_PRODUCTION', 'PRODUCTION', 'QC', 'PACKAGING', 'DELIVERED'
];

export function GarmentStagesTab({ garment }: GarmentStagesTabProps) {
    const [expandedStage, setExpandedStage] = useState<GarmentStage | null>(garment.current_stage);

    const currentStageIdx = STAGES.indexOf(garment.current_stage);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-ms-black">Production Workflow</h3>
                    <p className="text-sm text-ms-gray mt-1">Manage files and discussions for each production phase.</p>
                </div>
            </div>

            <div className="space-y-4">
                {STAGES.map((stage, i) => {
                    const isCompleted = i < currentStageIdx;
                    const isCurrent = stage === garment.current_stage;
                    const isExpanded = expandedStage === stage;

                    // Unique entity type for this stage + garment combo
                    // We use entityId = garment.id
                    // And entityType = `garment_stage_${stage}`
                    // This way we filter files/comments by both garment AND stage
                    const stageEntityType = `garment_${stage}`;

                    return (
                        <div
                            key={stage}
                            className={cn(
                                "border rounded-xl transition-all duration-300 overflow-hidden bg-white",
                                isCurrent ? "border-ms-black ring-1 ring-ms-black/5 shadow-lg" : "border-ms-border hover:border-ms-gray/30"
                            )}
                        >
                            <button
                                onClick={() => setExpandedStage(isExpanded ? null : stage)}
                                className={cn(
                                    "w-full flex items-center justify-between p-6 text-left transition-colors",
                                    isExpanded ? "bg-ms-beige/10" : "bg-white"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        isCompleted ? "bg-green-100 text-green-600" :
                                            isCurrent ? "bg-ms-black text-white" :
                                                "bg-ms-beige text-ms-gray/50"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                            isCurrent ? <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> :
                                                <Circle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className={cn(
                                            "text-sm font-bold uppercase tracking-wider",
                                            isCurrent ? "text-ms-black" : "text-ms-gray"
                                        )}>
                                            {stage.replace('_', ' ')}
                                        </h4>
                                        {isCurrent && <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">In Progress</p>}
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-ms-gray" /> : <ChevronDown className="w-4 h-4 text-ms-gray" />}
                            </button>

                            {isExpanded && (
                                <div className="p-6 border-t border-ms-border bg-white space-y-8 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* Files Section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-4 h-4 text-ms-gray" />
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-ms-black">Phase Files</h5>
                                            </div>
                                            <p className="text-xs text-ms-gray mb-4">Upload sketches, patterns, or tech packs specific to this stage.</p>

                                            <FileGallery
                                                entityType={stageEntityType}
                                                entityId={garment.id}
                                                canUpload={true}
                                                compact={true}
                                            />
                                        </div>

                                        {/* Discussion Section */}
                                        <div className="space-y-4 lg:border-l lg:border-ms-border lg:pl-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="w-4 h-4 text-ms-gray" />
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-ms-black">Phase Discussion</h5>
                                            </div>
                                            <p className="text-xs text-ms-gray mb-4">Feedback and notes for {stage.replace('_', ' ').toLowerCase()}.</p>

                                            <CommentThread
                                                entityType={stageEntityType}
                                                entityId={garment.id}
                                                collectionId={garment.collection_id}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
