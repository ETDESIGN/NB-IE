import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import type {
    Tool,
    Adjustments,
    AspectRatio,
    ImageAnalysis,
    Character,
    Annotation,
    ModalType,
    UserObject,
    CustomStyle,
    CustomPalette,
    ParsedBlueprint,
    StoryboardImage,
    SavedScene,
    DirectorProjectState,
    SelectionMode,
    CropAspectRatio,
    ColorInfo,
    UnresolvedAsset
} from '../types';

import { getCharacters, saveCharacters } from '../services/characterService';
import { getObjects, saveObjects } from '../services/objectService';
import { getCustomStyles, saveCustomStyles } from '../services/styleService';
import { getCustomPalettes, saveCustomPalettes } from '../services/paletteService';
import { getScenes, saveScenes } from '../services/sceneService';
import { saveProject, loadProject } from '../services/projectService';

// Assume these new service files will be created
// For now, we will call geminiService directly, but this structure allows for future abstraction
import { 
    generateImage, 
    getIntentFromText, 
    getSelectionMaskFromPrompt, 
    editImage, 
    getAIAdjustments, 
    getSuggestedAdjustments, 
    analyzeImage, 
    enhancePrompt, 
    enhanceImage, 
    parseBlueprint as parseBlueprintApi, 
    generateStoryboardImage as generateStoryboardImageApi, 
    cleanImageOfUI, 
    createVirtualEnvironment,
    regenerateSceneAsset
} from '../services/geminiService';
import { createCharacter as createCharacterApi, createObject as createObjectApi, createScene as createSceneApi } from '../services/assetService';
import { applyCrop as applyCropService, applyMaskToImage, applyAdjustmentsToImage } from '../services/imageEditingService';
import { parseAndValidateBlueprint, generateStoryboard } from '../services/storytellingService';


const DEFAULT_ADJUSTMENTS: Adjustments = {
    exposure: 0,
    brightness: 100,
    contrast: 100,
    highlights: 0,
    shadows: 0,
    saturation: 100,
    temperature: 0,
    hue: 0,
    tintColor: '#FFFFFF',
    tintBlendMode: 'screen',
    tintOpacity: 0,
    grainAmount: 0,
    straighten: 0,
    flip: 'none',
};

interface AppStore {
    // State
    activeTool: Tool;
    loadingMessage: string | null;
    error: string | null;
    analysisResult: ImageAnalysis | null;
    currentImage: string | null;
    history: (string | null)[];
    historyIndex: number;
    isComparing: boolean;
    generationPrompt: string;
    aspectRatio: AspectRatio;
    numberOfImages: number;
    editPrompt: string;
    panelAdjustments: Adjustments;
    suggestedPresets: string[];
    generationModel: string;
    isAiPromptEnhancementEnabled: boolean;
    imageReferences: string[];
    styleReference: string | null;
    sceneReference: SavedScene | null;
    generatedImages: string[];
    sceneCompositionMode: 'background' | 'recompose_real' | 'recompose_inferred';
    selectedSceneImageForComposition: string | null;
    isApiOffline: boolean;
    selectionMode: SelectionMode;
    zoomLevel: number;
    panOffset: { x: number; y: number };
    aiMode: 'auto' | 'strict' | 'creative';
    savedCharacters: Character[];
    activeCharacterContext: Character | null;
    userObjects: UserObject[];
    customStyles: CustomStyle[];
    customPalettes: CustomPalette[];
    savedScenes: SavedScene[];
    selectionMask: string | null;
    canvasAspectRatio: string;
    annotations: Annotation[];
    brushSize: number;
    retouchMode: 'replace' | 'erase';
    cropBox: { x: number; y: number; width: number; height: number; } | null;
    cropAspectRatio: CropAspectRatio;
    activeModal: ModalType;
    generationTags: Set<string>;
    isDirectorModalOpen: boolean;
    blueprintText: string;
    parsedBlueprint: ParsedBlueprint | null;
    unresolvedAssets: UnresolvedAsset[];
    storyboardImages: StoryboardImage[];
    generationStatus: 'idle' | 'parsing' | 'validating' | 'generating' | 'complete' | 'error';
    activeAssetModal: {
        modalType: 'character' | 'object' | 'scene' | null;
        initialData?: { name: string; description?: string; blueprintId?: string };
    };
    inspectingScene: SavedScene | null;

    // Actions
    setLoadingMessage: (message: string | null) => void;
    setError: (error: string | null) => void;
    setActiveTool: (tool: Tool) => void;
    setGenerationPrompt: (prompt: string) => void;
    setEditPrompt: (prompt: string) => void;
    setPanelAdjustments: (adjustments: Adjustments | ((prev: Adjustments) => Adjustments)) => void;
    setSelectionMask: (mask: string | null) => void;
    setBrushSize: (size: number) => void;
    setRetouchMode: (mode: 'replace' | 'erase') => void;
    setSelectionMode: (mode: SelectionMode) => void;
    setCropBox: (box: { x: number; y: number; width: number; height: number; } | null) => void;
    setCropAspectRatio: (ratio: CropAspectRatio) => void;
    setActiveModal: (modal: ModalType) => void;
    setGenerationTags: (tags: Set<string>) => void;
    setAnnotations: (annotations: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
    setZoomLevel: (zoom: number) => void;
    setPanOffset: (pan: { x: number, y: number } | ((prev: { x: number, y: number }) => { x: number, y: number })) => void;
    setIsDirectorModalOpen: (isOpen: boolean) => void;

    // History Actions
    setCurrentImage: (image: string | null, addToHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    reset: (image?: string | null) => void;
    getCanUndo: () => boolean;
    getCanRedo: () => boolean;

    // Complex Actions (that were handlers in App.tsx)
    loadAssets: () => void;
    handleToolSelect: (tool: Tool) => void;
    handleImageUpload: (file: File) => void;
    handleGenerate: () => Promise<void>;
    handleApplyEdit: (fullImage?: boolean) => Promise<void>;
    handleRemoveBackground: () => Promise<void>;
    handleAISelect: (prompt: string) => Promise<void>;
    handleApplyAdjustments: () => Promise<void>;
    handleResetAdjustments: () => void;
    handleAnalyzeImage: () => Promise<void>;
    handleCommandSubmit: (command: string) => Promise<void>;
    handleDownload: () => void;
    
    // Asset Management
    handleCreateCharacter: (images: string[], name: string, description?: string) => Promise<Character>;
    handleUpdateCharacter: (character: Character) => void;
    handleDeleteCharacter: (id: string) => void;
    handleCreateObject: (prompt: string, description?: string) => Promise<UserObject>;
    handleUpdateObject: (object: UserObject) => void;
    handleDeleteObject: (id: string) => void;
    handleCreateScene: (images: string[], name: string, description: string) => Promise<SavedScene>;
    handleUpdateScene: (scene: SavedScene) => void;
    handleDeleteScene: (id: string) => void;
    handleOpenSceneInspector: (sceneId: string | null) => void;
    handleRegenerateSceneAsset: (sceneId: string, assetType: 'technicalSheet' | 'detailShots' | 'aerialMap', prompt: string) => Promise<void>;
    handleCastObjectInScene: (sceneId: string, objectId: string, shouldCast: boolean) => void;

    // Director Tool Actions
    setBlueprintText: (text: string | ((prev: string) => string)) => void;
    handleParseBlueprint: () => Promise<void>;
    handleGenerateStoryboard: () => Promise<void>;
    handleResolveAsset: (assetData: UnresolvedAsset) => void;
    handleImagineAsset: (blueprintId: string) => Promise<void>;
    handleAddUnresolvedAsset: (asset: UnresolvedAsset) => void;
    handleRetryStoryboardImage: (imageToRetry: StoryboardImage) => Promise<void>;
    handleGenerateSingleScene: (sceneNumber: number, forceRegenerate?: boolean) => Promise<void>;
    handleUpdateGlobalContext: (field: keyof ParsedBlueprint['globalContext'], value: any) => void;
    handleScriptDirty: () => void;
    handleUpdateStoryboardImage: (sceneNumber: number, frameNumber: number, newImageData: string) => void;

    // Character/Asset Actions
    setActiveCharacterContext: (character: Character | null) => void;
}

const useAppStore = create<AppStore>((set, get) => ({
    // Initial State
    activeTool: 'generate',
    loadingMessage: null,
    error: null,
    analysisResult: null,
    currentImage: null,
    history: [null],
    historyIndex: 0,
    isComparing: false,
    generationPrompt: '',
    aspectRatio: '1:1',
    numberOfImages: 4,
    editPrompt: '',
    panelAdjustments: DEFAULT_ADJUSTMENTS,
    suggestedPresets: [],
    generationModel: 'imagen-4.0-generate-001',
    isAiPromptEnhancementEnabled: false,
    imageReferences: [],
    styleReference: null,
    sceneReference: null,
    generatedImages: [],
    sceneCompositionMode: 'background',
    selectedSceneImageForComposition: null,
    isApiOffline: false,
    selectionMode: 'brush',
    zoomLevel: 1,
    panOffset: { x: 0, y: 0 },
    aiMode: 'auto',
    savedCharacters: [],
    activeCharacterContext: null,
    userObjects: [],
    customStyles: [],
    customPalettes: [],
    savedScenes: [],
    selectionMask: null,
    canvasAspectRatio: '1 / 1',
    annotations: [],
    brushSize: 57,
    retouchMode: 'replace',
    cropBox: null,
    cropAspectRatio: 'original',
    activeModal: null,
    generationTags: new Set(),
    isDirectorModalOpen: false,
    blueprintText: '',
    parsedBlueprint: null,
    unresolvedAssets: [],
    storyboardImages: [],
    generationStatus: 'idle',
    activeAssetModal: { modalType: null },
    inspectingScene: null,

    // Simple Setters
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    setError: (error) => set({ error }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setGenerationPrompt: (prompt) => set({ generationPrompt: prompt }),
    setEditPrompt: (prompt) => set({ editPrompt: prompt }),
    setPanelAdjustments: (adjustments) => set(state => ({ panelAdjustments: typeof adjustments === 'function' ? adjustments(state.panelAdjustments) : adjustments })),
    setSelectionMask: (mask) => set({ selectionMask: mask }),
    setBrushSize: (size) => set({ brushSize: size }),
    setRetouchMode: (mode) => set({ retouchMode: mode }),
    setSelectionMode: (mode) => set({ selectionMode: mode }),
    setCropBox: (box) => set({ cropBox: box }),
    setCropAspectRatio: (ratio) => set({ cropAspectRatio: ratio }),
    setActiveModal: (modal) => set({ activeModal: modal }),
    setGenerationTags: (tags) => set({ generationTags: tags }),
    setAnnotations: (annotations) => set(state => ({ annotations: typeof annotations === 'function' ? annotations(state.annotations) : annotations })),
    setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
    setPanOffset: (pan) => set(state => ({ panOffset: typeof pan === 'function' ? pan(state.panOffset) : pan })),
    setIsDirectorModalOpen: (isOpen) => set({ isDirectorModalOpen: isOpen }),
    setActiveCharacterContext: (character) => set({ activeCharacterContext: character }),

    // History Logic
    setCurrentImage: (image, addToHistory = true) => {
        if (!addToHistory) {
            const history = get().history;
            const newHistory = [...history];
            newHistory[get().historyIndex] = image;
            set({ currentImage: image, history: newHistory });
            return;
        }

        const newHistory = get().history.slice(0, get().historyIndex + 1);
        if (image === newHistory[newHistory.length - 1]) return;
        newHistory.push(image);
        set({
            currentImage: image,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
        
        if (image) {
            const img = new Image();
            img.onload = () => {
                set({ canvasAspectRatio: `${img.naturalWidth} / ${img.naturalHeight}` });
            };
            img.src = image;
        }
    },
    undo: () => {
        const { historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({ historyIndex: newIndex, currentImage: get().history[newIndex] });
        }
    },
    redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            set({ historyIndex: newIndex, currentImage: get().history[newIndex] });
        }
    },
    reset: (image = null) => {
        set({ history: [image], historyIndex: 0, currentImage: image });
    },
    getCanUndo: () => get().historyIndex > 0,
    getCanRedo: () => get().historyIndex < get().history.length - 1,

    // Complex Actions
    loadAssets: () => {
        set({
            savedCharacters: getCharacters(),
            userObjects: getObjects(),
            customStyles: getCustomStyles(),
            customPalettes: getCustomPalettes(),
            savedScenes: getScenes(),
        });
        const loadedProject = loadProject();
        if (loadedProject) {
            set({
                blueprintText: loadedProject.blueprintText,
                parsedBlueprint: loadedProject.parsedBlueprint,
                storyboardImages: loadedProject.storyboardImages,
            });
        }
    },
    
    handleToolSelect: (tool: Tool) => {
        const { isApiOffline, error, currentImage, activeTool } = get();
        const aiTools: Tool[] = ['generate', 'select', 'remove-bg', 'character', 'analyze', 'enhance', 'auto-enhance', 'director', 'restyle', 'scene'];

        if (isApiOffline && aiTools.includes(tool)) {
            set({ error: 'This tool is unavailable while offline. Please check your network connection.' });
            return;
        }

        if (activeTool === 'crop' && tool !== 'crop') {
            set({ cropBox: null });
        }

        set({ activeTool: tool });

        if (tool !== 'generate') {
            set({ activeCharacterContext: null });
        }
        if (tool === 'director') {
            set({ isDirectorModalOpen: true, activeModal: null });
        } else {
            set({ isDirectorModalOpen: false });
        }
        if (tool === 'scene') set({ activeModal: 'scene' });
        if (tool === 'character') set({ activeModal: 'character' });

        if (tool === 'crop' && currentImage) {
            set({ cropBox: { x: 0, y: 0, width: 1, height: 1 }, cropAspectRatio: 'original' });
        } else if (tool === 'crop' && !currentImage) {
            set({ error: 'Please upload an image to crop.' });
        }
    },

    handleImageUpload: (file) => {
        const { reset, handleToolSelect } = get();
        set({ analysisResult: null, suggestedPresets: [], activeCharacterContext: null, annotations: [], generatedImages: [] });
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          reset(base64);
        };
        reader.readAsDataURL(file);
        handleToolSelect('select');
    },

    // Placeholder for other complex handlers...
    handleGenerate: async () => { console.log("Generate clicked") },
    handleApplyEdit: async (fullImage) => { console.log("Apply edit clicked") },
    handleRemoveBackground: async () => { console.log("Remove BG clicked") },
    handleAISelect: async (prompt) => { console.log("AI Select:", prompt) },
    handleApplyAdjustments: async () => { console.log("Apply adjustments") },
    handleResetAdjustments: () => set({ panelAdjustments: DEFAULT_ADJUSTMENTS }),
    handleAnalyzeImage: async () => { console.log("Analyze clicked") },
    handleCommandSubmit: async (command) => { console.log("Command submitted:", command) },
    handleDownload: () => { 
        const { currentImage } = get();
        if (!currentImage) return;
        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `nano-banana-edit-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    handleCreateCharacter: async (images, name, description) => {
        set({ loadingMessage: 'Creating character...' });
        try {
            const newChar = await createCharacterApi(images, name, description);
            
            set(state => {
                const newState: Partial<AppStore> = {
                    savedCharacters: [...state.savedCharacters, newChar],
                };

                const blueprintId = state.activeAssetModal.initialData?.blueprintId;
                if (blueprintId && state.parsedBlueprint) {
                    newState.unresolvedAssets = state.unresolvedAssets.filter(a => a.blueprintId !== blueprintId);
                    const updatedChars = state.parsedBlueprint.globalContext.characters.map(c => 
                        c.id === blueprintId ? { ...c, assignedCharacterId: newChar.id } : c
                    );
                    newState.parsedBlueprint = {
                        ...state.parsedBlueprint,
                        globalContext: { ...state.parsedBlueprint.globalContext, characters: updatedChars }
                    };
                }
                return newState;
            });
            
            saveCharacters(get().savedCharacters);
            toast.success(`Character "${name}" created!`);
            return newChar;
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            set({ error: message });
            toast.error(`Failed to create character: ${message}`);
            throw e;
        } finally {
            set({ loadingMessage: null, activeAssetModal: { modalType: null } });
        }
    },
    handleUpdateCharacter: (character) => {
        set(state => ({
            savedCharacters: state.savedCharacters.map(c => c.id === character.id ? character : c)
        }));
        saveCharacters(get().savedCharacters);
        toast.success(`Character "${character.name}" updated.`);
    },
    handleDeleteCharacter: (id: string) => {
        set(state => ({
            savedCharacters: state.savedCharacters.filter(char => char.id !== id),
            activeCharacterContext: state.activeCharacterContext?.id === id ? null : state.activeCharacterContext,
        }));
        saveCharacters(get().savedCharacters);
    },
    handleCreateObject: async (prompt, description) => {
        set({ loadingMessage: 'Creating object...' });
        try {
            const newObj = await createObjectApi(prompt, description);
            
            set(state => ({
                userObjects: [...state.userObjects, newObj],
                activeAssetModal: { modalType: null },
            }));

            saveObjects(get().userObjects);
            toast.success(`Object "${prompt}" created!`);
            return newObj;
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            set({ error: message });
            toast.error(`Failed to create object: ${message}`);
            throw e;
        } finally {
            set({ loadingMessage: null });
        }
    },
    handleUpdateObject: (object) => {
        set(state => ({
            userObjects: state.userObjects.map(o => o.id === object.id ? object : o)
        }));
        saveObjects(get().userObjects);
        toast.success(`Object "${object.name}" updated.`);
    },
    handleDeleteObject: (id: string) => {
        set(state => ({
            userObjects: state.userObjects.filter(obj => obj.id !== id),
        }));
        saveObjects(get().userObjects);
        toast.success(`Object deleted.`);
    },
    handleCreateScene: async (images, name, description) => {
        set({ loadingMessage: 'Creating scene...' });
        try {
            const newScene = await createSceneApi(images, name, description);
            set(state => ({
                savedScenes: [...state.savedScenes, newScene],
                activeAssetModal: { modalType: null },
            }));
            saveScenes(get().savedScenes);
            toast.success(`Scene "${name}" created!`);
            return newScene;
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            set({ error: message });
            toast.error(`Failed to create scene: ${message}`);
            throw e;
        } finally {
            set({ loadingMessage: null });
        }
    },
    handleUpdateScene: (scene) => {
        set(state => ({
            savedScenes: state.savedScenes.map(s => s.id === scene.id ? scene : s),
            inspectingScene: state.inspectingScene?.id === scene.id ? scene : state.inspectingScene,
        }));
        saveScenes(get().savedScenes);
    },
    handleDeleteScene: (id: string) => {
        set(state => ({
            savedScenes: state.savedScenes.filter(s => s.id !== id),
            sceneReference: state.sceneReference?.id === id ? null : state.sceneReference,
        }));
        saveScenes(get().savedScenes);
        toast.success('Scene deleted.');
    },
    handleOpenSceneInspector: (sceneId) => {
        if (sceneId === null) {
            set({ inspectingScene: null });
            return;
        }
        const scene = get().savedScenes.find(s => s.id === sceneId);
        if (scene) {
            set({ inspectingScene: scene });
        }
    },
    handleRegenerateSceneAsset: async (sceneId, assetType, prompt) => {
        const scene = get().savedScenes.find(s => s.id === sceneId);
        if (!scene) return;
        set({ loadingMessage: `Regenerating ${assetType}...` });
        try {
            const updatedPart = await regenerateSceneAsset(scene, assetType, prompt);
            const updatedScene = { ...scene, ...updatedPart };
            get().handleUpdateScene(updatedScene);
            toast.success(`${assetType} regenerated!`);
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            set({ error: message });
            toast.error(`Failed to regenerate: ${message}`);
        } finally {
            set({ loadingMessage: null });
        }
    },
    handleCastObjectInScene: (sceneId, objectId, shouldCast) => {
        const scene = get().savedScenes.find(s => s.id === sceneId);
        if (!scene) return;
        const currentCast = scene.castObjectIds || [];
        const newCast = shouldCast
            ? [...currentCast, objectId]
            : currentCast.filter(id => id !== objectId);
        const updatedScene = { ...scene, castObjectIds: Array.from(new Set(newCast)) };
        get().handleUpdateScene(updatedScene);
    },

    setBlueprintText: (text) => set(state => ({ blueprintText: typeof text === 'function' ? text(state.blueprintText) : text })),
    handleParseBlueprint: async () => {
        const { blueprintText, savedCharacters } = get();
        set({ generationStatus: 'parsing', loadingMessage: 'Parsing script...' });
        try {
            const { parsed, unresolved } = await parseAndValidateBlueprint(blueprintText, savedCharacters);
            const imageCount = parsed.directives.imageCountPerScene || 3;
            const initialImages = parsed.scenes.flatMap(scene => 
                Array.from({ length: imageCount }, (_, i) => ({
                    sceneNumber: scene.sceneNumber,
                    frameNumber: i + 1,
                    imageData: null,
                    status: 'pending'
                } as StoryboardImage))
            );
            set({ parsedBlueprint: parsed, unresolvedAssets: unresolved, storyboardImages: initialImages, generationStatus: 'idle' });
            toast.success('Script parsed successfully!');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to parse script.';
            set({ error: message, generationStatus: 'error' });
            toast.error(message);
        } finally {
            set({ loadingMessage: null });
        }
    },
    handleGenerateStoryboard: async () => {
        const { parsedBlueprint, setLoadingMessage, setError } = get();
        if (!parsedBlueprint) return;
    
        set({ generationStatus: 'generating' });
        set(state => ({
            storyboardImages: state.storyboardImages.map(img => ({ ...img, status: 'generating', errorMessage: undefined }))
        }));
    
        let previousFrameB64: string | null = null;
        let lastSceneNumber = -1;
    
        for (const image of get().storyboardImages.sort((a,b) => a.sceneNumber - b.sceneNumber || a.frameNumber - b.frameNumber)) {
            if (image.sceneNumber !== lastSceneNumber) {
                previousFrameB64 = null;
                lastSceneNumber = image.sceneNumber;
            }
            
            setLoadingMessage(`Generating S${image.sceneNumber}:${image.frameNumber}...`);
            try {
                const imageData = await generateStoryboardImageApi(
                    get().parsedBlueprint!,
                    image.sceneNumber,
                    image.frameNumber,
                    get().savedCharacters,
                    previousFrameB64 ? [previousFrameB64] : null
                );
    
                if (imageData) {
                    set(state => ({
                        storyboardImages: state.storyboardImages.map(img => 
                            (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                            ? { ...img, imageData, status: 'complete' } 
                            : img
                        )
                    }));
                    previousFrameB64 = imageData;
                } else {
                    throw new Error('API returned no image.');
                }
            } catch(err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to generate storyboard image: ${message}`);
                set(state => ({
                    storyboardImages: state.storyboardImages.map(img => 
                        (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                        ? { ...img, status: 'error', errorMessage: message } 
                        : img
                    )
                }));
            }
        }
        setLoadingMessage(null);
        set({ generationStatus: 'complete' });
        toast.success('Storyboard generation complete!');
    },
    handleResolveAsset: (assetData) => {
        set({ activeAssetModal: { modalType: assetData.type.toLowerCase() as any, initialData: assetData }});
    },
    handleImagineAsset: async (blueprintId) => {
        set(state => {
            const bp = state.parsedBlueprint;
            if (!bp) return {};
            const updatedChars = bp.globalContext.characters.map(c => c.id === blueprintId ? { ...c, isImagined: true } : c);
            const updatedUnresolved = state.unresolvedAssets.filter(a => a.blueprintId !== blueprintId);
            return {
                parsedBlueprint: { ...bp, globalContext: { ...bp.globalContext, characters: updatedChars }},
                unresolvedAssets: updatedUnresolved
            };
        });
        toast.success("Character will be imagined by AI during generation.");
    },
    handleAddUnresolvedAsset: (asset) => {
        set(state => ({ unresolvedAssets: [...state.unresolvedAssets, asset] }));
    },
    handleRetryStoryboardImage: async (imageToRetry) => {
        const { parsedBlueprint, setLoadingMessage, setError } = get();
        if (!parsedBlueprint) return;
    
        set(state => ({
            storyboardImages: state.storyboardImages.map(img => 
                (img.sceneNumber === imageToRetry.sceneNumber && img.frameNumber === imageToRetry.frameNumber)
                ? { ...img, status: 'generating', errorMessage: undefined } 
                : img
            )
        }));
    
        let previousFrameB64: string | null = null;
        if (imageToRetry.frameNumber > 1) {
            const lastGoodFrame = get().storyboardImages
                .find(img => img.sceneNumber === imageToRetry.sceneNumber && img.frameNumber === imageToRetry.frameNumber - 1 && img.status === 'complete' && img.imageData);
            if (lastGoodFrame) {
                previousFrameB64 = lastGoodFrame.imageData;
            }
        }
    
        setLoadingMessage(`Regenerating S${imageToRetry.sceneNumber}:${imageToRetry.frameNumber}...`);
        try {
            const imageData = await generateStoryboardImageApi(
                get().parsedBlueprint!,
                imageToRetry.sceneNumber,
                imageToRetry.frameNumber,
                get().savedCharacters,
                previousFrameB64 ? [previousFrameB64] : null
            );
            
            if (imageData) {
                set(state => ({
                    storyboardImages: state.storyboardImages.map(img => 
                        (img.sceneNumber === imageToRetry.sceneNumber && img.frameNumber === imageToRetry.frameNumber) 
                        ? { ...img, imageData, status: 'complete' } 
                        : img
                    )
                }));
            } else {
                throw new Error('API returned no image.');
            }
        } catch(err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(`Failed to regenerate storyboard image: ${message}`);
            set(state => ({
                storyboardImages: state.storyboardImages.map(img => 
                    (img.sceneNumber === imageToRetry.sceneNumber && img.frameNumber === imageToRetry.frameNumber) 
                    ? { ...img, status: 'error', errorMessage: message } 
                    : img
                )
            }));
        } finally {
            setLoadingMessage(null);
        }
    },
    handleGenerateSingleScene: async (sceneNumber, forceRegenerate = false) => {
        const { parsedBlueprint, storyboardImages, savedCharacters, setLoadingMessage, setError } = get();

        if (!parsedBlueprint) {
            toast.error("Please parse the script first.");
            return;
        }

        const allSceneImages = storyboardImages.filter(img => img.sceneNumber === sceneNumber);
        if (allSceneImages.length === 0) {
            toast.error(`No storyboard frames found for scene ${sceneNumber}.`);
            return;
        }

        const imagesToGenerate = forceRegenerate
            ? allSceneImages
            : allSceneImages.filter(img => img.status !== 'complete');
        
        if (imagesToGenerate.length === 0 && !forceRegenerate) {
            toast('Scene already generated. Use Regenerate or click a frame to regenerate individually.');
            return; 
        }

        const imageKeysToUpdate = new Set(imagesToGenerate.map(i => `${i.sceneNumber}-${i.frameNumber}`));
        set(state => ({
            storyboardImages: state.storyboardImages.map(img => 
                imageKeysToUpdate.has(`${img.sceneNumber}-${img.frameNumber}`)
                ? { ...img, status: 'generating', errorMessage: undefined, imageData: forceRegenerate ? null : img.imageData } 
                : img
            )
        }));
        
        let previousFrameB64: string | null = null;
        const firstFrameToGenerate = imagesToGenerate.sort((a,b) => a.frameNumber - b.frameNumber)[0];
        if (firstFrameToGenerate) {
            const lastGoodFrame = get().storyboardImages
              .filter(img => img.sceneNumber === sceneNumber && img.status === 'complete' && img.imageData && img.frameNumber < firstFrameToGenerate.frameNumber)
              .sort((a, b) => b.frameNumber - a.frameNumber)[0];
            if (lastGoodFrame) {
              previousFrameB64 = lastGoodFrame.imageData;
            }
        }

        for (const image of imagesToGenerate.sort((a,b) => a.frameNumber - b.frameNumber)) {
            setLoadingMessage(`Generating S${sceneNumber}:${image.frameNumber}...`);
            try {
                const imageData = await generateStoryboardImageApi(
                    get().parsedBlueprint!,
                    sceneNumber,
                    image.frameNumber,
                    get().savedCharacters,
                    previousFrameB64 ? [previousFrameB64] : null
                );
                
                if (imageData) {
                    set(state => ({
                        storyboardImages: state.storyboardImages.map(img => 
                            (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                            ? { ...img, imageData, status: 'complete' } 
                            : img
                        )
                    }));
                    previousFrameB64 = imageData;
                } else {
                    throw new Error('API returned no image.');
                }
            } catch(err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(`Failed to generate storyboard image: ${message}`);
                set(state => ({
                    storyboardImages: state.storyboardImages.map(img => 
                        (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                        ? { ...img, status: 'error', errorMessage: message } 
                        : img
                    )
                }));
            }
        }
        setLoadingMessage(null);
    },
    handleUpdateGlobalContext: (field, value) => {
        set(state => {
            if (!state.parsedBlueprint) return {};
            return {
                parsedBlueprint: {
                    ...state.parsedBlueprint,
                    globalContext: { ...state.parsedBlueprint.globalContext, [field]: value }
                }
            };
        });
    },
    handleScriptDirty: () => {
        set({ parsedBlueprint: null, storyboardImages: [], unresolvedAssets: [], generationStatus: 'idle' });
    },
    handleUpdateStoryboardImage: (sceneNumber, frameNumber, newImageData) => {
        set(state => ({
            storyboardImages: state.storyboardImages.map(img => 
                (img.sceneNumber === sceneNumber && img.frameNumber === frameNumber)
                ? { ...img, imageData: newImageData }
                : img
            )
        }));
    },
}));

export default useAppStore;