import React, { useState, useEffect, useRef } from 'react';
import type { ImageAnalysis, ColorInfo, CustomPalette } from '../../types';

interface AnalyzePanelProps {
    analysisResult: ImageAnalysis | null;
    onAnalyze: () => void;
    onModifyColor: (oldColor: string, newColor: string) => void;
    onModifyMood: (mood: string) => void;
    onSelectColor: (colorName: string) => void;
    onSelectObject: (objectName: string) => void;
    onRemoveObject: (objectName: string) => void;
    onSaveObject: (objectName: string) => void;
    onRestyleImage: (prompt: string) => void;
    onSavePalette: (colors: ColorInfo[]) => void;
    suggestedPresets: string[];
    onApplySuggestedAdjustment: (prompt: string) => void;
    onAddPalette: (palettes: CustomPalette[]) => void; // This seems redundant with onSavePalette, but keeping as per request
}

// --- ICONS ---
const SelectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M152,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,40Zm-8,168H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM208,32H184a8,8,0,0,0,0,16h24V72a8,8,0,0,0,16,0V48A16,16,0,0,0,208,32Zm8,72a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,216,104Zm0,72a8,8,0,0,0-8,8v24H184a8,8,0,0,0,0,16h24a16,16,0,0,0,16-16V184A8,8,0,0,0,216,176ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM72,32H48A16,16,0,0,0,32,48V72a8,8,0,0,0,16,0V48H72a8,8,0,0,0,0-16Z"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152,28.56,192.8a15.8,15.8,0,0,0,19.64,19.64L88.9,214.31,212,88.9a16,16,0,0,0,22.63-22.63ZM160,100,80.37,179.67,62.14,194.52,41.48,173.86,121.14,94.19,100,73l42.63,42.62-11.32-11.31L160,100ZM171.31,88.68,136,53.37,152.69,36.68,197.37,81.37Z"></path></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z"></path></svg>;
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;


const EditableColorSwatch: React.FC<{ color: ColorInfo, onSelect: (name: string) => void, onModify: (oldName: string, newName: string) => void }> = ({ color, onSelect, onModify }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newValue, setNewValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleStartEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewValue(color.name);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (newValue.trim() && newValue.trim() !== color.name) {
            onModify(color.name, newValue.trim());
        }
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="flex items-center space-x-2 p-1 rounded-md bg-surface">
                 <div className="w-6 h-6 rounded-full border-2 border-surface flex-shrink-0" style={{ backgroundColor: color.hex }} />
                <input 
                    ref={inputRef}
                    type="text" 
                    value={newValue} 
                    onChange={(e) => setNewValue(e.target.value)} 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                    }}
                    onBlur={handleSave}
                    placeholder="e.g., vibrant red or #FF0000"
                    className="w-full bg-surface-light text-text-light text-sm p-1 rounded focus:ring-primary focus:border-primary border-none"
                />
            </div>
        )
    }

    return (
        <div className="group flex items-center justify-between p-1 rounded-md hover:bg-surface transition-colors">
            <div onClick={handleStartEditing} className="flex items-center space-x-2 text-left w-full cursor-pointer">
                <div className="w-6 h-6 rounded-full border-2 border-surface flex-shrink-0" style={{ backgroundColor: color.hex }} />
                <div>
                    <p className="text-sm font-semibold text-text-light">{color.name}</p>
                    <p className="text-xs text-text-dark font-mono">{color.hex}</p>
                </div>
            </div>
            <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity text-text-dark pl-2">
                <button onClick={(e) => {e.stopPropagation(); onSelect(color.name)}} title={`Select ${color.name} on canvas`} className="hover:text-primary"><SelectIcon /></button>
            </div>
        </div>
    );
};

const InteractiveObjectTag: React.FC<{ name: string, onSelect: (name: string) => void, onRemove: (name: string) => void, onSave: (name: string) => void }> = ({ name, onSelect, onRemove, onSave }) => {
    return (
        <div className="group flex items-center bg-surface px-3 py-1 rounded-full text-sm text-text-light hover:bg-surface-light transition-colors">
             <button onClick={() => onSelect(name)} className="hover:text-primary transition-colors focus:outline-none mr-2">
                {name}
             </button>
             {/* Action buttons appear on hover */}
             <button 
                onClick={(e) => { e.stopPropagation(); onRemove(name); }} 
                title={`Remove ${name}`} 
                className="text-text-dark hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:outline-none text-xl leading-none"
             >
                &times;
             </button>
             <button 
                onClick={(e) => { e.stopPropagation(); onSave(name); }} 
                title={`Save ${name} to objects`} 
                className="ml-1 text-text-dark hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:outline-none"
            >
                <SaveIcon />
             </button>
        </div>
    );
}

const EditableAnalysisField: React.FC<{ title: string; value: string | string[]; onEdit: (prompt: string) => void; instructionPrefix: string; }> = ({ title, value, onEdit, instructionPrefix }) => {
    const [isEditing, setIsEditing] = useState(false);
    const initialValue = Array.isArray(value) ? value.join(', ') : value;
    const [currentValue, setCurrentValue] = useState(initialValue);

    useEffect(() => {
        setCurrentValue(Array.isArray(value) ? value.join(', ') : value);
    }, [value]);

    const handleApply = () => {
        if (currentValue.trim() && currentValue.trim().toLowerCase() !== initialValue.toLowerCase()) {
            onEdit(`${instructionPrefix} ${currentValue}`);
        }
        setIsEditing(false);
    };

    const displayValue = Array.isArray(value) && value.length > 0 ? 
        (<div className="flex flex-wrap gap-2">{value.map(v => <span key={v} className="px-2 py-1 bg-surface text-text-dark text-xs rounded-full">{v}</span>)}</div>)
        : (<p className="text-text-light capitalize">{Array.isArray(value) ? 'Not detected' : value}</p>);

    return (
        <div className="p-3 bg-surface-light rounded-lg group">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-text-light">{title}</h4>
                <button onClick={() => setIsEditing(true)} title={`Edit ${title}`} className="text-text-dark hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><EditIcon /></button>
            </div>
            {isEditing ? (
                <div className="flex flex-col space-y-2">
                    <textarea 
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="w-full bg-surface text-text-light p-2 rounded-md border border-surface-light focus:ring-2 focus:ring-primary text-sm"
                        autoFocus
                        onBlur={handleApply}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleApply(); }}}
                    />
                    <div className="flex justify-end space-x-2">
                         <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs rounded-md bg-surface hover:bg-gray-600">Cancel</button>
                         <button onClick={handleApply} className="px-3 py-1 text-xs rounded-md bg-primary hover:bg-primary-hover text-white">Apply</button>
                    </div>
                </div>
            ) : displayValue}
        </div>
    );
};


export const AnalyzePanel: React.FC<AnalyzePanelProps> = ({ 
    analysisResult, onAnalyze, onModifyColor, onModifyMood, onSelectColor, onSelectObject, onRemoveObject, onSaveObject, onRestyleImage, onSavePalette, suggestedPresets, onApplySuggestedAdjustment
}) => {
    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4">
            <h3 className="text-lg font-bold text-text-light">Image Analysis</h3>

            {!analysisResult && (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-surface-light rounded-lg">
                    <p className="text-text-dark">Analyze your image to get AI-powered insights on colors, objects, and mood.</p>
                    <button
                        onClick={onAnalyze}
                        className="mt-4 w-full p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Analyze Image
                    </button>
                </div>
            )}

            {analysisResult && (
                <div className="flex-grow space-y-4 animate-fade-in overflow-y-auto pr-2 -mr-2">
                    <div className="p-3 bg-surface-light rounded-lg">
                        <h4 className="font-semibold text-text-light mb-2">Dominant Colors</h4>
                        <div className="space-y-1">
                            {analysisResult.dominantColors.map(color => (
                                <EditableColorSwatch key={color.hex} color={color} onSelect={onSelectColor} onModify={onModifyColor} />
                            ))}
                        </div>
                        <button onClick={() => onSavePalette(analysisResult.dominantColors)} className="mt-3 w-full text-xs text-center p-2 rounded-md bg-surface hover:bg-gray-600 transition-colors font-semibold">
                            Save as Palette
                        </button>
                    </div>
                    <div className="p-3 bg-surface-light rounded-lg">
                        <h4 className="font-semibold text-text-light mb-2">Identified Objects</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.objects.map(obj => (
                                <InteractiveObjectTag key={obj} name={obj} onSelect={onSelectObject} onRemove={onRemoveObject} onSave={onSaveObject} />
                            ))}
                        </div>
                    </div>
                    
                    {suggestedPresets && suggestedPresets.length > 0 && (
                         <div className="p-3 bg-surface-light rounded-lg">
                            <h4 className="font-semibold text-text-light mb-2">Suggestions</h4>
                            <div className="flex flex-col space-y-2">
                                {suggestedPresets.map((suggestion, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => onApplySuggestedAdjustment(suggestion)} 
                                        className="w-full text-left p-2 rounded-md bg-surface hover:bg-gray-600 transition-colors text-text-dark hover:text-text-light text-sm flex items-center"
                                    >
                                        <SparklesIcon className="mr-2 text-primary flex-shrink-0" />
                                        <span>{suggestion}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <EditableAnalysisField
                        title="Overall Mood"
                        value={analysisResult.mood}
                        onEdit={onModifyMood}
                        instructionPrefix="Adjust the image to have a mood that is"
                    />
                    
                    {analysisResult.composition && (
                        <EditableAnalysisField 
                            title="Composition" 
                            value={analysisResult.composition} 
                            onEdit={onRestyleImage} 
                            instructionPrefix="Recompose the image with a focus on" 
                        />
                    )}
                    {analysisResult.lighting && (
                        <EditableAnalysisField 
                            title="Lighting" 
                            value={analysisResult.lighting} 
                            onEdit={onRestyleImage} 
                            instructionPrefix="Change the lighting to" 
                        />
                    )}
                     {analysisResult.artisticStyle && (
                        <EditableAnalysisField 
                            title="Artistic Style" 
                            value={analysisResult.artisticStyle} 
                            onEdit={onRestyleImage} 
                            instructionPrefix="Change the artistic style to" 
                        />
                    )}

                     <button
                        onClick={onAnalyze}
                        className="w-full p-2 mt-4 bg-surface-light text-text-light font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Re-Analyze
                    </button>
                </div>
            )}
        </div>
    );
};