import React from 'react';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>;

interface ZoomControlsProps {
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset }) => {
    return (
        <div className="absolute bottom-24 right-4 bg-surface/80 backdrop-blur-sm rounded-lg flex items-center shadow-lg text-text-light text-sm font-semibold z-20">
            <button onClick={onZoomOut} className="p-2.5 hover:bg-surface-light rounded-l-lg transition-colors" title="Zoom Out" disabled={zoomLevel <= 0.1}>
                <MinusIcon />
            </button>
            <button onClick={onZoomReset} className="px-4 py-2.5 border-x border-surface-light hover:bg-surface-light transition-colors" title="Reset Zoom">
                {Math.round(zoomLevel * 100)}%
            </button>
            <button onClick={onZoomIn} className="p-2.5 hover:bg-surface-light rounded-r-lg transition-colors" title="Zoom In" disabled={zoomLevel >= 10}>
                <PlusIcon />
            </button>
        </div>
    );
};
