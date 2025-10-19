import React, { useState } from 'react';

interface SelectPanelProps {
    editPrompt: string;
    onEditPromptChange: (value: string) => void;
    onApplyEdit: (fullImage?: boolean) => void;
    onAISelect: (prompt: string) => void;
    hasSelection: boolean;
}

const MagicWandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;

export const SelectPanel: React.FC<SelectPanelProps> = ({
    editPrompt,
    onEditPromptChange,
    onApplyEdit,
    onAISelect,
    hasSelection
}) => {
    const [aiSelectPrompt, setAiSelectPrompt] = useState('');

    const handleAISelectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (aiSelectPrompt) {
            onAISelect(aiSelectPrompt);
            setAiSelectPrompt('');
        }
    };

    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
            <h3 className="text-lg font-bold text-text-light">Select & Edit</h3>

            <div className="p-3 bg-surface-light rounded-lg space-y-2">
                <label htmlFor="ai-select" className="font-semibold text-text-light flex items-center"><MagicWandIcon /> <span className="ml-2">AI Select</span></label>
                <form onSubmit={handleAISelectSubmit} className="flex space-x-2">
                    <input
                        id="ai-select"
                        type="text"
                        value={aiSelectPrompt}
                        onChange={e => setAiSelectPrompt(e.target.value)}
                        placeholder="e.g., the red car, the sky"
                        className="w-full bg-surface text-text-light placeholder-text-dark focus:outline-none p-2 rounded-md border border-surface-light focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary rounded-md text-white font-semibold hover:bg-primary-hover transition-colors">Select</button>
                </form>
            </div>

            <div className="p-3 bg-surface-light rounded-lg space-y-2">
                <label htmlFor="edit-prompt" className="font-semibold text-text-light">Edit Selection</label>
                <textarea
                    id="edit-prompt"
                    placeholder={hasSelection ? "e.g., make it blue, add flames" : "Make a selection first to enable editing."}
                    value={editPrompt}
                    onChange={e => onEditPromptChange(e.target.value)}
                    className="w-full bg-surface text-text-light placeholder-text-dark focus:outline-none p-2 rounded-md border border-surface-light focus:ring-2 focus:ring-primary h-24 resize-none"
                    disabled={!hasSelection}
                />
                <button
                    onClick={() => onApplyEdit()}
                    disabled={!editPrompt || !hasSelection}
                    className="w-full p-2 bg-primary rounded-md text-white font-semibold hover:bg-primary-hover transition-colors disabled:bg-surface disabled:text-text-dark disabled:cursor-not-allowed"
                >
                    Apply Edit to Selection
                </button>
            </div>
            
             <div className="p-3 bg-surface-light rounded-lg space-y-2">
                 <label htmlFor="edit-prompt-full" className="font-semibold text-text-light">Edit Full Image</label>
                 <p className="text-xs text-text-dark">Use this if you want to edit the entire image without a selection.</p>
                  <button
                    onClick={() => onApplyEdit(true)}
                    disabled={!editPrompt}
                    className="w-full p-2 bg-surface text-text-light font-semibold rounded-md hover:bg-gray-700 transition-colors disabled:bg-surface disabled:text-text-dark disabled:cursor-not-allowed"
                >
                    Apply Edit to Full Image
                </button>
            </div>


        </div>
    );
};
