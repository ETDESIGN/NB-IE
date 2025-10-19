


import React from 'react';
import { SmartPanel } from './SmartPanel';
import { AdjustPanel } from './panels/AdjustPanel';
import { EnhancePanel } from './EnhancePanel';
import { BackgroundPanel } from './panels/BackgroundPanel';
import { AnalyzePanel } from './panels/AnalyzePanel';
import { GeneratePanel } from './panels/GeneratePanel';
import type { Tool, AspectRatio, ModalType, Adjustments, ImageAnalysis, SavedScene, Character, UserObject, CustomPalette, ColorInfo } from '../types';

interface RightPanelProps {
    mainImage: string | null;
    onStartOver: () => void;
    isApiOffline: boolean;
    activeTool: Tool;
    // Props for SmartPanel and GeneratePanel
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
    
    // Props for AdjustPanel
    adjustments: Adjustments;
    onAdjustmentsChange: (adjustments: Adjustments) => void;
    onApplyAdjustments: () => void;
    onResetAdjustments: () => void;

    // Props for EnhancePanel
    onEnhanceImage: (type: 'upscale' | 'face' | 'lighting' | 'noise', settings?: any) => void;

    // Props for BackgroundPanel
    onRemoveBackground: () => void;
    onReplaceBackground: (prompt: string) => void;
    onColorBackground: (color: string) => void;

    // Props for AnalyzePanel
    analysisResult: ImageAnalysis | null;
    onAnalyzeImage: () => void;
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
    onAddPalette: (palettes: CustomPalette[]) => void;


    // New props for character context
    activeCharacterContext: Character | null;
    onClearCharacterContext: () => void;

    // New props for scene composition
    selectedSceneImageForComposition: string | null;
    onSetSelectedSceneImageForComposition: (image: string) => void;
}

const ApiOfflineBanner: React.FC = () => (
    <div className="bg-yellow-500/20 border-l-4 border-yellow-500 text-yellow-300 p-4 text-sm" role="alert">
        <p className="font-bold">AI Features Unavailable</p>
        <p>Could not connect to the AI service. You can still use offline tools like Adjust.</p>
    </div>
);


export const RightPanel: React.FC<RightPanelProps> = (props) => {
    const renderPanel = () => {
        switch (props.activeTool) {
            case 'generate':
            case 'character':
            case 'scene':
                const smartPanelProps = {
                    mainImage: props.mainImage,
                    onStartOver: props.onStartOver,
                    disabled: props.isApiOffline,
                    generationPrompt: props.generationPrompt,
                    onGenerationPromptChange: props.onGenerationPromptChange,
                    aspectRatio: props.aspectRatio,
                    numberOfImages: props.numberOfImages,
                    onNumberOfImagesChange: props.onNumberOfImagesChange,
                    onGenerate: props.onGenerate,
                    onUpload: props.onUpload,
                    setActiveModal: props.setActiveModal,
                    generationTags: props.generationTags,
                    onTagToggle: props.onTagToggle,
                    generationModel: props.generationModel,
                    onGenerationModelChange: props.onGenerationModelChange,
                    isAiPromptEnhancementEnabled: props.isAiPromptEnhancementEnabled,
                    onAiPromptEnhancementChange: props.onAiPromptEnhancementChange,
                    onRandomPrompt: props.onRandomPrompt,
                    imageReferences: props.imageReferences,
// FIX: Corrected typo from `handleAddImageReferenceClick` to `onAddImageReferenceClick` to match prop definition.
                    onAddImageReferenceClick: props.onAddImageReferenceClick,
                    onRemoveImageReference: props.onRemoveImageReference,
                    styleReference: props.styleReference,
// FIX: Corrected typo from `handleAddStyleReferenceClick` to `onAddStyleReferenceClick` to match prop definition.
                    onAddStyleReferenceClick: props.onAddStyleReferenceClick,
                    onRemoveStyleReference: props.onRemoveStyleReference,
                    sceneReference: props.sceneReference,
                    onSetSceneReference: props.onSetSceneReference,
                    sceneCompositionMode: props.sceneCompositionMode,
                    onSetSceneCompositionMode: props.onSetSceneCompositionMode,
                    onRandomStyle: props.onRandomStyle,
                    activeCharacterContext: props.activeCharacterContext,
                    onClearCharacterContext: props.onClearCharacterContext,
                    selectedSceneImageForComposition: props.selectedSceneImageForComposition,
                    onSetSelectedSceneImageForComposition: props.onSetSelectedSceneImageForComposition,
                };
                return <SmartPanel {...smartPanelProps} />;
            case 'restyle':
                return <GeneratePanel 
                    onGenerate={props.onGenerate}
                    onAddStyleReferenceClick={props.onAddStyleReferenceClick}
                    onTagToggle={props.onTagToggle}
                />;
            case 'adjust':
            case 'auto-enhance':
                return <AdjustPanel 
                            adjustments={props.adjustments}
                            onAdjustmentsChange={props.onAdjustmentsChange}
                            onApply={props.onApplyAdjustments}
                            onReset={props.onResetAdjustments}
                        />;
            case 'enhance':
                return <EnhancePanel onEnhance={props.onEnhanceImage} />;
            case 'remove-bg':
                return <BackgroundPanel 
                            onRemoveBackground={props.onRemoveBackground}
                            onReplaceBackground={props.onReplaceBackground}
                            onColorBackground={props.onColorBackground}
                        />;
            case 'analyze':
                 return <AnalyzePanel 
                    analysisResult={props.analysisResult}
                    onAnalyze={props.onAnalyzeImage}
                    onModifyColor={props.onModifyColor}
                    onModifyMood={props.onModifyMood}
                    onSelectColor={props.onSelectColor}
                    onSelectObject={props.onSelectObject}
                    onRemoveObject={props.onRemoveObject}
                    onSaveObject={props.onSaveObject}
                    onRestyleImage={props.onRestyleImage}
                    onSavePalette={props.onSavePalette}
                    suggestedPresets={props.suggestedPresets}
                    onApplySuggestedAdjustment={props.onApplySuggestedAdjustment}
                    onAddPalette={props.onAddPalette}
                />;
            default:
                // For 'select', 'crop', etc., show a relevant panel or a default message
                if (['select', 'crop'].includes(props.activeTool) && props.mainImage) {
                    return <AnalyzePanel
                        analysisResult={props.analysisResult}
                        onAnalyze={props.onAnalyzeImage}
                        onModifyColor={props.onModifyColor}
                        onModifyMood={props.onModifyMood}
                        onSelectColor={props.onSelectColor}
                        onSelectObject={props.onSelectObject}
                        onRemoveObject={props.onRemoveObject}
                        onSaveObject={props.onSaveObject}
                        onRestyleImage={props.onRestyleImage}
                        onSavePalette={props.onSavePalette}
                        suggestedPresets={props.suggestedPresets}
                        onApplySuggestedAdjustment={props.onApplySuggestedAdjustment}
                        onAddPalette={props.onAddPalette}
                    />;
                }
                return (
                    <div className="p-4 text-center text-text-dark">
                        <p>Select a tool to see options.</p>
                        <p className="text-xs mt-2">The active tool is '{props.activeTool}'.</p>
                    </div>
                );
        }
    };
    
    return (
        <aside className="w-96 bg-surface flex-shrink-0 flex flex-col border-l border-surface-light z-20">
            {props.isApiOffline && <ApiOfflineBanner />}
            <div className="flex-grow overflow-y-auto">
               {renderPanel()}
            </div>
        </aside>
    );
};
