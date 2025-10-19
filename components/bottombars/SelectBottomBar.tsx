import React, { useState, useRef, useEffect } from 'react';
import type { SelectionMode } from '../../types';

// --- ICONS ---
const UpArrowIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="translate(0, -1)"/></svg>;
const BrushIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const AtSymbolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
const LassoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.682 14.872M13.682 14.872L10.958 8.482M13.682 14.872L20.482 18.472M10.958 8.482L4.482 12.482M10.958 8.482L13.682 2.328M13.682 2.328L20.482 6.328M13.682 2.328L6.328 6.328" /></svg>;

interface SelectBottomBarProps {
    isLoading: boolean;
    editPrompt: string;
    onEditPromptChange: (prompt: string) => void;
    onApplyEdit: (fullImage?: boolean) => void;
    onAISelect: (prompt: string) => void;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    retouchMode: 'replace' | 'erase';
    onRetouchModeChange: (mode: 'replace' | 'erase') => void;
    selectionMode: SelectionMode;
    onSelectionModeChange: (mode: SelectionMode) => void;
}

export const SelectBottomBar: React.FC<SelectBottomBarProps> = ({ 
    isLoading, 
    editPrompt, 
    onEditPromptChange, 
    onApplyEdit,
    onAISelect,
    brushSize,
    onBrushSizeChange,
    retouchMode,
    onRetouchModeChange,
    selectionMode,
    onSelectionModeChange,
}) => {
    const [aiSelectPrompt, setAiSelectPrompt] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (selectionMode === 'ai_select') {
             if (aiSelectPrompt) {
                onAISelect(aiSelectPrompt);
                setAiSelectPrompt('');
             }
        } else {
            if (retouchMode === 'replace' && !editPrompt) return;
            onApplyEdit();
        }
    };
    
    const isSubmitDisabled = isLoading || (selectionMode !== 'ai_select' && retouchMode === 'replace' && !editPrompt);
    const isManualSelection = selectionMode === 'brush' || selectionMode === 'lasso';

    return (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-[#2B2B2B] border border-surface-light rounded-2xl p-4 flex items-center shadow-2xl space-x-4 w-full max-w-5xl">
                <div className="flex-grow flex flex-col space-y-3">
                    <div className="flex items-center">
                        { selectionMode === 'ai_select' ? (
                            <>
                                <input
                                    type="text"
                                    value={aiSelectPrompt}
                                    onChange={(e) => setAiSelectPrompt(e.target.value)}
                                    placeholder="Describe what you want to select..."
                                    className="w-full bg-transparent text-text-light placeholder-text-dark focus:outline-none text-base"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={!aiSelectPrompt || isLoading} className="ml-2 px-4 py-1.5 text-sm rounded-lg transition-colors font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50">Select</button>
                            </>
                        ) : retouchMode === 'erase' ? (
                            <p className="w-full text-text-dark text-base">Draw or trace a selection, then press apply to erase.</p>
                        ) : (
                            <input
                                type="text"
                                value={editPrompt}
                                onChange={(e) => onEditPromptChange(e.target.value)}
                                placeholder="Describe what to replace it with..."
                                className="w-full bg-transparent text-text-light placeholder-text-dark focus:outline-none text-base"
                                disabled={isLoading}
                            />
                        )}
                    </div>
                    <div className="flex items-center space-x-4 text-text-dark">
                        <div className="flex items-center bg-surface p-1 rounded-full">
                            <button type="button" onClick={() => onRetouchModeChange('replace')} className={`px-3 py-1 text-xs rounded-full transition-colors font-semibold ${retouchMode === 'replace' ? 'bg-[#555] text-white' : 'text-text-dark hover:text-white'}`}>Replace</button>
                            <button type="button" onClick={() => onRetouchModeChange('erase')} className={`px-3 py-1 text-xs rounded-full transition-colors font-semibold ${retouchMode === 'erase' ? 'bg-[#555] text-white' : 'text-text-dark hover:text-white'}`}>Erase</button>
                        </div>
                        
                         <span className="w-px h-5 bg-surface-light"></span>
                        
                        <div className="relative">
                           <div className="flex items-center bg-surface p-1 rounded-full">
                                <button type="button" onClick={() => onSelectionModeChange('brush')} title="Brush Select" className={`p-1.5 rounded-full transition-colors ${selectionMode === 'brush' ? 'bg-[#555] text-white' : 'text-text-dark hover:text-white'}`}><BrushIcon/></button>
                                <button type="button" onClick={() => onSelectionModeChange('lasso')} title="Lasso Select" className={`p-1.5 rounded-full transition-colors ${selectionMode === 'lasso' ? 'bg-[#555] text-white' : 'text-text-dark hover:text-white'}`}><LassoIcon /></button>
                                <button type="button" onClick={() => onSelectionModeChange('ai_select')} title="AI Select" className={`p-1.5 rounded-full transition-colors ${selectionMode === 'ai_select' ? 'bg-[#555] text-white' : 'text-text-dark hover:text-white'}`}><AtSymbolIcon /></button>
                           </div>
                        </div>

                        {selectionMode === 'brush' && (
                            <>
                                <input type="range" min="1" max="100" value={brushSize} onChange={e => onBrushSizeChange(parseInt(e.target.value))} className="w-24 h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
                                <span className="text-xs text-text-light font-mono w-8 text-center bg-surface px-1 py-0.5 rounded">{brushSize}</span>
                            </>
                        )}
                       
                    </div>
                </div>
                { isManualSelection && (
                    <button
                        type="submit"
                        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${isSubmitDisabled ? 'bg-[#3e3e3e] text-gray-500 cursor-not-allowed' : 'bg-[#505050] text-white hover:bg-[#606060]'}`}
                        disabled={isSubmitDisabled}
                        aria-label="Submit Edit"
                    >
                        <UpArrowIcon />
                    </button>
                )}
            </form>
        </div>
    );
};