import React from 'react';
import type { AspectRatio, ModalType, SavedScene, Character } from '../types';

// --- ICONS ---
const DiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10V3L5.14 10.36a1 1 0 000 1.28L14 21v-7M2.86 11.64h11.43" transform="rotate(45 12 12) scale(0.8)"/><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
const ModelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ImageRefIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const StyleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const CompositionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const EffectsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>;
const CharacterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const ObjectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const SceneTabIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ColorsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0010.828 8H7zm0 0v-4a2 2 0 012-2h2" /></svg>;
const StackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>;
const AspectRatioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 0M21 6l-3 0M12 3l0 3M12 21l0-3M6 12l-3 0M18 12l3 0" /><path d="M4 4h16v16H4z" /></svg>;
const ShuffleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M4 20L20 4M20 16v5h-5M4 4l5 5" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 0010.828 8H7zm0 0v-4a2 2 0 012-2h2" /></svg>;


interface SmartPanelProps {
  mainImage: string | null;
  onStartOver: () => void;
  disabled?: boolean;
  generationPrompt: string;
  onGenerationPromptChange: (value: string) => void;
  aspectRatio: AspectRatio;
  numberOfImages: number;
  onNumberOfImagesChange: (value: number) => void;
  onGenerate: () => void;
  onUpload: () => void;
  setActiveModal: (modal: ModalType) => void;
  generationTags: Set<string>;
  onTagToggle: (tag: string) => void;
  generationModel: string;
  onGenerationModelChange: (value: string) => void;
  isAiPromptEnhancementEnabled: boolean;
  onAiPromptEnhancementChange: (enabled: boolean) => void;
  onRandomPrompt: () => void;
  imageReferences: string[];
  onAddImageReferenceClick: () => void;
  onRemoveImageReference: (index: number) => void;
  styleReference: string | null;
  onAddStyleReferenceClick: () => void;
  onRemoveStyleReference: () => void;
  sceneReference: SavedScene | null;
  onSetSceneReference: (scene: SavedScene | null) => void;
  sceneCompositionMode: 'background' | 'recompose_real' | 'recompose_inferred';
  onSetSceneCompositionMode: (mode: 'background' | 'recompose_real' | 'recompose_inferred') => void;
  onRandomStyle: () => void;
  activeCharacterContext: Character | null;
  onClearCharacterContext: () => void;
  selectedSceneImageForComposition: string | null;
  onSetSelectedSceneImageForComposition: (image: string) => void;
}

const ControlRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ icon, label, onClick, children }) => (
  <div
    className={`flex items-center justify-between p-3 bg-surface-light rounded-lg ${onClick ? 'cursor-pointer hover:bg-gray-700' : ''} transition-colors`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className="font-semibold text-text-light">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {children}
      {onClick && <ChevronRightIcon />}
    </div>
  </div>
);


export const SmartPanel: React.FC<SmartPanelProps> = (props) => {
    
    const hasPromptOrTags = props.generationPrompt.length > 0 || props.generationTags.size > 0 || !!props.activeCharacterContext;

    return (
        <div className="p-4 flex flex-col h-full bg-surface text-sm space-y-4 overflow-y-auto">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-light">Generate images</h3>
                 {props.mainImage && (
                    <button onClick={props.onStartOver} className="text-sm font-semibold text-primary hover:underline">+ Start Over</button>
                )}
            </div>
            
            <div className="p-3 bg-surface-light rounded-lg">
                <textarea 
                    placeholder="Describe your image or upload" 
                    value={props.generationPrompt} 
                    onChange={e => props.onGenerationPromptChange(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-text-light placeholder-text-dark resize-none h-20"
                />
                
                {props.activeCharacterContext && (
                    <div className="mt-2 space-y-1">
                        <div key={props.activeCharacterContext.id} className="p-1 bg-surface rounded-lg flex items-center justify-between animate-fade-in">
                            <div className="flex items-center space-x-2">
                                <img src={props.activeCharacterContext.avatar} alt={props.activeCharacterContext.name} className="w-6 h-6 rounded-md object-cover" />
                                <p className="font-semibold text-sm text-text-light">{props.activeCharacterContext.name}</p>
                            </div>
                            <button 
                                onClick={() => props.onClearCharacterContext()} 
                                className="text-text-dark hover:text-white bg-surface-light w-5 h-5 rounded-full text-xs flex items-center justify-center font-mono"
                                title={`Remove ${props.activeCharacterContext.name}`}
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}


                 <span className="text-blue-400 cursor-pointer hover:underline" onClick={props.onUpload}>upload</span>
                <div className="flex items-center justify-between mt-2">
                    <label htmlFor="ai-prompt-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="ai-prompt-toggle" className="sr-only" checked={props.isAiPromptEnhancementEnabled} onChange={e => props.onAiPromptEnhancementChange(e.target.checked)} />
                            <div className="block bg-surface w-10 h-6 rounded-full"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                        <div className="ml-3 text-text-dark font-medium">AI prompt</div>
                    </label>
                    <button onClick={props.onRandomPrompt} className="text-text-dark hover:text-text-light transition-colors"><DiceIcon /></button>
                </div>
            </div>

            {props.generationTags.size > 0 && (
                <div className="p-3 bg-surface-light rounded-lg flex flex-wrap gap-2 animate-fade-in">
                    {Array.from(props.generationTags).map(tag => (
                        <div key={tag} className="bg-primary/30 text-primary-hover text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                            <span>{tag}</span>
                            <button onClick={() => props.onTagToggle(tag)} className="ml-1.5 text-primary-hover hover:text-white">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                <div className="flex items-center space-x-3">
                    <ModelIcon />
                    <label htmlFor="model-select" className="font-semibold text-text-light">Model</label>
                </div>
                <select
                    id="model-select"
                    value={props.generationModel}
                    onChange={e => props.onGenerationModelChange(e.target.value)}
                    className="bg-surface border-none text-text-dark font-mono text-xs rounded focus:ring-primary focus:outline-none p-1"
                >
                    <option value="imagen-4.0-generate-001">Imagen 4.0</option>
                    <option value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash</option>
                    {/* Add other models here as they become available */}
                </select>
            </div>
            
             <div className="p-3 bg-surface-light rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <PaletteIcon />
                        <span className="font-semibold text-text-light">Style Reference</span>
                    </div>
                </div>
                 <div className="flex">
                    {props.styleReference ? (
                         <div className="relative group">
                            <img src={props.styleReference} alt="Style Reference" className="w-20 h-20 object-cover rounded-md" />
                            <button onClick={props.onRemoveStyleReference} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                        </div>
                    ) : (
                        <button onClick={props.onAddStyleReferenceClick} className="w-20 h-20 bg-surface border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-text-dark hover:border-gray-500 hover:text-text-light transition-colors">
                            <PlusIcon />
                            <span className="text-xs mt-1">Add Style</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className="p-3 bg-surface-light rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <SceneTabIcon />
                        <span className="font-semibold text-text-light">Scene Reference</span>
                    </div>
                </div>
                <div className="flex">
                    {props.sceneReference ? (
                        <div className="p-2 bg-surface rounded-lg w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                     <img src={props.sceneReference.avatar} alt="Scene Reference" className="w-10 h-10 object-cover rounded-md" />
                                     <p className="font-semibold text-text-light">{props.sceneReference.name}</p>
                                </div>
                                <button onClick={() => props.onSetSceneReference(null)} className="text-text-dark hover:text-white">&times;</button>
                            </div>
                            <div className="mt-2 space-y-2 text-sm">
                                <p className="text-xs text-text-dark">Composition Mode:</p>
                                <select value={props.sceneCompositionMode} className="w-full bg-surface-light p-1 rounded-md text-text-light focus:ring-primary focus:border-primary" onChange={e => props.onSetSceneCompositionMode(e.target.value as any)}>
                                    <option value="background">1. Use as Background</option>
                                    <option value="recompose_real">2. Recompose (Factual)</option>
                                    <option value="recompose_inferred">3. Recompose (Inferred)</option>
                                </select>
                                 {props.sceneCompositionMode === 'background' && (
                                    <div className="mt-2 pt-2 border-t border-surface">
                                        <p className="text-xs text-text-dark mb-1">Select Background:</p>
                                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                                            {props.sceneReference.userImages.map((img, index) => (
                                                <button key={index} onClick={() => props.onSetSelectedSceneImageForComposition(img)} className="rounded-md focus:outline-none">
                                                    <img
                                                        src={img}
                                                        alt={`Scene background option ${index + 1}`}
                                                        className={`w-14 h-14 object-cover rounded-md border-2 transition-all ${props.selectedSceneImageForComposition === img ? 'border-primary scale-105' : 'border-transparent hover:border-surface-light'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => props.setActiveModal('scene')} className="w-20 h-20 bg-surface border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-text-dark hover:border-gray-500 hover:text-text-light transition-colors">
                            <PlusIcon />
                            <span className="text-xs mt-1">Add Scene</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-3 bg-surface-light rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ImageRefIcon />
                        <span className="font-semibold text-text-light">Content References</span>
                    </div>
                    <span className="text-text-dark">{props.imageReferences.length}/8</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {props.imageReferences.map((imgSrc, index) => (
                        <div key={index} className="relative group">
                            <img src={imgSrc} alt={`Reference ${index+1}`} className="w-20 h-20 object-cover rounded-md" />
                            <button onClick={() => props.onRemoveImageReference(index)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">&times;</button>
                        </div>
                    ))}
                    {props.imageReferences.length < 8 && (
                        <button onClick={props.onAddImageReferenceClick} className="w-20 h-20 bg-surface border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-text-dark hover:border-gray-500 hover:text-text-light transition-colors">
                            <PlusIcon />
                            <span className="text-xs mt-1">Add</span>
                        </button>
                    )}
                </div>
            </div>

            <ControlRow icon={<StyleIcon />} label="Style" onClick={() => props.setActiveModal('style')}>
                <div className="flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); props.onRandomStyle(); }} className="p-1.5 bg-surface rounded-md hover:bg-gray-600 transition-colors"><ShuffleIcon /></button>
                    <button onClick={(e) => { e.stopPropagation(); props.setActiveModal('style'); }} className="p-1.5 bg-surface rounded-md hover:bg-gray-600 transition-colors"><PlusIcon /></button>
                </div>
            </ControlRow>
            <ControlRow icon={<CompositionIcon />} label="Composition" onClick={() => props.setActiveModal('composition')} />
            <ControlRow icon={<EffectsIcon />} label="Effects" onClick={() => props.setActiveModal('effects')} />
            <ControlRow icon={<CharacterIcon />} label="Character" onClick={() => props.setActiveModal('character')} />
            <ControlRow icon={<ObjectIcon />} label="Object" onClick={() => props.setActiveModal('object')} />
            <ControlRow icon={<ColorsIcon />} label="Colors" onClick={() => props.setActiveModal('colors')} />

            <div className="flex-grow"></div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                    <StackIcon />
                    <div className="flex items-center space-x-4">
                        <button onClick={() => props.onNumberOfImagesChange(Math.max(1, props.numberOfImages - 1))} className="text-xl">-</button>
                        <span className="font-bold text-lg">{props.numberOfImages}</span>
                        <button onClick={() => props.onNumberOfImagesChange(props.numberOfImages + 1)} className="text-xl">+</button>
                    </div>
                </div>
                 <div
                    className="flex items-center justify-between p-3 bg-surface-light rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => props.setActiveModal('aspectRatio')}
                >
                    <div className="flex items-center space-x-3">
                      <AspectRatioIcon />
                      <span className="font-semibold text-text-light">{props.aspectRatio}</span>
                    </div>
                    <ChevronRightIcon />
                </div>
            </div>

            <button onClick={props.onGenerate} disabled={props.disabled || (!hasPromptOrTags && !props.styleReference && !props.sceneReference && props.imageReferences.length === 0)} className="w-full flex items-center justify-center p-3 bg-gray-300 text-black font-bold rounded-lg hover:bg-white transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                {props.mainImage ? 'Regenerate / Modify' : 'Generate'}
                <SparklesIcon className="ml-2"/>
            </button>
            <style>{`
                #ai-prompt-toggle:checked ~ .dot {
                    transform: translateX(100%);
                    background-color: #8A2BE2;
                }
           `}</style>
        </div>
    );
};