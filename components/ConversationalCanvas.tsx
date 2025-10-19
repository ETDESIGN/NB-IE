import React, { useState } from 'react';

// SVG Icons
const InfoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ImageWithUpArrowIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l2.25 2.25a2 2 0 002.83 0L12 13.5l3.92 3.92a2 2 0 002.83 0L21 15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V3m0 0l-3 3m3-3l3 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

const GearIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UpArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="translate(0, -1)"/>
    </svg>
);

const ChevronDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);


interface ConversationalCanvasProps {
    isLoading: boolean;
    onCommandSubmit: (command: string) => void;
    onVisualSubmit: () => void;
    hasAnnotations: boolean;
    onUploadClick: () => void;
    aiMode: 'auto' | 'strict' | 'creative';
    onAiModeChange: (mode: 'auto' | 'strict' | 'creative') => void;
}

export const ConversationalCanvas: React.FC<ConversationalCanvasProps> = ({ isLoading, onCommandSubmit, onVisualSubmit, hasAnnotations, onUploadClick, aiMode, onAiModeChange }) => {
    const [command, setCommand] = useState('');
    const [mode, setMode] = useState<'visual' | 'prompt'>('prompt'); 
    const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (mode === 'prompt' && command) {
            onCommandSubmit(command);
            setCommand('');
        } else if (mode === 'visual' && hasAnnotations) {
            onVisualSubmit();
        }
    };
    
    // Determine if the submit button should be disabled
    const isSubmitDisabled = isLoading || (mode === 'prompt' && !command) || (mode === 'visual' && !hasAnnotations);

    const handleModeSelect = (selectedMode: 'auto' | 'strict' | 'creative') => {
        onAiModeChange(selectedMode);
        setIsModeDropdownOpen(false);
    };

    return (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-4">
            <div className="bg-[#2B2B2B] border border-surface-light rounded-2xl p-2.5 flex items-center justify-between shadow-2xl space-x-4 w-full max-w-4xl">
                
                <div className="flex items-center space-x-4 flex-grow pl-2">
                    {mode === 'visual' ? (
                        <div className="flex items-center space-x-2 text-text-dark text-sm animate-fade-in flex-grow">
                            <InfoIcon />
                            <span>Add annotations by clicking on the image</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex-grow">
                            <input
                                type="text"
                                value={command}
                                onChange={(e) => setCommand(e.target.value)}
                                placeholder="Describe what you want to do..."
                                className="w-full bg-transparent text-text-light placeholder-text-dark focus:outline-none"
                                disabled={isLoading}
                                autoFocus
                            />
                        </form>
                    )}

                    <div className="flex items-center bg-[#1e1e1e] p-1 rounded-full flex-shrink-0">
                        <button 
                            onClick={() => setMode('prompt')} 
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors font-medium ${mode === 'prompt' ? 'bg-[#4c4c4c] text-white' : 'text-text-dark hover:text-white'}`}
                        >
                            Prompt
                        </button>
                        <button 
                            onClick={() => setMode('visual')} 
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors font-medium ${mode === 'visual' ? 'bg-[#4c4c4c] text-white' : 'text-text-dark hover:text-white'}`}
                        >
                            Visual
                        </button>
                    </div>
                    <button onClick={onUploadClick} className="text-text-dark hover:text-text-light transition-colors flex-shrink-0">
                        <ImageWithUpArrowIcon />
                    </button>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="relative">
                         <button onClick={() => setIsModeDropdownOpen(prev => !prev)} className="flex items-center space-x-2 text-text-dark hover:text-text-light text-sm transition-colors">
                            <GearIcon />
                            <span>{aiMode.charAt(0).toUpperCase() + aiMode.slice(1)}</span>
                            <ChevronDownIcon />
                        </button>
                        {isModeDropdownOpen && (
                             <div onMouseLeave={() => setIsModeDropdownOpen(false)} className="absolute bottom-full mb-2 w-32 bg-surface-light border border-surface rounded-lg shadow-lg z-10 animate-fade-in overflow-hidden">
                                <button onClick={() => handleModeSelect('auto')} className="w-full text-left px-4 py-2 text-sm text-text-light hover:bg-primary/50">Auto</button>
                                <button onClick={() => handleModeSelect('strict')} className="w-full text-left px-4 py-2 text-sm text-text-light hover:bg-primary/50">Strict</button>
                                <button onClick={() => handleModeSelect('creative')} className="w-full text-left px-4 py-2 text-sm text-text-light hover:bg-primary/50">Creative</button>
                            </div>
                        )}
                    </div>
                    
                    <button
                        onClick={handleSubmit}
                        className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${
                            isSubmitDisabled 
                                ? 'bg-[#3e3e3e] text-gray-500 cursor-not-allowed'
                                : 'bg-[#505050] text-white hover:bg-[#606060]'
                        }`}
                        disabled={isSubmitDisabled}
                        aria-label="Submit command"
                    >
                        <UpArrowIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};