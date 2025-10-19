

import React from 'react';

// --- ICONS ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

// A simplified set of styles for the demo UI
const PRESET_STYLES = [
  { name: '#Hologra...', image: 'https://source.unsplash.com/200x200/?holographic,abstract' },
  { name: '#Dotted', image: 'https://source.unsplash.com/200x200/?dotted,pattern' },
  { name: '#3D Char...', image: 'https://source.unsplash.com/200x200/?3d,character,render' },
  { name: '#Vector', image: 'https://source.unsplash.com/200x200/?vector,art' },
  { name: '#Classic...', image: 'https://source.unsplash.com/200x200/?classic,painting' },
  { name: '#Risoprint', image: 'https://source.unsplash.com/200x200/?risograph,print' },
  { name: '#Neoclass...', image: 'https://source.unsplash.com/200x200/?neoclassicism,sculpture' },
  { name: '#Fantasy...', image: 'https://source.unsplash.com/200x200/?fantasy,art' },
  { name: '#Whimsy...', image: 'https://source.unsplash.com/200x200/?whimsical,illustration' },
  { name: '#Moody...', image: 'https://source.unsplash.com/200x200/?moody,photography' },
  { name: '#Classic...', image: 'https://source.unsplash.com/200x200/?90s,anime' },
  { name: '...', image: 'https://source.unsplash.com/200x200/?abstract,texture' },
];


// Fix: Simplified the GeneratePanelProps interface to only include the props used by the component.
// This resolves a TypeScript error in App.tsx caused by an overly broad props definition.
interface GeneratePanelProps {
  onGenerate: () => void;
  onAddStyleReferenceClick: () => void;
  onTagToggle: (tag: string) => void;
}

export const GeneratePanel: React.FC<GeneratePanelProps> = (props) => {
    
    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
            <header className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-text-light">Restyle</h3>
              <button className="text-text-dark text-2xl">&times;</button>
            </header>
            
            <div className="flex bg-surface-light p-1 rounded-lg">
                <button className="flex-1 p-2 bg-surface rounded-md text-text-light font-semibold">Style</button>
                <button className="flex-1 p-2 text-text-dark font-semibold">Color</button>
            </div>
            
            <button onClick={props.onAddStyleReferenceClick} className="w-full flex flex-col items-center justify-center p-4 bg-surface-light rounded-lg border-2 border-dashed border-gray-600 hover:border-primary transition-colors text-text-dark hover:text-text-light">
                <UploadIcon />
                <span className="mt-2 font-semibold">Upload</span>
            </button>

            <div className="flex-grow overflow-y-auto pr-2">
                <h4 className="text-text-dark font-semibold mb-2">Presets</h4>
                 <div className="grid grid-cols-4 gap-2">
                    {PRESET_STYLES.map(style => (
                        <div key={style.name} className="relative cursor-pointer group" onClick={() => props.onTagToggle(style.name)}>
                            <img src={style.image} alt={style.name} className="w-full aspect-square object-cover rounded-md"/>
                             <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-bold">{style.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={props.onGenerate} className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors">
                Restyle
                <SparklesIcon className="ml-2"/>
            </button>
        </div>
    );
};