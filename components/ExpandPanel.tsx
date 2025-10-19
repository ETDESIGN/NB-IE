import React from 'react';

interface ExpandPanelProps {
  onExpand: () => void;
}

const ExpandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /></svg>;

export const ExpandPanel: React.FC<ExpandPanelProps> = ({ onExpand }) => {
  return (
    <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
      <h3 className="text-lg font-bold text-text-light">Expand Canvas</h3>
      <div className="p-4 bg-surface-light rounded-lg text-text-dark text-sm">
        <p className="mb-2">This tool adds a transparent border around your image, allowing you to extend it using generative fill.</p>
        <p>After expanding, the new area will be automatically selected. Just describe what you want to add in the 'Select & Edit' panel and click 'Apply Edit'.</p>
      </div>
      <div className="flex-grow"></div>
      <button 
        onClick={onExpand} 
        className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
      >
        <ExpandIcon />
        Expand Canvas by 25%
      </button>
    </div>
  );
};
