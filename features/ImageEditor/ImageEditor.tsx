import React, { useRef } from 'react';
import useAppStore from '../../store/appStore';
import { Toolbar } from '../../components/Toolbar';
import { EditingToolbar } from '../../components/EditingToolbar';
import { Canvas } from '../../components/Canvas';
import { ThumbnailStrip } from '../../components/ThumbnailStrip';
import { ConversationalCanvas } from '../../components/ConversationalCanvas';
import { SelectBottomBar } from '../../components/bottombars/SelectBottomBar';
// Assume CropBottomBar exists
// import { CropBottomBar } from '../../components/bottombars/CropBottomBar';
import { RightPanel } from '../../components/RightPanel';
import { ZoomControls } from '../../components/ZoomControls';

const CropBottomBar: React.FC<any> = () => null; // Placeholder

export const ImageEditor: React.FC = () => {
    const store = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            store.handleImageUpload(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const renderBottomBar = () => {
        switch (store.activeTool) {
            case 'select':
                return <SelectBottomBar 
                          isLoading={!!store.loadingMessage}
                          editPrompt={store.editPrompt}
                          onEditPromptChange={store.setEditPrompt}
                          onApplyEdit={store.handleApplyEdit}
                          onAISelect={store.handleAISelect}
                          brushSize={store.brushSize}
                          onBrushSizeChange={store.setBrushSize}
                          retouchMode={store.retouchMode}
                          onRetouchModeChange={store.setRetouchMode}
                          selectionMode={store.selectionMode}
                          onSelectionModeChange={store.setSelectionMode}
                       />;
            case 'crop':
                 return <CropBottomBar 
                          isLoading={!!store.loadingMessage}
                          onApplyCrop={() => {}}
                          onCancelCrop={() => store.handleToolSelect('select')}
                          aspectRatio={store.cropAspectRatio}
                          onAspectRatioChange={store.setCropAspectRatio}
                        />;
            default:
                return <ConversationalCanvas
                          isLoading={!!store.loadingMessage}
                          onCommandSubmit={store.handleCommandSubmit}
                          onVisualSubmit={() => {}}
                          hasAnnotations={store.annotations.length > 0}
                          onUploadClick={handleUploadClick}
                          aiMode={store.aiMode}
                          onAiModeChange={(mode) => {}}
                      />;
        }
    };
    
    return (
        <>
            <Toolbar 
                activeTool={store.activeTool} 
                onSelectTool={store.handleToolSelect}
                onDownload={store.handleDownload}
                canDownload={!!store.currentImage}
            />
             <main className="flex-1 flex flex-col relative">
                {store.currentImage && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 animate-fade-in">
                        <EditingToolbar
                            onUndo={store.undo}
                            canUndo={store.getCanUndo()}
                            onRedo={store.redo}
                            canRedo={store.getCanRedo()}
                            onReset={() => store.reset()}
                            onCompareToggle={() => {}}
                        />
                    </div>
                )}
                <div className="flex-grow relative">
                    <div className="absolute inset-0 p-8">
                        <Canvas
                            image={store.isComparing ? store.history[0] : store.currentImage}
                            selectionMask={store.selectionMask}
                            aspectRatio={store.canvasAspectRatio}
                            annotations={store.annotations}
                            onAddAnnotation={(x, y) => store.setAnnotations(prev => [...prev, {id: `anno-${Date.now()}`, x, y, text: ''}])}
                            onUpdateAnnotationText={(id, text) => store.setAnnotations(p => p.map(a => a.id === id ? {...a, text} : a))}
                            onDeleteAnnotation={(id) => store.setAnnotations(p => p.filter(a => a.id !== id))}
                            onMaskChange={store.setSelectionMask}
                            isDrawingEnabled={store.activeTool === 'select'}
                            brushSize={store.brushSize}
                            retouchMode={store.retouchMode}
                            isCroppingEnabled={store.activeTool === 'crop'}
                            cropBox={store.cropBox}
                            onCropBoxChange={store.setCropBox}
                            cropAspectRatio={store.cropAspectRatio}
                            liveAdjustments={store.activeTool === 'adjust' ? store.panelAdjustments : { exposure: 0, brightness: 100, contrast: 100, highlights: 0, shadows: 0, saturation: 100, temperature: 0, hue: 0, tintColor: '', tintBlendMode: 'screen', tintOpacity: 0, grainAmount: 0, straighten: 0, flip: 'none' }}
                            zoomLevel={store.zoomLevel}
                            onZoomChange={store.setZoomLevel}
                            panOffset={store.panOffset}
                            onPanChange={store.setPanOffset}
                            selectionMode={store.selectionMode}
                        />
                        {store.currentImage && (
                            <ZoomControls 
                                zoomLevel={store.zoomLevel}
                                onZoomIn={() => store.setZoomLevel(store.zoomLevel * 1.2)}
                                onZoomOut={() => store.setZoomLevel(store.zoomLevel / 1.2)}
                                onZoomReset={() => { store.setZoomLevel(1); store.setPanOffset({x: 0, y: 0})}}
                            />
                        )}
                    </div>
                </div>
                {store.generatedImages.length > 1 && (
                    <ThumbnailStrip images={store.generatedImages} selectedImage={store.currentImage} onSelectImage={(img) => store.setCurrentImage(img, false)} />
                )}
                {renderBottomBar()}
            </main>

            <RightPanel
                mainImage={store.currentImage}
                onStartOver={() => store.reset(null)}
                isApiOffline={store.isApiOffline}
                activeTool={store.activeTool}
                generationPrompt={store.generationPrompt}
                onGenerationPromptChange={store.setGenerationPrompt}
                aspectRatio={store.aspectRatio}
                numberOfImages={store.numberOfImages}
                onNumberOfImagesChange={() => {}}
                onGenerate={store.handleGenerate}
                onUpload={handleUploadClick}
                setActiveModal={store.setActiveModal}
                generationTags={store.generationTags}
                onTagToggle={() => {}}
                generationModel={store.generationModel}
                onGenerationModelChange={() => {}}
                isAiPromptEnhancementEnabled={store.isAiPromptEnhancementEnabled}
                onAiPromptEnhancementChange={() => {}}
                onRandomPrompt={() => {}}
                imageReferences={store.imageReferences}
                onAddImageReferenceClick={() => {}}
                onRemoveImageReference={() => {}}
                styleReference={store.styleReference}
                onAddStyleReferenceClick={() => {}}
                onRemoveStyleReference={() => {}}
                sceneReference={store.sceneReference}
                onSetSceneReference={() => {}}
                sceneCompositionMode={store.sceneCompositionMode}
                onSetSceneCompositionMode={() => {}}
                selectedSceneImageForComposition={store.selectedSceneImageForComposition}
                onSetSelectedSceneImageForComposition={() => {}}
                onRandomStyle={() => {}}
                adjustments={store.panelAdjustments}
                onAdjustmentsChange={store.setPanelAdjustments}
                onApplyAdjustments={store.handleApplyAdjustments}
                onResetAdjustments={store.handleResetAdjustments}
                onEnhanceImage={() => {}}
                onRemoveBackground={store.handleRemoveBackground}
                onReplaceBackground={() => {}}
                onColorBackground={() => {}}
                analysisResult={store.analysisResult}
                onAnalyzeImage={store.handleAnalyzeImage}
                onModifyColor={() => {}}
                onModifyMood={() => {}}
                activeCharacterContext={store.activeCharacterContext}
                onClearCharacterContext={() => store.setActiveCharacterContext(null)}
                onSelectColor={() => {}}
                onSelectObject={() => {}}
                onRemoveObject={() => {}}
                onSaveObject={() => {}}
                onRestyleImage={() => {}}
                onSavePalette={() => {}}
                suggestedPresets={store.suggestedPresets}
                onApplySuggestedAdjustment={() => {}}
                onAddPalette={() => {}}
            />

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </>
    );
};
