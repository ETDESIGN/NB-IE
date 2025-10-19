
import React, { useState, ReactNode } from 'react';
import type { Adjustments } from '../../types';

const ChevronDownIcon = ({ open }: { open: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M232.12,143.08a8,8,0,0,0-8.24-7.06,80,80,0,1,1-7.76-84.34,8,8,0,0,0,6.4-14.26,95.73,95.73,0,0,0-26-15.82,8,8,0,0,0-10.4,5.43,80.12,80.12,0,0,1-135,53.8,8,8,0,0,0-13.68,7.92,96,96,0,1,0,192.44,14.33A8,8,0,0,0,232.12,143.08Z"></path></svg>;
const FlipHorizontalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m-7 9h14M5 3l14 18M19 3L5 21" /></svg>;
const FlipVerticalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M21 5l-18 14M21 19L3 5" /></svg>;


const CollapsibleSection: React.FC<{ title: string; children: ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-surface-light rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 font-semibold text-text-light">
                <span>{title}</span>
                <ChevronDownIcon open={isOpen} />
            </button>
            {isOpen && <div className="p-3 border-t border-surface">{children}</div>}
        </div>
    );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; onReset: () => void; unit?: string }> = ({ label, value, min, max, step, onChange, onReset, unit = '' }) => {
    return (
        <div>
            <div className="flex justify-between items-center text-sm text-text-dark mb-1">
                <label className="text-text-light">{label}</label>
                <div className="flex items-center space-x-2">
                    <span className="font-mono">{value}{unit}</span>
                    <button onClick={onReset} className="text-text-dark hover:text-text-light"><ResetIcon /></button>
                </div>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-surface rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>
    );
};

interface AdjustPanelProps {
    adjustments: Adjustments;
    onAdjustmentsChange: (adjustments: Adjustments) => void;
    onApply: () => void;
    onReset: () => void;
}

export const AdjustPanel: React.FC<AdjustPanelProps> = ({ adjustments, onAdjustmentsChange, onApply, onReset }) => {
    const updateAdjustment = <K extends keyof Adjustments>(key: K, value: Adjustments[K]) => {
        onAdjustmentsChange({ ...adjustments, [key]: value });
    };
    
    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
            <div className="flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-text-light">Adjust</h3>
                <button onClick={onReset} className="text-sm text-primary hover:underline font-semibold">Reset All</button>
            </div>

            <div className="flex-grow space-y-2 overflow-y-auto -mr-4 pr-4">
                <CollapsibleSection title="Light" defaultOpen>
                    <div className="space-y-4">
                        <Slider label="Exposure" value={adjustments.exposure} min={-100} max={100} step={1} onChange={v => updateAdjustment('exposure', v)} onReset={() => updateAdjustment('exposure', 0)} />
                        <Slider label="Brightness" value={adjustments.brightness} min={0} max={200} step={1} onChange={v => updateAdjustment('brightness', v)} onReset={() => updateAdjustment('brightness', 100)} unit="%" />
                        <Slider label="Contrast" value={adjustments.contrast} min={0} max={200} step={1} onChange={v => updateAdjustment('contrast', v)} onReset={() => updateAdjustment('contrast', 100)} unit="%" />
                        <Slider label="Highlights" value={adjustments.highlights} min={-100} max={100} step={1} onChange={v => updateAdjustment('highlights', v)} onReset={() => updateAdjustment('highlights', 0)} />
                        <Slider label="Shadows" value={adjustments.shadows} min={-100} max={100} step={1} onChange={v => updateAdjustment('shadows', v)} onReset={() => updateAdjustment('shadows', 0)} />
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Color" defaultOpen>
                     <div className="space-y-4">
                        <Slider label="Saturation" value={adjustments.saturation} min={0} max={200} step={1} onChange={v => updateAdjustment('saturation', v)} onReset={() => updateAdjustment('saturation', 100)} unit="%" />
                        <Slider label="Temperature" value={adjustments.temperature} min={-100} max={100} step={1} onChange={v => updateAdjustment('temperature', v)} onReset={() => updateAdjustment('temperature', 0)} />
                        <Slider label="Hue" value={adjustments.hue} min={0} max={360} step={1} onChange={v => updateAdjustment('hue', v)} onReset={() => updateAdjustment('hue', 0)} unit="°" />
                    </div>
                </CollapsibleSection>
                 <CollapsibleSection title="Grain">
                    <div className="space-y-4">
                       <Slider label="Amount" value={adjustments.grainAmount} min={0} max={100} step={1} onChange={v => updateAdjustment('grainAmount', v)} onReset={() => updateAdjustment('grainAmount', 0)} unit="%" />
                    </div>
                </CollapsibleSection>
                <CollapsibleSection title="Rotate">
                     <div className="space-y-4">
                        <Slider label="Straighten" value={adjustments.straighten} min={-45} max={45} step={1} onChange={v => updateAdjustment('straighten', v)} onReset={() => updateAdjustment('straighten', 0)} unit="°" />
                         <div className="flex justify-around">
                            <button className="p-2 bg-surface rounded-md hover:bg-gray-600"><FlipHorizontalIcon /></button>
                            <button className="p-2 bg-surface rounded-md hover:bg-gray-600"><FlipVerticalIcon /></button>
                         </div>
                    </div>
                </CollapsibleSection>
            </div>
            
            <div className="flex-shrink-0">
                <button onClick={onApply} className="w-full p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors">Apply Adjustments</button>
            </div>

        </div>
    );
};