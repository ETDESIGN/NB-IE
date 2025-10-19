
import React, {useState} from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const GrainIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; }> = ({ label, value, min, max, step, onChange }) => {
    return (
        <div>
            <div className="flex justify-between items-center text-xs text-text-dark mb-1">
                <label className="text-text-light">{label}</label>
                <span>{value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>
    );
};

interface EnhancePanelProps {
  onEnhance: (type: 'upscale' | 'face' | 'lighting' | 'noise', settings?: object) => void;
}

export const EnhancePanel: React.FC<EnhancePanelProps> = ({ onEnhance }) => {
    const [creativity, setCreativity] = useState(0.5);

    const handleUpscale = () => {
        onEnhance('upscale', { creativity });
    };

    const handleFaceRestore = () => {
        onEnhance('face');
    };

    const handleFixLighting = () => {
        onEnhance('lighting');
    };

    const handleRemoveNoise = () => {
        onEnhance('noise');
    };

    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4 overflow-y-auto">
            <header className="flex-shrink-0">
                <h3 className="text-lg font-bold text-text-light">Enhance Image</h3>
            </header>

            <div className="p-4 bg-surface-light rounded-lg space-y-4">
                <h4 className="font-semibold text-text-light">Creative Upscale</h4>
                <p className="text-xs text-text-dark">Increase resolution and intelligently add plausible details to your image.</p>
                <Slider label="Creativity Level" value={creativity} min={0} max={1} step={0.1} onChange={setCreativity} />
                <button 
                    onClick={handleUpscale} 
                    className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Upscale Image
                    <SparklesIcon className="ml-2"/>
                </button>
            </div>
            
            <div className="p-4 bg-surface-light rounded-lg space-y-4">
                <h4 className="font-semibold text-text-light">Face Restore</h4>
                <p className="text-xs text-text-dark">Automatically detect faces in your image and improve their clarity and realism without altering their features.</p>
                <button 
                    onClick={handleFaceRestore} 
                    className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Restore Faces
                    <SparklesIcon className="ml-2"/>
                </button>
            </div>

            <div className="p-4 bg-surface-light rounded-lg space-y-4">
                <h4 className="font-semibold text-text-light">Fix Lighting</h4>
                <p className="text-xs text-text-dark">Automatically balance the exposure, contrast, and highlights for a perfectly lit photo.</p>
                <button 
                    onClick={handleFixLighting} 
                    className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Fix Lighting
                    <LightBulbIcon className="ml-2"/>
                </button>
            </div>
            
            <div className="p-4 bg-surface-light rounded-lg space-y-4">
                <h4 className="font-semibold text-text-light">Remove Noise & Grain</h4>
                <p className="text-xs text-text-dark">Clean up digital noise and film grain from your image, resulting in a clearer, smoother finish.</p>
                <button 
                    onClick={handleRemoveNoise} 
                    className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                >
                    Remove Noise
                    <GrainIcon className="ml-2"/>
                </button>
            </div>
        </div>
    );
};
