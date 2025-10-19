
import React, { useState } from 'react';

const ReplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7.00005 7.00005L17 17M7.00005 7.00005V13.4M7.00005 7.00005H13.4M17 17L7.00005 17M17 17V10.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>;
const TransparentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4.07143V19.9286C16.4286 19.9286 19.9286 16.4286 19.9286 12C19.9286 7.57143 16.4286 4.07143 12 4.07143Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>;
const ColorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>;
const AdjustIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414 1.414M12 16a4 4 0 110-8 4 4 0 010 8z" /></svg>;
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;


const OptionButton: React.FC<{ icon: React.ReactNode; label: string; isActive?: boolean; onClick?: () => void; }> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-primary text-white' : 'bg-surface-light text-text-dark hover:bg-gray-700'}`}>
        {icon}
        <span>{label}</span>
    </button>
);

interface BackgroundPanelProps {
  onRemoveBackground: () => void;
  onReplaceBackground: (prompt: string) => void;
  onColorBackground: (color: string) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ onRemoveBackground, onReplaceBackground, onColorBackground }) => {
  const [mode, setMode] = useState<'replace' | 'transparent' | 'color' | 'adjust'>('transparent');
  const [replacePrompt, setReplacePrompt] = useState('');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const handleApply = () => {
    switch (mode) {
      case 'transparent':
        onRemoveBackground();
        break;
      case 'replace':
        if (replacePrompt) onReplaceBackground(replacePrompt);
        break;
      case 'color':
        onColorBackground(bgColor);
        break;
      case 'adjust':
        // No-op for now, feature to be added
        break;
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'transparent': return 'Remove Background';
      case 'replace': return 'Replace Background';
      case 'color': return 'Apply Color';
      case 'adjust': return 'Apply Adjustments';
      default: return 'Apply';
    }
  };

  const isApplyDisabled = (mode === 'replace' && !replacePrompt) || mode === 'adjust';

  return (
    <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-text-light">Background</h3>
      </header>
      
      <div className="grid grid-cols-4 gap-2">
        <OptionButton icon={<ReplaceIcon />} label="Replace" isActive={mode === 'replace'} onClick={() => setMode('replace')} />
        <OptionButton icon={<TransparentIcon />} label="Transparent" isActive={mode === 'transparent'} onClick={() => setMode('transparent')} />
        <OptionButton icon={<ColorIcon />} label="Color" isActive={mode === 'color'} onClick={() => setMode('color')} />
        <OptionButton icon={<AdjustIcon />} label="Adjust" isActive={mode === 'adjust'} onClick={() => setMode('adjust')} />
      </div>

      <div className="flex-grow py-4 min-h-[120px]">
        {mode === 'replace' && (
          <div className="animate-fade-in">
            <label className="text-xs text-text-dark mb-2 block">Describe the new background:</label>
            <textarea
              placeholder="e.g., a beautiful beach at sunset, a futuristic cityscape..."
              value={replacePrompt}
              onChange={e => setReplacePrompt(e.target.value)}
              className="w-full h-24 bg-surface-light p-2 rounded-lg text-text-light focus:ring-primary focus:border-primary border border-transparent resize-none"
            />
          </div>
        )}
        {mode === 'color' && (
          <div className="flex items-center gap-4 p-2 bg-surface-light rounded-lg animate-fade-in">
            <label htmlFor="bg-color-picker" className="text-text-light font-semibold">Choose a color:</label>
            <input
              id="bg-color-picker"
              type="color"
              value={bgColor}
              onChange={e => setBgColor(e.target.value)}
              className="w-10 h-10 border-none rounded-md cursor-pointer bg-transparent"
            />
          </div>
        )}
         {mode === 'adjust' && (
          <div className="text-center text-text-dark p-4 animate-fade-in">
            <p>Background adjustment tools like blur and desaturation are coming soon!</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleApply}
        disabled={isApplyDisabled}
        className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed"
      >
        {getButtonText()}
        <SparklesIcon className="ml-2"/>
      </button>
    </div>
  );
};