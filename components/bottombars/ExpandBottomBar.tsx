import React, { useState } from 'react';

const UpArrowIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="translate(0, -1)"/></svg>;
const ZoomInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3h-6" /></svg>;
const ZoomOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const AspectRatioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 0M21 6l-3 0M12 3l0 3M12 21l0-3M6 12l-3 0M18 12l3 0" /><path d="M4 4h16v16H4z" /></svg>;

interface ExpandBottomBarProps {
    isLoading: boolean;
    onExpand: (prompt?: string) => void;
}

export const ExpandBottomBar: React.FC<ExpandBottomBarProps> = ({ isLoading, onExpand }) => {
    const [prompt, setPrompt] = useState('');
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        onExpand(prompt);
    };

    return (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-[#2B2B2B] border border-surface-light rounded-2xl p-3 flex items-center justify-between shadow-2xl space-x-4 w-full max-w-4xl">
                 <span className="text-sm font-semibold text-text-dark flex-shrink-0">Expand your image and describe what you want to change</span>
                
                <div className="flex-grow flex items-center bg-surface p-2 rounded-lg space-x-4">
                    <button type="button" className="p-1.5 text-text-dark hover:text-text-light"><ZoomOutIcon /></button>
                    <button type="button" className="p-1.5 text-text-dark hover:text-text-light"><ZoomInIcon /></button>
                    
                    <button type="button" className="flex items-center space-x-2 bg-surface-light px-3 py-1.5 rounded-md text-text-light text-xs font-semibold">
                        <AspectRatioIcon />
                        <span>Custom</span>
                    </button>
                    <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="bg-surface-light w-20 p-1.5 rounded-md text-center" />
                    <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="bg-surface-light w-20 p-1.5 rounded-md text-center" />

                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what to add in the new space"
                        className="flex-grow bg-transparent text-text-light placeholder-text-dark focus:outline-none text-sm"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${
                        isLoading
                            ? 'bg-[#3e3e3e] text-gray-500 cursor-not-allowed'
                            : 'bg-[#505050] text-white hover:bg-[#606060]'
                    }`}
                    disabled={isLoading}
                    aria-label="Submit Expansion"
                >
                    <UpArrowIcon />
                </button>
            </form>
        </div>
    );
};