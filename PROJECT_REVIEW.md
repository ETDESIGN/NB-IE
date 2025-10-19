# Nano Banana Photo Editor: AI Project Dossier

This document provides a complete technical overview, architectural breakdown, and full source code for the Nano Banana Photo Editor. This dossier is intended to serve as a comprehensive guide for developers and AI assistants to understand the project's functionality, technical implementation, and codebase.

## 1. Project Overview & Core Philosophy

### Core Purpose
Nano Banana is an intelligent, web-based photo editor that merges a rich set of generative AI capabilities with an intuitive, conversational user interface. It leverages the Google Gemini API to understand natural language commands, enabling users to perform complex edits—from generating images from scratch to making precise, content-aware modifications—simply by describing their intent. It also features a powerful, interactive analysis panel that deconstructs images into editable components, turning AI insights into actionable editing tools.

A key design principle is providing users with clear, visual feedback and powerful asset management. This is exemplified by the 'Active Character' context system and the **Scene Inspector**, which allows for deep, granular control over generated environments. The application also features a robust, multi-step history system for non-destructive editing.

### Key Features & User Workflow

The application is a single-page application (SPA) built with React. The user interacts with the application through a three-part interface: a main canvas, a left-hand toolbar for high-level tool selection, and a right-hand panel for context-specific controls. A conversational input at the bottom of the canvas serves as the primary "AI co-pilot".

*   **Image Generation**:
    *   **Workflow**: The user selects the 'Generate' tool, enters a descriptive prompt in the right-hand `RightPanel`, selects various artistic tags (style, composition, effects), chooses an aspect ratio, and clicks "Generate". It supports multi-modal prompting using text, image references, style references, and full scene references.
    *   **Technology**: This calls the `generateImage` function in `geminiService.ts`, which uses the `imagen-4.0-generate-001` or `gemini-2.5-flash-image-preview` models to create images.

*   **Image Upload & Editing**:
    *   **Workflow**: The user can upload their own image using the 'Upload' tool. Once an image is on the canvas, a new top-mounted `EditingToolbar` appears, providing quick access to undo, redo, reset, and a "compare to original" feature. Edits can be made using specialized tools or the conversational input.
    *   **Technology**: Uses a standard file input to read the image as a base64 data URL. The state of the main image is managed by the `useHistoryState` custom hook, allowing for a multi-step undo/redo stack.

*   **Conversational AI Control**:
    *   **Workflow**: A central feature is the `ConversationalCanvas` component at the bottom of the screen. The user can type commands like "add a photorealistic cat sitting on the grass," "select the sky," or "make the image look more vintage."
    *   **Technology**: The `onCommandSubmit` handler in `App.tsx` calls `getIntentFromText` in `geminiService.ts`. This service sends the command and a flattened image (if present) to the `gemini-2.5-flash` model with a strict JSON schema. The model returns a structured `Intent` object (e.g., `{ action: 'add', target: 'grass', parameters: { description: 'a photorealistic cat' } }`). A `switch` statement in `App.tsx` then orchestrates the appropriate action based on the parsed intent.

*   **AI-Powered Selections & Inpainting/Outpainting**:
    *   **Workflow**: When a user command is parsed as a `select` intent (e.g., "select the car"), the application calls `getSelectionMaskFromPrompt`. Users can also draw selections manually. Once an area is selected, they can describe a change or ask to remove the content.
    *   **Technology**: AI selection uses `gemini-2.5-flash-image-preview` with a specialized prompt to generate a mask of the requested object. The `editImage` function sends the original image, a prompt, and an optional selection mask to the `gemini-2.5-flash-image-preview` model, which returns the modified image.

*   **Interactive Image Analysis**:
    *   **Workflow**: After an image is on the canvas, the user can select the 'Analyze' tool. The `AnalyzePanel` in the right-hand sidebar populates with a rich, AI-generated breakdown of the image, including dominant colors, identified objects, overall mood, composition, lighting, and artistic style.
    *   **Interactivity as a Core Principle**: This panel is not just a report; it's an interactive editing hub. Every piece of information is actionable:
        *   **Colors**: Users can click to select all instances of a specific color on the canvas or enter a prompt to change that color (e.g., change "sky blue" to "deep purple").
        *   **Objects**: Each identified object can be instantly selected, removed (with content-aware fill), or saved as a new, reusable `UserObject` in the user's library.
        *   **Global Attributes**: The mood, composition, lighting, and style sections are not just text descriptions but are editable fields. Modifying them and submitting triggers a global restyling of the image based on the new prompt.
    *   **Technology**: The initial analysis is powered by the `analyzeImage` function in `geminiService.ts`, which uses `gemini-2.5-flash` to parse the image into a structured JSON object. The interactive features leverage a combination of other services, including `getSelectionMaskFromPrompt` for selections, `editImage` for object removal and restyling, and `createAssetFromImages` for saving new objects.

*   **Persistent Asset Creation (Characters, Objects, Scenes)**: The app features a robust system for creating and managing reusable assets.
    *   **Creation**: Users can open dedicated modals to create Characters, Objects, or Scenes from reference images and text prompts.
    *   **AI Processing**: For complex assets like Scenes, the `createVirtualEnvironment` service in `geminiService.ts` performs a multi-step analysis to generate a rich set of materials: a technical sheet, detail shots, an aerial map, and more. This creates a comprehensive "virtual environment" from the user's input.
    *   **Scene Inspector**: After a scene is created, users can open the `SceneInspectorModal`. This dedicated interface allows them to view all AI-generated assets, manually edit the text-based technical sheet, regenerate specific assets (like the aerial map) with new prompts, and "cast" saved objects into the scene's asset list.
    *   **Technology**: Asset creation is handled by `createAssetFromImages` and `createVirtualEnvironment` in `geminiService.ts`. All created assets are persisted in the browser's Local Storage via dedicated service files (`characterService.ts`, `sceneService.ts`, etc.).

*   **Director Tool & Stateful Generation Engine**:
    *   **Workflow**: A powerful tool for generating multi-image storyboards from a natural language script or "blueprint." The tool parses the script to identify all required assets (characters, scenes). After the user resolves any missing assets using the "Casting Sheet" UI, they can generate the storyboard.
    *   **Technology**: The `parseBlueprint` service uses `gemini-2.5-flash` to convert the script into a structured `ParsedBlueprint` object. Storyboard generation is stateful to ensure visual consistency by chaining previously generated frames as visual references for subsequent frames.

## 2. Technical Architecture & Implementation

*   **Frontend Framework**: React (v19) with TypeScript, utilizing modern hooks for state management and side effects.
*   **AI Backend**: Google Gemini API, accessed via the `@google/genai` SDK.
*   **Styling**: Tailwind CSS, configured directly in the `index.html` for simplicity.
*   **State Management**:
    *   The primary application state is centralized within the main `App.tsx` component using the `useState` hook. The `AppState` interface in `types.ts` defines the core shape.
    *   **History Management**: The main image canvas state is managed by a custom hook, `useHistoryState`. This hook maintains an array of image data URIs and an index pointer, providing robust, multi-step undo, redo, reset, and "compare to original" functionality without polluting the main component's logic.
*   **Component Structure**:
    *   `App.tsx`: The root component, acting as the central controller. It manages all state, orchestrates AI service calls, and passes props down to child components. The main storyboard generation loops and all primary API handlers are located here.
    *   `/components`: Contains all UI components. `Toolbar`, `Canvas`, and `RightPanel` define the main layout. The `/components/modals` subdirectory contains the UI for the various pop-up dialogs, including the `DirectorModal` and `SceneInspectorModal`.
    *   `/hooks`: Contains custom React hooks, such as `useHistoryState.ts`.
    *   `/services`: Contains modules that abstract external interactions.
        *   `geminiService.ts`: The sole interface to the Google Gemini API. It has been expanded to include advanced scene creation functions like `createVirtualEnvironment`, `regenerateSceneAsset`, and `cleanImageOfUI`.
        *   Other services (`characterService`, `projectService`, etc.) handle local storage persistence.
*   **No Build Step**: The project uses an `importmap` in `index.html` to load React, `react-hot-toast`, and `@google/genai` directly from a CDN, eliminating the need for a package manager or build process.

## 3. Full Project Code

This section contains the full, unabridged source code for every file in the project.

---

### `App.tsx`

```javascript
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useHistoryState } from './hooks/useHistoryState';
import { Toolbar } from './components/Toolbar';
import { EditingToolbar } from './components/EditingToolbar';
import { Canvas } from './components/Canvas';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { ConversationalCanvas } from './components/ConversationalCanvas';
import { SelectBottomBar } from './components/bottombars/SelectBottomBar';
import { generateImage, generateObject, getIntentFromText, getSelectionMaskFromPrompt, editImage, getAIAdjustments, getSuggestedAdjustments, generateImageWithCharacter, analyzeImage, createAssetFromImages, editImageWithAnnotations, enhancePrompt, enhanceImage, parseBlueprint, generateStoryboardImage, createSceneAsset, analyzeSceneForPrompting, createVirtualEnvironment, regenerateSceneAsset, cleanImageOfUI } from './services/geminiService';
import { getCharacters, saveCharacters } from './services/characterService';
import { getObjects, saveObjects } from './services/objectService';
import { getCustomStyles, saveCustomStyles } from './services/styleService';
import { getCustomPalettes, saveCustomPalettes } from './services/paletteService';
import { getScenes, saveScenes } from './services/sceneService';
import { saveProject, loadProject } from './services/projectService';
// Fix: Import SelectionMode type for use in component state.
import type { Tool, Adjustments, AspectRatio, AppState, ImageAnalysis, Character, Annotation, ModalType, UserObject, CustomStyle, CustomPalette, ParsedBlueprint, StoryboardImage, SavedScene, DirectorProjectState, SelectionMode, CropAspectRatio, ColorInfo, AssetCreateSuggestionPayload, UnresolvedAsset } from './types';
import { LoaderIcon, ADJUSTMENT_PRESETS, PROMPT_SUGGESTIONS } from './constants';
import { ColorPaletteModal } from './components/modals/ColorPaletteModal';
import { StyleModal } from './components/modals/StyleModal';
import { EffectsModal } from './components/modals/EffectsModal';
import { CompositionModal } from './components/modals/CompositionModal';
import { CharacterModal } from './components/modals/CharacterModal';
import { ObjectModal } from './components/modals/ObjectModal';
import { AspectRatioModal } from './components/modals/AspectRatioModal';
import { DirectorModal } from './components/modals/DirectorModal';
import { RightPanel } from './components/RightPanel';
import { SceneModal } from './components/modals/SceneModal';
import { SceneInspectorModal } from './components/modals/SceneInspectorModal';
import { AdjustPanel } from './components/panels/AdjustPanel';
import { ZoomControls } from './components/ZoomControls';


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

// --- START: Stitch Icons for ToolsQuickAccessToolbar ---
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06l-51.61-19-19-51.65a15.92,15.92,0,0,0-29.88,0L78.07,110l-51.65,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0l19-51.61,51.65-19a15.92,15.92,0,0,0,0-29.88ZM140.39,163a15.87,15.87,0,0,0-9.43,9.43l-19,51.46L93,172.39A15.87,15.87,0,0,0,83.61,163h0L32.15,144l51.46-19A15.87,15.87,0,0,0,93,115.61l19-51.46,19,51.46a15.87,15.87,0,0,0,9.43,9.43l51.46,19ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>;
const BandaidsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M184.57,128l27.71-27.72a40,40,0,1,0-56.56-56.56L128,71.43,100.28,43.72a40,40,0,1,0-56.56,56.56L71.43,128,43.72,155.72a40,40,0,1,0,56.56,56.56L128,184.57l27.72,27.71a40,40,0,1,0,56.56-56.56ZM167,55A24,24,0,1,1,201,89l-27.72,27.72L139.31,82.75Zm-5.09,73L128,161.94,94.06,128,128,94.06ZM55,89h0A24,24,0,1,1,89,55l27.72,27.72L82.75,116.69ZM89,201A24,24,0,1,1,55,167l27.72-27.72,33.94,33.94Zm112,0A24,24,0,0,1,167,201l-27.72-27.72,33.94-33.94L201,167A24,24,0,0,1,201,201Zm-85-73a12,12,0,1,1,12,12A12,12,0,0,1,116,128Z"></path></svg>;
const CornersOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"></path></svg>;
const MoonStarsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M240,96a8,8,0,0,1-8,8H216v16a8,8,0,0,1-16,0V104H184a8,8,0,0,1,0-16h16V72a8,8,0,0,1,16,0V88h16A8,8,0,0,1,240,96ZM144,56h8v8a8,8,0,0,0,16,0V56h8a8,8,0,0,0,0-16h-8V32a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16Zm72.77,97a8,8,0,0,1,1.43,8A96,96,0,1,1,95.07,37.8a8,8,0,0,1,10.6,9.06A88.07,88.07,0,0,0,209.14,150.33,8,8,0,0,1,216.77,153Zm-19.39,14.88c-1.79.09-3.59.14-5.38.14A104.11,104.11,0,0,1,88,64c0-1.79,0-3.59.14-5.38A80,80,0,1,0,197.38,167.86Z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>;
const SlidersHorizontalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path></svg>;
// --- END: Stitch Icons ---

const ToolsQuickAccessToolbar: React.FC<{ activeTool: Tool; onSelectTool: (tool: Tool) => void }> = ({ activeTool, onSelectTool }) => {
  const tools = [
    { name: 'Edit', icon: <SparkleIcon />, tool: 'auto-enhance' as Tool },
    { name: 'Retouch', icon: <BandaidsIcon />, tool: 'select' as Tool },
    { name: 'Resize', icon: <CornersOutIcon />, tool: 'crop' as Tool },
    { name: 'Restyle', icon: <MoonStarsIcon />, tool: 'restyle' as Tool },
    { name: 'Background', icon: <UserIcon />, tool: 'remove-bg' as Tool },
    { name: 'Upscale', icon: <CornersOutIcon />, tool: 'enhance' as Tool },
    { name: 'Adjust', icon: <SlidersHorizontalIcon />, tool: 'adjust' as Tool },
  ];

  return (
    <div className="bg-black/50 backdrop-blur-sm p-2 rounded-full flex items-center space-x-1">
      {tools.map(({ name, icon, tool }) => (
        <button
          key={name}
          title={name}
          onClick={() => onSelectTool(tool)}
          className={`p-2.5 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${activeTool === tool ? 'bg-primary' : 'hover:bg-white/10'}`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const CropBottomBar: React.FC<{
    isLoading: boolean;
    onApplyCrop: () => void;
    onCancelCrop: () => void;
    aspectRatio: CropAspectRatio;
    onAspectRatioChange: (ratio: CropAspectRatio) => void;
}> = ({ isLoading, onApplyCrop, onCancelCrop, aspectRatio, onAspectRatioChange }) => {
    const ratios: CropAspectRatio[] = ['original', 'free', '1:1', '16:9', '4:3'];
    return (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-4 animate-fade-in">
            <div className="bg-[#2B2B2B] border border-surface-light rounded-2xl p-2.5 flex items-center shadow-2xl space-x-4">
                <button onClick={onCancelCrop} className="px-4 py-2 text-sm rounded-lg transition-colors font-medium bg-surface-light text-text-light hover:bg-gray-600">Cancel</button>
                <div className="flex items-center space-x-2">
                    {ratios.map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => onAspectRatioChange(ratio)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors capitalize ${aspectRatio === ratio ? 'bg-primary text-white' : 'bg-surface-light text-text-dark hover:bg-gray-600'}`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
                <button onClick={onApplyCrop} disabled={isLoading} className="px-6 py-2 text-sm rounded-lg transition-colors font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 flex items-center">
                    {isLoading ? <LoaderIcon /> : 'Apply Crop'}
                </button>
            </div>
        </div>
    );
};


/**
 * Resizes and compresses a base64 image string for local storage.
 * @param base64Str The base64 image data URL.
 * @param maxDimension The maximum width or height of the resulting image.
 * @param quality A number between 0 and 1 indicating the image quality for JPEG.
 * @param format The output format, 'jpeg' for compression or 'png' to preserve transparency.
 * @returns A promise that resolves to the compressed base64 image string.
 */
const compressImageForStorage = async (base64Str: string, maxDimension: number = 512, quality: number = 0.8, format: 'jpeg' | 'png' = 'jpeg'): Promise<string> => {
    return new Promise((resolve) => {
        if (!base64Str || !base64Str.startsWith('data:image')) {
            return resolve(base64Str); // Return original if not a valid image data URL
        }
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let { naturalWidth: width, naturalHeight: height } = img;
            
            if (width <= maxDimension && height <= maxDimension) {
                // If it's small enough, just re-encode to apply JPEG compression, but don't resize.
            } else if (width > height) {
                height = Math.round(height * (maxDimension / width));
                width = maxDimension;
            } else {
                height = maxDimension;
                width = Math.round(width * (maxDimension / height));
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return resolve(base64Str); // Fallback
            }
             // Add a white background for JPEGs to avoid black background when converting from transparent PNGs
            if (format === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(`image/${format}`, quality));
        };
        img.onerror = () => {
            console.error("Image compression failed: Could not load image.");
            resolve(base64Str); // Fallback on error
        };
    });
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<Omit<AppState, 'mainImage'>>({
    activeTool: 'generate',
    loadingMessage: null,
    error: null,
    analysisResult: null,
  });
  
  const { 
    state: currentImage, 
    setState: setHistoryState,
    undo,
    redo,
    reset,
    history,
    canUndo,
    canRedo,
  } = useHistoryState<string | null>(null);

  const [isComparing, setIsComparing] = useState(false);
  
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numberOfImages, setNumberOfImages] = useState(4);
  const [editPrompt, setEditPrompt] = useState('');
  const [panelAdjustments, setPanelAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [suggestedPresets, setSuggestedPresets] = useState<string[]>([]);
  const [generationModel, setGenerationModel] = useState('imagen-4.0-generate-001');

  // Generation options
  const [isAiPromptEnhancementEnabled, setIsAiPromptEnhancementEnabled] = useState(false);
  const [imageReferences, setImageReferences] = useState<string[]>([]);
  const [styleReference, setStyleReference] = useState<string | null>(null);
  const [sceneReference, setSceneReference] = useState<SavedScene | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [sceneCompositionMode, setSceneCompositionMode] = useState<'background' | 'recompose_real' | 'recompose_inferred'>('background');
  const [selectedSceneImageForComposition, setSelectedSceneImageForComposition] = useState<string | null>(null);

  const [isApiOffline, setIsApiOffline] = useState(false);

  // Fix: Add state for `selectionMode` and `zoomLevel`, which are required props for the Canvas component.
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('brush');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });


  // Conversational AI mode
  const [aiMode, setAiMode] = useState<'auto' | 'strict' | 'creative'>('auto');

  // State for Character Creator
  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null); // For modal UI
  const [activeCharacterContext, setActiveCharacterContext] = useState<Character | null>(null);
  
  // State for user-created content
  const [userObjects, setUserObjects] = useState<UserObject[]>([]);
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);
  const [customPalettes, setCustomPalettes] = useState<CustomPalette[]>([]);
  const [savedScenes, setSavedScenes] = useState<SavedScene[]>([]);

  const [selectionMask, setSelectionMask] = useState<string | null>(null);
  const [canvasAspectRatio, setCanvasAspectRatio] = useState('1 / 1');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // New state for Retouch tool
  const [brushSize, setBrushSize] = useState(57);
  const [retouchMode, setRetouchMode] = useState<'replace' | 'erase'>('replace');

  // New state for Crop tool
  const [cropBox, setCropBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<CropAspectRatio>('original');

  // New state for modals and tags
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [generationTags, setGenerationTags] = useState<Set<string>>(new Set());

  // State for Director Tool
  const [isDirectorModalOpen, setIsDirectorModalOpen] = useState(false);
  const [blueprintText, setBlueprintText] = useState('');
  const [parsedBlueprint, setParsedBlueprint] = useState<ParsedBlueprint | null>(null);
  const [unresolvedAssets, setUnresolvedAssets] = useState<UnresolvedAsset[]>([]);
  const [storyboardImages, setStoryboardImages] = useState<StoryboardImage[]>([]);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'parsing' | 'validating' | 'generating' | 'complete' | 'error'>('idle');
  
  // --- NEW UNIFIED MODAL STATE ---
  const [activeAssetModal, setActiveAssetModal] = useState<{
    modalType: 'character' | 'object' | 'scene' | null;
    initialData?: { name: string; description?: string; blueprintId?: string };
  }>({ modalType: null });
  
  // NEW STATE FOR SCENE INSPECTOR
  const [inspectingScene, setInspectingScene] = useState<SavedScene | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageReferenceInputRef = useRef<HTMLInputElement>(null);
  const styleReferenceInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
      if (!currentImage) {
          setCanvasAspectRatio('1 / 1');
      }
  }, [currentImage]);
  
  // Load all user content from local storage on initial render
  useEffect(() => {
    setSavedCharacters(getCharacters());
    setUserObjects(getObjects());
    setCustomStyles(getCustomStyles());
    setCustomPalettes(getCustomPalettes());
    setSavedScenes(getScenes());
    
    // Director Tool persistence
    const loadedProject = loadProject();
    if (loadedProject) {
        setBlueprintText(loadedProject.blueprintText);
        // MIGRATION LOGIC for cinematicStyle
        if (loadedProject.parsedBlueprint) {
            const bp = loadedProject.parsedBlueprint as any; // Cast to any to check for old field
            if (bp.globalContext && !bp.globalContext.cinematicStyle) {
                 bp.globalContext.cinematicStyle = {
                    cameraStyle: 'Static & Symmetrical',
                    pacingStyle: 'Long, deliberate takes',
                    lightingStyle: 'Soft, natural light',
                    colorPalette: 'Cinematic, balanced colors'
                };
            }
        }
        setParsedBlueprint(loadedProject.parsedBlueprint);
        setStoryboardImages(loadedProject.storyboardImages);
    }
  }, []);

  // Persist user content to local storage whenever it changes
  useEffect(() => { saveCharacters(savedCharacters); }, [savedCharacters]);
  useEffect(() => { saveObjects(userObjects); }, [userObjects]);
  useEffect(() => { saveCustomStyles(customStyles); }, [customStyles]);
  useEffect(() => { saveCustomPalettes(customPalettes); }, [customPalettes]);
  useEffect(() => { saveScenes(savedScenes); }, [savedScenes]);

  // Director Tool persistence
  useEffect(() => {
      if (!blueprintText && !parsedBlueprint && storyboardImages.length === 0) {
        return; // Avoid saving initial empty state over a loaded project
      }
      const projectState: DirectorProjectState = {
          blueprintText,
          parsedBlueprint,
          storyboardImages,
      };
      saveProject(projectState);
  }, [blueprintText, parsedBlueprint, storyboardImages]);


  const updateState = useCallback(<K extends keyof Omit<AppState, 'mainImage'>>(key: K, value: Omit<AppState, 'mainImage'>[K]) => {
    setAppState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMainImage = useCallback((imageData: string) => {
    const img = new Image();
    img.onload = () => {
        setCanvasAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
        setHistoryState(imageData);
    };
    img.src = imageData;
  }, [setHistoryState]);
  
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleAddImageReferenceClick = () => imageReferenceInputRef.current?.click();
  const handleAddStyleReferenceClick = () => styleReferenceInputRef.current?.click();

  const handleApiError = useCallback((err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
    // Heuristic to detect network/API errors vs. model errors (like safety blocks)
    const isOfflineError = ['network', 'fetch', 'api key', 'cors', 'http', 'unavailable', 'service'].some(keyword => errorMessage.includes(keyword));

    if (isOfflineError) {
        setIsApiOffline(true);
        updateState('error', `Could not connect to AI services. Please check your network. You can continue to use offline features.`);
    } else {
        // This is a regular model error (e.g., safety, bad prompt)
        const displayMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        updateState('error', `${context} failed: ${displayMessage}`);
    }
  }, [updateState]);

  const handleApiCall = useCallback(async <T extends unknown>(apiCall: () => Promise<T>, loadingMessage: string, errorContext: string): Promise<T | null> => {
      updateState('loadingMessage', loadingMessage);
      try {
          const result = await apiCall();
          if (isApiOffline) {
              setIsApiOffline(false); // Success, so we are online
              updateState('error', null); // Clear old offline error
          }
          return result;
      } catch (err) {
          handleApiError(err, errorContext);
          return null;
      } finally {
          updateState('loadingMessage', null);
      }
  }, [isApiOffline, handleApiError, updateState]);


  const handleToolSelect = useCallback((tool: Tool) => {
    const aiTools: Tool[] = ['generate', 'select', 'remove-bg', 'character', 'analyze', 'enhance', 'auto-enhance', 'director', 'restyle', 'scene'];
    if (isApiOffline && aiTools.includes(tool)) {
        updateState('error', 'This tool is unavailable while offline. Please check your network connection.');
        return;
    }
    if (tool === 'crop' && !currentImage) {
        updateState('error', 'Please upload an image to crop.');
        return;
    }
    
    if (appState.activeTool === 'crop' && tool !== 'crop') {
        setCropBox(null);
    }

    updateState('activeTool', tool);
    // When leaving the 'generate' tool, clear any active character context
    if (tool !== 'generate') {
        setActiveCharacterContext(null);
    }
    if (tool === 'upload' && fileInputRef.current) {
        fileInputRef.current.click();
    }
    if (tool === 'director') {
        setIsDirectorModalOpen(true);
        setActiveModal(null); 
    } else {
        setIsDirectorModalOpen(false);
    }
    if (tool === 'scene') {
        setActiveModal('scene');
    }
    if (tool === 'character') { // TASK 1.4 FIX
        setActiveModal('character');
    }
    if (tool === 'crop' && currentImage) { // TASK 1.3 LOGIC
        setCropBox({ x: 0, y: 0, width: 1, height: 1 });
        setCropAspectRatio('original');
    }
    if (tool === 'auto-enhance') {
        if (currentImage) {
            handleAutoEnhance("auto enhance this image with balanced adjustments"); 
        } else {
            updateState('error', 'Please upload an image to enhance.');
        }
    }
  }, [isApiOffline, currentImage, updateState, appState.activeTool]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files.item(0);
      if (file) {
        updateState('analysisResult', null);
        setSuggestedPresets([]); // Clear previous suggestions
        setActiveCharacterContext(null);
        setAnnotations([]); // Clear annotations
        setGeneratedImages([]); // Clear previous generations
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          // Reset history with the new image
          reset(base64);
          const img = new Image();
          img.onload = () => {
            setCanvasAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
          };
          img.src = base64;
        };
        reader.readAsDataURL(file);
        handleToolSelect('select');
      }
    }
     if (fileInputRef.current) fileInputRef.current.value = "";
  }, [reset, updateState, handleToolSelect]);
  
  const handleImageReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        // FIX: Replaced Array.from() with a standard for-loop to iterate through the FileList.
        // This ensures correct type inference for each `file` object, preventing it from being treated
        // as `unknown` and causing a type mismatch when passed to `FileReader.readAsDataURL`.
        const fileList = event.target.files;
        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const item = fileList.item(i);
            if (item) {
                files.push(item);
            }
        }
        const filesToProcess = files.slice(0, 8 - imageReferences.length);

        const promises = filesToProcess.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        Promise.all(promises).then(base64Images => {
            setImageReferences(prev => [...prev, ...base64Images]);
        });
        if (imageReferenceInputRef.current) imageReferenceInputRef.current.value = "";
    }
  };

  const handleStyleReferenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setStyleReference(base64);
      };
      reader.readAsDataURL(file);
    }
     if (styleReferenceInputRef.current) styleReferenceInputRef.current.value = "";
  };

  const handleRemoveImageReference = (index: number) => {
    setImageReferences(prev => prev.filter((_, i) => i !== index));
  };

   const handleRemoveStyleReference = () => {
    setStyleReference(null);
  };
  
  const applyMaskToImage = useCallback(async (imageB64: string, maskBase64: string, keepMaskedArea: boolean): Promise<string> => {
    try {
        const originalImage = new Image();
        originalImage.src = imageB64;
        await new Promise<void>((res, rej) => { originalImage.onload = () => res(); originalImage.onerror = rej; });

        const maskImage = new Image();
        maskImage.src = maskBase64;
        await new Promise<void>((res, rej) => { maskImage.onload = () => res(); maskImage.onerror = rej; });

        const canvas = document.createElement('canvas');
        canvas.width = originalImage.naturalWidth;
        canvas.height = originalImage.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context.');

        if (keepMaskedArea) {
            ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(originalImage, 0, 0);
        } else {
            ctx.drawImage(originalImage, 0, 0);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
        }

        return canvas.toDataURL('image/png');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        updateState('error', `Failed to apply transparency mask: ${message}`);
        throw err;
    }
  }, [updateState]);

  const handleTagToggle = (tag: string) => {
    setGenerationTags(prev => {
        const newTags = new Set(prev);
        if (newTags.has(tag)) {
            newTags.delete(tag);
        } else {
            newTags.add(tag);
        }
        return newTags;
    });
  };

  const handleGenerate = useCallback(async () => {
    let finalPrompt = generationPrompt;

    if (isAiPromptEnhancementEnabled && finalPrompt) {
        const enhanced = await handleApiCall(
            () => enhancePrompt(finalPrompt),
            'Enhancing prompt...',
            'Prompt enhancement'
        );
        if (enhanced) {
            finalPrompt = enhanced;
            setGenerationPrompt(enhanced);
        }
    }

    if (!currentImage) {
        // --- GENERATE FROM SCRATCH ---
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        setAnnotations([]);
        setGeneratedImages([]);

        const generationLogic = async () => {
            if (activeCharacterContext) {
                const scenePrompt = [finalPrompt, ...Array.from(generationTags)].filter(Boolean).join(', ');
                return await generateImageWithCharacter(
                    activeCharacterContext.referenceSheetImage,
                    activeCharacterContext.description,
                    scenePrompt || `A portrait of ${activeCharacterContext.name}`,
                    '',
                    aspectRatio
                );
            }

            const promptWithTags = [finalPrompt, ...Array.from(generationTags)].filter(Boolean).join(', ');
            if (!promptWithTags && !styleReference && !sceneReference && imageReferences.length === 0) {
                return null;
            }

            const referenceParts = imageReferences.map(imgB64 => {
                const match = imgB64.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid image reference format");
                return { mimeType: match[1], data: match[2] };
            });

            const stylePart = styleReference ? (() => {
                const match = styleReference.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid style reference format");
                return { mimeType: match[1], data: match[2] };
            })() : undefined;

            const scenePart = sceneReference ? (() => {
                const match = sceneReference.referenceSheetImage.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid scene reference format");
                return { mimeType: match[1], data: match[2] };
            })() : undefined;

            const numImagesToGen = (imageReferences.length > 0 || !!styleReference || !!sceneReference) ? 1 : numberOfImages;

            return await generateImage(
                promptWithTags, '', aspectRatio, generationModel,
                numImagesToGen, referenceParts, stylePart, scenePart
            );
        };

        const imagesB64 = await handleApiCall(
            generationLogic,
            activeCharacterContext ? `Generating scene with ${activeCharacterContext.name}...` : 'Generating image(s)...',
            'Image generation'
        );

        if (imagesB64) {
            const imageArray = Array.isArray(imagesB64) ? imagesB64 : [imagesB64];
            if (imageArray.length > 0) {
                setMainImage(imageArray[0]);
                setGeneratedImages(imageArray);
            }
        }
    } else {
        // --- MODIFY EXISTING IMAGE ---
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        setAnnotations([]);

        const modificationLogic = async () => {
            const promptWithTags = [finalPrompt, ...Array.from(generationTags)].filter(Boolean).join(', ');

            if (activeCharacterContext) {
                return await generateImageWithCharacter(
                    activeCharacterContext.referenceSheetImage,
                    activeCharacterContext.description,
                    promptWithTags || `Integrate ${activeCharacterContext.name} into the scene.`,
                    '',
                    aspectRatio,
                    currentImage
                );
            }

            const referenceParts = imageReferences.map(imgB64 => {
                const match = imgB64.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid image reference format");
                return { mimeType: match[1], data: match[2] };
            });

            const stylePart = styleReference ? (() => {
                const match = styleReference.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid style reference format");
                return { mimeType: match[1], data: match[2] };
            })() : undefined;

            const scenePart = sceneReference ? (() => {
                const match = sceneReference.referenceSheetImage.match(/data:(.*?);base64,(.*)/);
                if (!match) throw new Error("Invalid scene reference format");
                return { mimeType: match[1], data: match[2] };
            })() : undefined;

            return await generateImage(
                promptWithTags, '', aspectRatio, generationModel,
                1, // Modification always produces one image
                referenceParts, stylePart, scenePart,
                currentImage // Pass base image for modification
            );
        };

        const modifiedImageB64 = await handleApiCall(
            modificationLogic,
            'Modifying image...',
            'Image modification'
        );

        if (modifiedImageB64) {
            const imageArray = Array.isArray(modifiedImageB64) ? modifiedImageB64 : [modifiedImageB64];
            if (imageArray.length > 0) {
                setMainImage(imageArray[0]);
                setGeneratedImages(imageArray);
            }
        }
    }
  }, [
    generationPrompt, isAiPromptEnhancementEnabled, handleApiCall, updateState,
    activeCharacterContext, generationTags, aspectRatio, styleReference,
    sceneReference, imageReferences, numberOfImages, generationModel, setMainImage,
    currentImage
  ]);
  

  const handleApplyEdit = useCallback(async (fullImage = false) => {
    if (!currentImage || (retouchMode === 'replace' && !editPrompt)) {
        if (retouchMode === 'replace') updateState('error', 'Please describe what you want to replace the selection with.');
        return;
    }
    if (!selectionMask && !fullImage) {
        updateState('error', 'Please make a selection first.');
        return;
    }
    
    setSelectionMask(null);
    setEditPrompt('');
    setSuggestedPresets([]);
    updateState('analysisResult', null);

    const editedImageB64 = await handleApiCall(
        () => {
            const maskToApply = fullImage ? null : selectionMask;
            let instruction: string;
            if (retouchMode === 'replace') {
                instruction = `This is an inpainting task. The user has provided an image, a mask, and a text prompt. Replace ONLY the content within the masked area based on the user's prompt. The replacement must seamlessly blend with the surrounding unmasked area. Do NOT alter any part of the image outside the masked region. User's prompt: "${editPrompt}"`;
            } else { // erase mode
                instruction = `This is an inpainting task. The user has provided an image and a mask. Realistically fill the area defined by the mask with content that logically and seamlessly matches the surrounding background. The goal is to make it appear as if the object within the mask was never there. Do not alter any part of the image outside the masked region.`;
            }
            return editImage(currentImage, instruction, { maskBase64: maskToApply });
        },
        'Applying edits...',
        'Image edit'
    );
    if (editedImageB64) {
        setMainImage(editedImageB64);
        setGeneratedImages([]);
    }
  }, [currentImage, editPrompt, selectionMask, retouchMode, handleApiCall, updateState, setMainImage]);
  
  const handleRemoveBackground = useCallback(async () => {
    if (!currentImage) {
        updateState('error', 'Please upload an image.');
        return;
    }
    
    setSuggestedPresets([]);
    updateState('analysisResult', null);
    const mask = await handleApiCall(
        () => getSelectionMaskFromPrompt(currentImage, "the main subject"),
        'Removing background...',
        'Failed to remove background'
    );
    if (mask) {
        const newImage = await applyMaskToImage(currentImage, mask, true);
        setMainImage(newImage);
        setGeneratedImages([]);
    }
  }, [currentImage, applyMaskToImage, handleApiCall, updateState, setMainImage]);

  const handleReplaceBackground = async (prompt: string) => {
    if (!currentImage) {
        updateState('error', 'Please upload an image first.');
        return;
    }
    setSuggestedPresets([]);
    updateState('analysisResult', null);
    const mask = await handleApiCall(
        () => getSelectionMaskFromPrompt(currentImage, "the main subject"),
        'Masking subject...',
        'Background replacement'
    );

    if (mask) {
        const instruction = `The user has provided an image and a mask identifying the main subject. Replace everything OUTSIDE the masked area with a new background: "${prompt}". Seamlessly blend the new background with the subject. Do not alter the subject inside the masked area.`;
        
        const newImage = await handleApiCall(
            () => editImage(currentImage, instruction, { maskBase64: mask }),
            'Replacing background...',
            'Background replacement'
        );

        if (newImage) {
            setMainImage(newImage);
            setGeneratedImages([]);
        }
    }
  };

  const handleColorBackground = async (color: string) => {
    if (!currentImage) {
        updateState('error', 'Please upload an image first.');
        return;
    }
    setSuggestedPresets([]);
    updateState('analysisResult', null);
    const newImage = await handleApiCall(async () => {
        const subjectMask = await getSelectionMaskFromPrompt(currentImage, "the main subject");
        if (!subjectMask) throw new Error("Could not create a mask for the main subject.");

        const subjectWithAlpha = await applyMaskToImage(currentImage, subjectMask, true);
        
        const subjectImg = new Image();
        subjectImg.src = subjectWithAlpha;
        await new Promise((resolve, reject) => {
            subjectImg.onload = resolve;
            subjectImg.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = subjectImg.naturalWidth;
        canvas.height = subjectImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context.");

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(subjectImg, 0, 0);
        return canvas.toDataURL('image/png');
    }, 'Applying color background...', 'Color background');

    if (newImage) {
        setMainImage(newImage);
        setGeneratedImages([]);
    }
  };

  const handleAISelect = useCallback(async (prompt: string) => {
      if (!currentImage) {
          updateState('error', 'Please add an image before making a selection.');
          return;
      }
      const mask = await handleApiCall(() => getSelectionMaskFromPrompt(currentImage, prompt), 'Creating selection mask...', 'AI selection');
      if (mask) {
        setSelectionMask(mask);
        setSelectionMode('brush'); // Switch back to brush mode for editing
      }
  }, [currentImage, handleApiCall, updateState]);

  const applyAdjustmentsToImage = useCallback(async (base64Image: string, adjustments: Adjustments): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            
            ctx.filter = `
              brightness(${adjustments.brightness}%) 
              contrast(${adjustments.contrast}%) 
              saturate(${adjustments.saturation}%)
              hue-rotate(${adjustments.hue}deg)
            `;
            ctx.drawImage(img, 0, 0);
            
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = base64Image;
    });
  }, []);

  const handleApplyAdjustments = useCallback(async () => {
    if (!currentImage) return;
    updateState('loadingMessage', 'Applying adjustments...');
    setSuggestedPresets([]);
    updateState('analysisResult', null);
    try {
        const newImage = await applyAdjustmentsToImage(currentImage, panelAdjustments);
        setMainImage(newImage);
        setGeneratedImages([]);
        toast.success('Adjustments applied!');
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        updateState('error', `Failed to apply adjustments: ${message}`);
    } finally {
        updateState('loadingMessage', null);
    }
  }, [currentImage, panelAdjustments, applyAdjustmentsToImage, setMainImage, updateState]);

  const handleResetAdjustments = useCallback(() => {
    setPanelAdjustments(DEFAULT_ADJUSTMENTS);
    toast.success('Adjustments have been reset');
  }, []);

  const handleAutoEnhance = useCallback(async (prompt: string) => {
      if (!currentImage) return;
      const adjustments = await handleApiCall(() => getAIAdjustments(prompt, currentImage), 'Analyzing for enhancements...', 'AI enhancement');
      if (adjustments) {
          setPanelAdjustments(prev => ({ ...prev, ...adjustments }));
          handleToolSelect('adjust');
      }
  }, [currentImage, handleApiCall, handleToolSelect]);

    const handleApplySuggestedAdjustment = useCallback(async (suggestionPrompt: string) => {
        if (!currentImage) return;

        // Clear the analysis/suggestions UI immediately for good feedback
        updateState('analysisResult', null);
        setSuggestedPresets([]);

        // Handle crop suggestions specifically
        if (suggestionPrompt.toLowerCase().includes('crop')) {
            toast('Crop tool activated as per suggestion.');
            handleToolSelect('crop');
            return;
        }
        
        // Handle restyle suggestions (more general edits)
        if (suggestionPrompt.toLowerCase().includes('restyle') || suggestionPrompt.toLowerCase().includes('style') || suggestionPrompt.toLowerCase().includes('look')) {
            const editedImageB64 = await handleApiCall(() => editImage(currentImage, suggestionPrompt, { maskBase64: null }), 'Applying suggestion...', 'Image restyle');
            if (editedImageB64) {
                setMainImage(editedImageB64);
                setGeneratedImages([]);
            }
            return;
        }

        // Default to applying as a color/light adjustment
        const adjustments = await handleApiCall(() => getAIAdjustments(suggestionPrompt, currentImage), 'Applying suggestion...', 'Failed to apply suggestion');
        if (adjustments) {
            const newImage = await applyAdjustmentsToImage(currentImage, { ...DEFAULT_ADJUSTMENTS, ...adjustments});
            setMainImage(newImage);
            setGeneratedImages([]);
        }
    }, [currentImage, applyAdjustmentsToImage, handleApiCall, setMainImage, updateState, handleToolSelect]);

    const handleAnalyzeImage = useCallback(async () => {
        if (!currentImage) {
            updateState('error', 'Please upload an image to analyze.');
            return;
        }
        const result = await handleApiCall(() => analyzeImage(currentImage), 'Analyzing image...', 'Image analysis');
        if (result) {
            updateState('analysisResult', result);
            const suggestions = await handleApiCall(() => getSuggestedAdjustments(currentImage, result), 'Generating suggestions...', 'Suggestion generation');
            if (suggestions) {
                setSuggestedPresets(suggestions);
            }
            handleToolSelect('analyze');
        }
    }, [currentImage, handleApiCall, updateState, handleToolSelect]);

    const handleModifyColor = useCallback(async (oldColorName: string, newColorNameOrHex: string) => {
        if (!currentImage) return;
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        const prompt = `Change all occurrences of the color ${oldColorName} to ${newColorNameOrHex}. Preserve the texture and lighting.`;
        const editedImageB64 = await handleApiCall(() => editImage(currentImage, prompt, { maskBase64: null }), 'Changing colors...', 'Color modification');
        if (editedImageB64) {
            setMainImage(editedImageB64);
            setGeneratedImages([]);
        }
    }, [currentImage, handleApiCall, setMainImage, updateState]);

    const handleModifyMood = useCallback(async (moodPrompt: string) => {
        if (!currentImage) return;
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        const adjustments = await handleApiCall(() => getAIAdjustments(moodPrompt, currentImage), 'Adjusting mood...', 'AI enhancement');
        if (adjustments) {
            const newImage = await applyAdjustmentsToImage(currentImage, { ...DEFAULT_ADJUSTMENTS, ...adjustments});
            setMainImage(newImage);
            setGeneratedImages([]);
        }
    }, [currentImage, applyAdjustmentsToImage, handleApiCall, setMainImage, updateState]);
  
  const handleCommandSubmit = useCallback(async (command: string) => {
      await handleApiCall(async () => {
          updateState('analysisResult', null);
          setSuggestedPresets([]);
          const intent = await getIntentFromText(command, currentImage, aiMode);
          if (!intent) {
              updateState('error', 'Could not understand the command.');
              return;
          }

          switch (intent.action) {
              case 'select':
                  if (intent.target) {
                      await handleAISelect(intent.target);
                  } else {
                      updateState('error', "Please specify what you'd like to select.");
                  }
                  break;

              case 'remove':
              case 'erase':
                  if (currentImage && intent.target) {
                      const mask = await getSelectionMaskFromPrompt(currentImage, intent.target);
                      if (mask) {
                          const instruction = `Remove the subject located in the masked region of the image. Fill the masked area with a realistic background that seamlessly matches the surrounding textures, lighting, and content. Do not alter the image outside of the masked region.`;
                          const editedImageB64 = await editImage(currentImage, instruction, { maskBase64: mask });
                          if (editedImageB64) {
                              setMainImage(editedImageB64);
                              setGeneratedImages([]);
                          }
                      }
                  } else {
                      updateState('error', 'Please specify what to remove from the image.');
                  }
                  break;

              case 'add':
              case 'change':
              case 'replace':
                  if (currentImage && intent.target && intent.parameters?.description) {
                       const mask = await getSelectionMaskFromPrompt(currentImage, intent.target);
                       if (mask) {
                           const instruction = `In the masked region, replace the content with the following: "${intent.parameters.description}". The replacement should seamlessly blend with the surrounding textures, lighting, and style.`;
                           const editedImageB64 = await editImage(currentImage, instruction, { maskBase64: mask });
                           if (editedImageB64) {
                              setMainImage(editedImageB64);
                              setGeneratedImages([]);
                           }
                       }
                  } else {
                      updateState('error', 'Please specify what to change and what to change it to.');
                  }
                  break;

              case 'adjust':
                  if (currentImage && (intent.parameters?.mood || intent.parameters?.description)) {
                      const moodPrompt = intent.parameters?.mood || intent.parameters?.description || '';
                      const adjustments = await getAIAdjustments(moodPrompt, currentImage);
                       if (adjustments) {
                          const newImage = await applyAdjustmentsToImage(currentImage, { ...DEFAULT_ADJUSTMENTS, ...adjustments});
                          setMainImage(newImage);
                          setGeneratedImages([]);
                      }
                  } else {
                       updateState('error', 'Please describe the adjustment you want to make.');
                  }
                  break;
              
              case 'generate':
                   if (intent.parameters?.description) {
                        updateState('activeTool', 'generate');
                        setGenerationPrompt(intent.parameters.description);
                        // A simple, direct generation for conversational use
                        const imagesB64 = await generateImage(intent.parameters.description, '', aspectRatio, generationModel, 1);
                        if (imagesB64 && imagesB64.length > 0) {
                            setMainImage(imagesB64[0]);
                            setGeneratedImages(imagesB64);
                        }
                   } else {
                       updateState('error', 'Please describe the image you want to generate.');
                   }
                   break;

              default:
                  updateState('error', `Action '${intent.action}' is not supported yet.`);
          }
      }, 'Processing command...', 'Failed to execute command');
  }, [currentImage, aiMode, handleApiCall, updateState, handleAISelect, applyAdjustmentsToImage, setMainImage, aspectRatio, generationModel, setGenerationPrompt]);

  const handleDownload = async () => {
      if (!currentImage) return;
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `nano-banana-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };
  
  const handleReset = () => {
    reset();
    toast.success('Image reset to original');
  };

  const handleMaskChange = useCallback((maskDataUrl: string | null) => {
      setSelectionMask(maskDataUrl);
  }, []);

  const handleCreateCharacter = async (images: string[], name: string, description?: string): Promise<Character> => {
    if ((images.length === 0 && !description) || !name) {
        const errorMsg = 'Please provide a name and either images or a description.';
        updateState('error', errorMsg);
        throw new Error(errorMsg);
    }
    const result = await handleApiCall(() => createAssetFromImages(images, name, 'character', description), 'Creating character...', 'Character creation');
    if (!result) throw new Error("Character creation failed to return data.");
    
    const compressedSheet = await compressImageForStorage(result.sheetImage, 1024, 0.8, 'jpeg');
    const compressedAvatar = await compressImageForStorage(result.sheetImage, 256, 0.8, 'jpeg');

    const newCharacter: Character = { id: `char-${Date.now()}`, name, description: result.description, referenceSheetImage: compressedSheet, avatar: compressedAvatar };
    setSavedCharacters(prev => [...prev, newCharacter]);
    return newCharacter;
  };

  const handleUpdateCharacter = (updatedCharacter: Character) => {
    setSavedCharacters(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
    toast.success(`${updatedCharacter.name} updated!`);
  };

  const handleDeleteCharacter = (id: string) => {
    setSavedCharacters(prev => prev.filter(char => char.id !== id));
    if (activeCharacterContext?.id === id) {
        setActiveCharacterContext(null);
    }
  };

  const handleSelectCharacterForGeneration = (character: Character | null) => {
    setActiveCharacterContext(character);
    if (character) {
      setActiveModal(null);
    }
  };
  
  const handleClearCharacterContext = () => {
    setActiveCharacterContext(null);
  };
  
  const handleCreateObject = async (prompt: string, description?: string): Promise<UserObject> => {
    if (!prompt) {
        const errorMsg = 'Please provide a description for the new object.';
        updateState('error', errorMsg);
        throw new Error(errorMsg);
    }
    const result = await handleApiCall(async () => {
        const image = await generateObject(prompt);
        // If a description is provided (from a discovered asset), use it. Otherwise, get one.
        const finalDescription = description || (await getIntentFromText(`describe this object: ${prompt}`, image, 'strict')).parameters?.description || `A ${prompt}`;
        return { image, description: finalDescription };
    }, 'Creating object template...', 'Object creation');
    if (!result) throw new Error("Object creation failed.");

    const compressedImage = await compressImageForStorage(result.image, 512, 1.0, 'png');
    const newObject: UserObject = { id: `obj-${Date.now()}`, name: prompt, description: result.description, referenceSheetImage: compressedImage, avatar: compressedImage };
    setUserObjects(prev => [...prev, newObject]);
    return newObject;
  };

  const handleUpdateObject = (updatedObject: UserObject) => {
    setUserObjects(prev => prev.map(o => o.id === updatedObject.id ? updatedObject : o));
    toast.success(`${updatedObject.name} updated!`);
  };

  const handleDeleteObject = (id: string) => {
    setUserObjects(prev => prev.filter(obj => obj.id !== id));
  };
    
  const handleCreateScene = async (images: string[], name: string, description: string): Promise<SavedScene> => {
    const cleanedImages = await handleApiCall(() => Promise.all(images.map(img => cleanImageOfUI(img))), `Cleaning source images...`, 'Image cleaning');
    if (!cleanedImages) throw new Error("Failed to clean images for scene creation.");

    const envData = await handleApiCall(() => createVirtualEnvironment(cleanedImages, description), `Generating virtual environment...`, 'Scene creation');
    if (!envData) throw new Error("Failed to create virtual environment.");
    
    const compressedSheet = await compressImageForStorage(envData.referenceSheetImage, 1024, 0.8, 'jpeg');
    const compressedAvatar = await compressImageForStorage(envData.avatar, 256, 0.8, 'jpeg');
    const newScene: SavedScene = { id: `scene-${Date.now()}`, name, ...envData, referenceSheetImage: compressedSheet, avatar: compressedAvatar };
    setSavedScenes(prev => [...prev, newScene]);
    return newScene;
  };

  const handleDeleteScene = (id: string) => {
    setSavedScenes(prev => prev.filter(scene => scene.id !== id));
  };

    // --- NEW: SCENE INSPECTOR HANDLERS ---
    const handleOpenSceneInspector = (sceneId: string) => {
        const sceneToInspect = savedScenes.find(s => s.id === sceneId);
        if (sceneToInspect) {
            setInspectingScene(sceneToInspect);
            setActiveModal(null); // Close the scene selection modal
        }
    };

    const handleUpdateScene = (updatedScene: SavedScene) => {
        const newScenes = savedScenes.map(s => s.id === updatedScene.id ? updatedScene : s);
        setSavedScenes(newScenes);
        if (inspectingScene && inspectingScene.id === updatedScene.id) {
            setInspectingScene(updatedScene);
        }
    };

    const handleRegenerateSceneAsset = async (sceneId: string, assetType: 'technicalSheet' | 'detailShots' | 'aerialMap', prompt: string) => {
        const sceneToUpdate = savedScenes.find(s => s.id === sceneId);
        if (!sceneToUpdate) return;
        
        const newAsset = await handleApiCall(() => regenerateSceneAsset(sceneToUpdate, assetType, prompt), `Regenerating ${assetType}...`, 'Failed to regenerate asset');
        if (newAsset) {
            const updatedScene = { ...sceneToUpdate, ...newAsset };
            handleUpdateScene(updatedScene);
        }
    };

    const handleCastObjectInScene = (sceneId: string, objectId: string, shouldCast: boolean) => {
        const newScenes = savedScenes.map(scene => {
            if (scene.id === sceneId) {
                const currentCast = scene.castObjectIds || [];
                const newCast = shouldCast ? [...currentCast, objectId] : currentCast.filter(id => id !== objectId);
                const updatedScene = { ...scene, castObjectIds: Array.from(new Set(newCast)) };
                if (inspectingScene && inspectingScene.id === sceneId) setInspectingScene(updatedScene);
                return updatedScene;
            }
            return scene;
        });
        setSavedScenes(newScenes);
    };

    const handleRandomPrompt = () => {
        const randomPrompt = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
        setGenerationPrompt(randomPrompt);
    };

    const handleRandomStyle = () => console.log("Random style shuffle clicked");

    const handleAddAnnotation = useCallback((x: number, y: number) => {
        if (!currentImage || appState.activeTool === 'select' || appState.activeTool === 'crop') return;
        const newAnnotation: Annotation = { id: `anno-${Date.now()}`, x, y, text: '' };
        setAnnotations(prev => [...prev, newAnnotation]);
    }, [currentImage, appState.activeTool]);

    const handleUpdateAnnotationText = useCallback((id: string, text: string) => {
        setAnnotations(prev => prev.map(anno => anno.id === id ? { ...anno, text } : anno));
    }, []);

    const handleDeleteAnnotation = useCallback((id: string) => {
        setAnnotations(prev => prev.filter(anno => anno.id !== id));
    }, []);

    const handleVisualSubmit = useCallback(async () => {
        if (!currentImage || annotations.length === 0) return;
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        const editedImageB64 = await handleApiCall(() => editImageWithAnnotations(currentImage, annotations), 'Applying visual edits...', 'Visual edit');
        if (editedImageB64) {
            setMainImage(editedImageB64);
            setGeneratedImages([]);
            setAnnotations([]);
        }
    }, [currentImage, annotations, handleApiCall, setMainImage, updateState]);

    const handleApplyCrop = useCallback(async () => {
      if (!currentImage || !cropBox) return;
  
      updateState('loadingMessage', 'Applying crop...');
      updateState('analysisResult', null);
      setSuggestedPresets([]);
      try {
          const img = new Image();
          img.src = currentImage;
          await new Promise(resolve => { img.onload = resolve });
  
          const canvas = document.createElement('canvas');
          const cropX = img.naturalWidth * cropBox.x;
          const cropY = img.naturalHeight * cropBox.y;
          const cropWidth = img.naturalWidth * cropBox.width;
          const cropHeight = img.naturalHeight * cropBox.height;
  
          canvas.width = cropWidth;
          canvas.height = cropHeight;
  
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Could not get canvas context");
          
          ctx.drawImage(
              img,
              cropX, cropY,
              cropWidth, cropHeight,
              0, 0,
              cropWidth, cropHeight
          );
  
          const croppedImageB64 = canvas.toDataURL('image/png');
          setMainImage(croppedImageB64);
          setCropBox(null);
          updateState('activeTool', 'select');
          setGeneratedImages([]);
          toast.success('Image cropped!');
  
      } catch (err) {
          const message = err instanceof Error ? err.message : 'An unknown error occurred.';
          updateState('error', `Failed to crop image: ${message}`);
      } finally {
          updateState('loadingMessage', null);
      }
    }, [currentImage, cropBox, setMainImage, updateState]);

    const handleCancelCrop = useCallback(() => {
        setCropBox(null);
        updateState('activeTool', 'select');
    }, [updateState]);
    
    const handleCropAspectRatioChange = useCallback((newRatio: CropAspectRatio) => {
        setCropAspectRatio(newRatio);

        if (!cropBox || !currentImage) return;

        const img = new Image();
        img.onload = () => {
            const originalImageRatio = img.naturalWidth / img.naturalHeight;
            let targetRatio: number;

            if (newRatio === 'original') {
                targetRatio = originalImageRatio;
            } else if (newRatio === 'free') {
                return; // no change needed for free
            } else {
                const [w, h] = newRatio.split(':').map(Number);
                targetRatio = w / h;
            }
            
            const oldCenterX = cropBox.x + cropBox.width / 2;
            const oldCenterY = cropBox.y + cropBox.height / 2;

            let newWidth: number, newHeight: number;

            if (cropBox.width / cropBox.height > targetRatio) {
                newHeight = cropBox.height;
                newWidth = newHeight * targetRatio;
            } else {
                newWidth = cropBox.width;
                newHeight = newWidth / targetRatio;
            }

            if (newWidth > 1) { newWidth = 1; newHeight = newWidth / targetRatio; }
            if (newHeight > 1) { newHeight = 1; newWidth = newHeight * targetRatio; }
            
            let newX = oldCenterX - newWidth / 2;
            let newY = oldCenterY - newHeight / 2;

            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + newWidth > 1) newX = 1 - newWidth;
            if (newY + newHeight > 1) newY = 1 - newHeight;

            setCropBox({ x: newX, y: newY, width: newWidth, height: newHeight });
        };
        img.src = currentImage;
    }, [cropBox, currentImage]);


    const handleEnhanceImage = useCallback(async (type: 'upscale' | 'face' | 'lighting' | 'noise', settings?: any) => {
        if (!currentImage) return;
        updateState('analysisResult', null);
        setSuggestedPresets([]);
    
        const getPromptAndMessage = () => {
            switch (type) {
                case 'upscale':
                    if (settings?.creativity) {
                        return {
                            prompt: `Upscale this image to a higher resolution, adding plausible details with a creativity level of ${settings.creativity}.`,
                            message: 'Upscaling image...'
                        };
                    }
                    return {
                        prompt: `Enhance this image by increasing its resolution and sharpening details, without adding new content.`,
                        message: 'Upscaling image...'
                    };
                case 'face':
                    return {
                        prompt: `Restore and enhance any faces in this image, improving clarity and realism without changing their features.`,
                        message: 'Restoring faces...'
                    };
                case 'lighting':
                    return {
                        prompt: `This is a photo editing task. Analyze the lighting of the provided image. Automatically adjust the exposure, contrast, shadows, and highlights to create a well-balanced, professional-looking photograph. The goal is a natural correction, not an artistic stylization. Do not alter the content of the image, only the lighting.`,
                        message: 'Fixing lighting...'
                    };
                case 'noise':
                    return {
                        prompt: `This is a photo editing task. Analyze the provided image for digital noise or film grain. Apply a noise reduction process to create a cleaner, smoother image. Be careful to preserve important details and textures. Do not sharpen the image or alter its colors; focus only on removing unwanted noise and grain.`,
                        message: 'Removing noise...'
                    };
                default:
                    return {
                        prompt: 'Enhance this image.',
                        message: 'Enhancing image...'
                    };
            }
        };
    
        const { prompt, message } = getPromptAndMessage();
    
        const enhancedImageB64 = await handleApiCall(
            () => enhanceImage(currentImage, prompt),
            message,
            'Image enhancement'
        );
    
        if (enhancedImageB64) {
            setMainImage(enhancedImageB64);
            setGeneratedImages([]);
        }
    }, [currentImage, handleApiCall, setMainImage, updateState]);

    const handleAssetAssigned = useCallback((assignedAsset: Character | UserObject | SavedScene) => {
        if (!parsedBlueprint || !activeAssetModal.initialData?.blueprintId) return;

        let assetType: 'character' | 'object' | 'scene' | undefined;
        if ('referenceSheetImage' in assignedAsset && 'description' in assignedAsset && !('userImages' in assignedAsset)) {
             assetType = 'character'; // Could also be object, but logic is same
        } else if ('userImages' in assignedAsset) {
            assetType = 'scene';
        }
        
        if (assetType === 'character' || assetType === 'object') {
            const charRef = parsedBlueprint.globalContext.characters.find(c => c.id === activeAssetModal.initialData?.blueprintId);
            if(charRef) charRef.assignedCharacterId = assignedAsset.id;
        }

        const newErrors = unresolvedAssets.filter(e => e.blueprintId !== activeAssetModal.initialData?.blueprintId);
        setUnresolvedAssets(newErrors);
        setActiveAssetModal({ modalType: null });

        if (newErrors.length === 0) {
            const initialImages: StoryboardImage[] = parsedBlueprint.scenes.flatMap(scene => 
                Array.from({ length: parsedBlueprint.directives.imageCountPerScene }, (_, i) => ({
                    sceneNumber: scene.sceneNumber,
                    frameNumber: i + 1,
                    imageData: null,
                    status: 'pending'
                }))
            );
            setStoryboardImages(initialImages);
            setGenerationStatus('idle');
        }
    }, [parsedBlueprint, activeAssetModal.initialData, unresolvedAssets]);

    // Director Tool Handlers
    const handleParseBlueprint = useCallback(async () => {
        setGenerationStatus('parsing');
        setParsedBlueprint(null);
        setUnresolvedAssets([]);
        setStoryboardImages([]);
        const result = await handleApiCall(() => parseBlueprint(blueprintText), 'Parsing blueprint...', 'Blueprint parsing');
        if(result) {
            setParsedBlueprint(result);
            setGenerationStatus('validating');
            
            const unresolved: UnresolvedAsset[] = [];
            result.globalContext.characters.forEach(char => {
                const found = savedCharacters.find(sChar => sChar.name === char.name);
                if (!found) {
                    const charDesc = result.globalContext.characterDescriptions?.find(d => d.name === char.name);
                    unresolved.push({ type: 'Character', name: char.name, blueprintId: char.id, description: charDesc?.description });
                }
                else char.assignedCharacterId = found.id;
            });
            
            setUnresolvedAssets(unresolved);

            if (unresolved.length === 0) {
                 const initialImages: StoryboardImage[] = result.scenes.flatMap(scene => 
                    Array.from({ length: result.directives.imageCountPerScene }, (_, i) => ({
                        sceneNumber: scene.sceneNumber,
                        frameNumber: i + 1,
                        imageData: null,
                        status: 'pending'
                    }))
                );
                setStoryboardImages(initialImages);
                setGenerationStatus('idle');
            }
        } else {
            setGenerationStatus('error');
        }
    }, [blueprintText, handleApiCall, savedCharacters]);
    
    // --- NEW UNIFIED ASSET HANDLER ---
    const handleCreateOrResolveAsset = useCallback((assetData: UnresolvedAsset) => {
        setActiveAssetModal({
            modalType: assetData.type.toLowerCase() as 'character' | 'object' | 'scene',
            initialData: { name: assetData.name, description: assetData.description, blueprintId: assetData.blueprintId }
        });
    }, []);

    const handleAddUnresolvedAsset = useCallback((asset: UnresolvedAsset) => {
        setUnresolvedAssets(prev => {
            // Avoid duplicates
            if (prev.some(a => a.name === asset.name && a.type === asset.type)) {
                return prev;
            }
            return [...prev, asset];
        });
    }, []);

    const handleImagineAsset = useCallback((blueprintId: string) => {
        if (!parsedBlueprint) return;

        setParsedBlueprint(prev => {
            if (!prev) return null;
            const newCharacters = prev.globalContext.characters.map(char => 
                char.id === blueprintId ? { ...char, isImagined: true } : char
            );
            return {
                ...prev,
                globalContext: { ...prev.globalContext, characters: newCharacters },
            };
        });
        
        setUnresolvedAssets(prev => prev.filter(asset => asset.blueprintId !== blueprintId));
    }, [parsedBlueprint]);

    const handleGenerateStoryboard = useCallback(async () => {
        if (!parsedBlueprint) return;
        setGenerationStatus('generating');
        setStoryboardImages(prev => prev.map(img => ({ ...img, status: 'generating', errorMessage: undefined })));
    
        let previousFrameB64: string | null = null;
        let lastSceneNumber = -1;
    
        for (const image of storyboardImages.sort((a,b) => a.sceneNumber - b.sceneNumber || a.frameNumber - b.frameNumber)) {
            // Reset reference for new scenes
            if (image.sceneNumber !== lastSceneNumber) {
                previousFrameB64 = null;
                lastSceneNumber = image.sceneNumber;
            }
            
            try {
                const sceneData = parsedBlueprint.scenes.find(s => s.sceneNumber === image.sceneNumber);
                if (!sceneData) throw new Error(`Scene data not found for scene ${image.sceneNumber}.`);
                
                const cinematicStyle = parsedBlueprint.globalContext.cinematicStyle;
                let prompt = `[SCENE ${sceneData.sceneNumber}, SHOT ${image.frameNumber}] Cinematic shot. ${sceneData.setting}. Time: ${sceneData.time}. Action: ${sceneData.action}. Camera: ${sceneData.camera}. Lighting: ${sceneData.lighting}. `;
                prompt += `Overall Cinematic Style guidance: Camera work should be '${cinematicStyle.cameraStyle}'. The lighting must be '${cinematicStyle.lightingStyle}'. The color palette is '${cinematicStyle.colorPalette}'.`;
    
                const charactersWithAssets: Character[] = [];
                let imaginedCharactersPrompt = '';

                const allCharactersInScene = (parsedBlueprint.globalContext.characters || [])
                    .filter(bpChar => 
                        sceneData.action.toUpperCase().includes(bpChar.name.toUpperCase()) || 
                        sceneData.dialogue.toUpperCase().includes(bpChar.name.toUpperCase())
                    );
                
                for (const bpChar of allCharactersInScene) {
                    if (bpChar.assignedCharacterId) {
                        const characterAsset = savedCharacters.find(sc => sc.id === bpChar.assignedCharacterId);
                        if (characterAsset) charactersWithAssets.push(characterAsset);
                    } else if (bpChar.isImagined) {
                        const charDesc = parsedBlueprint.globalContext.characterDescriptions?.find(d => d.name === bpChar.name);
                        if (charDesc) {
                            imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}, who is ${charDesc.description}.`;
                        } else {
                            imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}.`;
                        }
                    }
                }
                
                const finalPrompt = prompt + imaginedCharactersPrompt;

                const imageData = await handleApiCall(() => generateStoryboardImage(
                    finalPrompt, charactersWithAssets, previousFrameB64 ? [previousFrameB64] : null, parsedBlueprint.directives.aspectRatio
                ), `Generating S${image.sceneNumber}:${image.frameNumber}...`, 'Storyboard Generation');
    
                if (imageData) {
                    setStoryboardImages(prev => prev.map(img => 
                        (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                        ? { ...img, imageData, status: 'complete' } 
                        : img
                    ));
                    previousFrameB64 = imageData;
                } else {
                    throw new Error('API returned no image.');
                }
            } catch(err) {
                const message = err instanceof Error ? err.message : 'Unknown error';
                setStoryboardImages(prev => prev.map(img => 
                    (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                    ? { ...img, status: 'error', errorMessage: message } 
                    : img
                ));
            }
        }
        setGenerationStatus('complete');
    }, [parsedBlueprint, storyboardImages, savedCharacters, handleApiCall]);
    
    const handleRetryImage = useCallback(async (imageToRetry: StoryboardImage) => {
         if (!parsedBlueprint) return;
        setStoryboardImages(prev => prev.map(img => img === imageToRetry ? { ...img, status: 'generating', errorMessage: undefined } : img));
        // ... (Re-run logic similar to handleGenerateStoryboard for a single image)
    }, [parsedBlueprint, storyboardImages, savedCharacters, handleApiCall]);

    const handleUpdateGlobalContext = (field: keyof ParsedBlueprint['globalContext'], value: any) => {
      if (parsedBlueprint) {
        setParsedBlueprint({ ...parsedBlueprint, globalContext: { ...parsedBlueprint.globalContext, [field]: value }});
      }
    };

    const handleGenerateSingleScene = useCallback(async (sceneNumber: number, forceRegenerate = false) => {
      if (!parsedBlueprint) return;
  
      const allSceneImages = storyboardImages.filter(img => img.sceneNumber === sceneNumber);
      if (allSceneImages.length === 0) return;
  
      const imagesToGenerate = forceRegenerate
        ? allSceneImages
        : allSceneImages.filter(img => img.status !== 'complete');
      
      if (imagesToGenerate.length === 0 && !forceRegenerate) {
          toast('Scene already generated. Use Regenerate or click a frame to regenerate individually.');
          return; 
      }
  
      const imageKeysToUpdate = new Set(imagesToGenerate.map(i => `${i.sceneNumber}-${i.frameNumber}`));
      setStoryboardImages(prev => prev.map(img => 
          imageKeysToUpdate.has(`${img.sceneNumber}-${img.frameNumber}`)
          ? { ...img, status: 'generating', errorMessage: undefined, imageData: forceRegenerate ? null : img.imageData } 
          : img
      ));
  
      const sceneData = parsedBlueprint.scenes.find(s => s.sceneNumber === sceneNumber);
      if (!sceneData) {
          setStoryboardImages(prev => prev.map(img => img.sceneNumber === sceneNumber ? {...img, status: 'error', errorMessage: 'Scene data not found.'} : img));
          return;
      }
      
      let previousFrameB64: string | null = null;
      // Find the last successfully generated frame in this scene BEFORE the first frame we are about to generate
      const firstFrameToGenerate = imagesToGenerate.sort((a,b) => a.frameNumber - b.frameNumber)[0];
      if (firstFrameToGenerate) {
          const lastGoodFrame = storyboardImages
            .filter(img => img.sceneNumber === sceneNumber && img.status === 'complete' && img.imageData && img.frameNumber < firstFrameToGenerate.frameNumber)
            .sort((a, b) => b.frameNumber - a.frameNumber)[0];
          if (lastGoodFrame) {
            previousFrameB64 = lastGoodFrame.imageData;
          }
      }

      for (const image of imagesToGenerate.sort((a,b) => a.frameNumber - b.frameNumber)) {
          try {
              const cinematicStyle = parsedBlueprint.globalContext.cinematicStyle;
              let prompt = `[SCENE ${sceneData.sceneNumber}, SHOT ${image.frameNumber}] Cinematic shot. ${sceneData.setting}. Time: ${sceneData.time}. Action: ${sceneData.action}. Camera: ${sceneData.camera}. Lighting: ${sceneData.lighting}. `;
              prompt += `Overall Cinematic Style guidance: Camera work should be '${cinematicStyle.cameraStyle}'. The lighting must be '${cinematicStyle.lightingStyle}'. The color palette is '${cinematicStyle.colorPalette}'.`;
              
              const charactersWithAssets: Character[] = [];
              let imaginedCharactersPrompt = '';

                const allCharactersInScene = (parsedBlueprint.globalContext.characters || [])
                    .filter(bpChar => 
                        sceneData.action.toUpperCase().includes(bpChar.name.toUpperCase()) || 
                        sceneData.dialogue.toUpperCase().includes(bpChar.name.toUpperCase())
                    );
                
                for (const bpChar of allCharactersInScene) {
                    if (bpChar.assignedCharacterId) {
                        const characterAsset = savedCharacters.find(sc => sc.id === bpChar.assignedCharacterId);
                        if (characterAsset) charactersWithAssets.push(characterAsset);
                    } else if (bpChar.isImagined) {
                        const charDesc = parsedBlueprint.globalContext.characterDescriptions?.find(d => d.name === bpChar.name);
                        if (charDesc) {
                            imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}, who is ${charDesc.description}.`;
                        } else {
                            imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}.`;
                        }
                    }
                }
              
              const finalPrompt = prompt + imaginedCharactersPrompt;
              
              const imageData = await handleApiCall(() => generateStoryboardImage(
                  finalPrompt, charactersWithAssets, previousFrameB64 ? [previousFrameB64] : null, parsedBlueprint.directives.aspectRatio
              ), `Generating S${sceneNumber}:${image.frameNumber}...`, 'Storyboard Generation');
              
              if (imageData) {
                  setStoryboardImages(prev => prev.map(img => 
                      (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                      ? { ...img, imageData, status: 'complete' } 
                      : img
                  ));
                  previousFrameB64 = imageData;
              } else {
                  throw new Error('API returned no image.');
              }
          } catch(err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              setStoryboardImages(prev => prev.map(img => 
                  (img.sceneNumber === image.sceneNumber && img.frameNumber === image.frameNumber) 
                  ? { ...img, status: 'error', errorMessage: message } 
                  : img
              ));
          }
      }
  }, [parsedBlueprint, storyboardImages, savedCharacters, handleApiCall]);
  
    const handleUpdateStoryboardImage = useCallback((sceneNumber: number, frameNumber: number, newImageData: string) => {
        setStoryboardImages(prev => prev.map(img => 
            (img.sceneNumber === sceneNumber && img.frameNumber === frameNumber) 
            ? { ...img, imageData: newImageData } 
            : img
        ));
    }, []);

    // --- Interactive Analysis Handlers ---
    const handleSelectColor = useCallback(async (colorName: string) => {
        if (!currentImage) return;
        await handleAISelect(`the color ${colorName}`);
        handleToolSelect('select');
    }, [currentImage, handleAISelect, handleToolSelect]);

    const handleSelectObject = useCallback(async (objectName: string) => {
        if (!currentImage) return;
        await handleAISelect(`the ${objectName}`);
        handleToolSelect('select');
    }, [currentImage, handleAISelect, handleToolSelect]);

    const handleRemoveObject = useCallback(async (objectName: string) => {
        if (!currentImage) return;
        const mask = await handleApiCall(() => getSelectionMaskFromPrompt(currentImage, `the ${objectName}`), `Masking ${objectName}...`, 'Object removal');
        if (mask) {
            const instruction = `This is an inpainting task. The user has provided an image and a mask. Realistically fill the area defined by the mask with content that logically and seamlessly matches the surrounding background. The goal is to make it appear as if the object within the mask was never there. Do not alter any part of the image outside the masked region.`;
            const editedImage = await handleApiCall(() => editImage(currentImage, instruction, { maskBase64: mask }), `Removing ${objectName}...`, 'Object removal');
            if (editedImage) {
                setMainImage(editedImage);
                setGeneratedImages([]);
                // Re-analyze the image to update the panel in place.
                const result = await handleApiCall(() => analyzeImage(editedImage), 'Re-analyzing image...', 'Image analysis');
                if (result) {
                    updateState('analysisResult', result);
                    const suggestions = await handleApiCall(() => getSuggestedAdjustments(editedImage, result), 'Generating new suggestions...', 'Suggestion generation');
                    if (suggestions) {
                        setSuggestedPresets(suggestions);
                    }
                } else {
                    updateState('analysisResult', null);
                    setSuggestedPresets([]);
                }
            }
        }
    }, [currentImage, handleApiCall, setMainImage, updateState]);

    const handleSaveObject = useCallback(async (objectName: string) => {
        if (!currentImage) { toast.error("Please upload an image first."); return; }
        const objectImageB64 = await handleApiCall(async () => {
            const mask = await getSelectionMaskFromPrompt(currentImage, `the ${objectName}`);
            if (!mask) throw new Error(`Could not create mask for ${objectName}`);
            return await applyMaskToImage(currentImage, mask, true);
        }, `Isolating ${objectName}...`, 'Object saving');

        if (objectImageB64) {
            const result = await handleApiCall(async () => {
                const descResult = await getIntentFromText(`describe this object: ${objectName}`, objectImageB64, 'strict');
                return { image: objectImageB64, description: descResult.parameters?.description || `A ${objectName}` };
            }, 'Analyzing object...', 'Object saving');
            if (!result) return;
            const compressedImage = await compressImageForStorage(result.image, 512, 1.0, 'png');
            const newObject: UserObject = { id: `obj-${Date.now()}`, name: objectName, description: result.description, referenceSheetImage: compressedImage, avatar: compressedImage };
            setUserObjects(prev => [...prev, newObject]);
            toast.success(`'${objectName}' saved to your objects!`);
        }
    }, [currentImage, handleApiCall, applyMaskToImage, setUserObjects]);

    const handleRestyleImage = useCallback(async (restylePrompt: string) => {
        if (!currentImage) return;
        updateState('analysisResult', null);
        setSuggestedPresets([]);
        const editedImageB64 = await handleApiCall(() => editImage(currentImage, restylePrompt, { maskBase64: null }), 'Restyling image...', 'Image restyle');
        if (editedImageB64) {
            setMainImage(editedImageB64);
            setGeneratedImages([]);
        }
    }, [currentImage, handleApiCall, setMainImage, updateState]);

    const handleSavePalette = (colors: ColorInfo[]) => {
        const paletteName = prompt("Enter a name for your new palette:", "My Custom Palette");
        if (paletteName && paletteName.trim() !== "") {
            const newPalette: CustomPalette = {
                id: `palette-${Date.now()}`,
                name: paletteName.trim(),
                colors: colors.map(c => c.hex),
            };
            setCustomPalettes(prev => [...prev, newPalette]);
            toast.success(`Palette "${paletteName.trim()}" saved!`);
        }
    };
    
    const handleScriptDirty = useCallback(() => {
        setParsedBlueprint(null);
        setUnresolvedAssets([]);
        setStoryboardImages([]);
        setGenerationStatus('idle');
    }, []);

    const renderBottomBar = () => {
        switch (appState.activeTool) {
            case 'select':
                return <SelectBottomBar 
                          isLoading={!!appState.loadingMessage}
                          editPrompt={editPrompt}
                          onEditPromptChange={setEditPrompt}
                          onApplyEdit={handleApplyEdit}
                          onAISelect={handleAISelect}
                          brushSize={brushSize}
                          onBrushSizeChange={setBrushSize}
                          retouchMode={retouchMode}
                          onRetouchModeChange={setRetouchMode}
                          selectionMode={selectionMode}
                          onSelectionModeChange={setSelectionMode}
                       />;
            case 'crop':
                 return <CropBottomBar 
                          isLoading={!!appState.loadingMessage}
                          onApplyCrop={handleApplyCrop}
                          onCancelCrop={handleCancelCrop}
                          aspectRatio={cropAspectRatio}
                          onAspectRatioChange={handleCropAspectRatioChange}
                        />;
            case 'director':
                return null;
            default:
                return <ConversationalCanvas
                          isLoading={!!appState.loadingMessage}
                          onCommandSubmit={handleCommandSubmit}
                          onVisualSubmit={handleVisualSubmit}
                          hasAnnotations={annotations.length > 0}
                          onUploadClick={handleUploadClick}
                          aiMode={aiMode}
                          onAiModeChange={setAiMode}
                      />;
        }
    };
    
    const handleSetSceneReference = (scene: SavedScene | null) => {
        setSceneReference(scene);
        if (scene) {
            setSelectedSceneImageForComposition(scene.referenceSheetImage);
        } else {
            setSelectedSceneImageForComposition(null);
        }
    };

    const handleZoomIn = () => {
        if (zoomLevel >= 10) return;
        setZoomLevel(prev => Math.min(prev * 1.2, 10));
    };
    const handleZoomOut = () => {
        if (zoomLevel <= 0.1) return;
        setZoomLevel(prev => Math.max(prev / 1.2, 0.1));
    };
    const handleZoomReset = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

  return (
    <div className="flex h-screen w-screen bg-brand-bg font-sans text-text-light overflow-hidden">
      <Toaster toastOptions={{
          className: '',
          style: {
              background: '#2a2a2a',
              color: '#E0E0E0',
              border: '1px solid #1e1e1e',
          },
      }} />
      {!isDirectorModalOpen && (
        <Toolbar 
            activeTool={appState.activeTool} 
            onSelectTool={handleToolSelect}
            onDownload={handleDownload}
            canDownload={!!currentImage}
        />
      )}

      {!isDirectorModalOpen ? (
        <main className="flex-1 flex flex-col relative">
            {currentImage && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 animate-fade-in">
                <EditingToolbar
                    onUndo={undo}
                    canUndo={canUndo}
                    onRedo={redo}
                    canRedo={canRedo}
                    onReset={handleReset}
                    onCompareToggle={setIsComparing}
                />
                <ToolsQuickAccessToolbar activeTool={appState.activeTool} onSelectTool={handleToolSelect} />
            </div>
            )}
            <div className="flex-grow relative">
            <div className="absolute inset-0 p-8">
                <Canvas
                    image={isComparing ? history[0] : currentImage}
                    selectionMask={selectionMask}
                    aspectRatio={canvasAspectRatio}
                    annotations={annotations}
                    onAddAnnotation={handleAddAnnotation}
                    onUpdateAnnotationText={handleUpdateAnnotationText}
                    onDeleteAnnotation={handleDeleteAnnotation}
                    onMaskChange={handleMaskChange}
                    isDrawingEnabled={appState.activeTool === 'select'}
                    brushSize={brushSize}
                    retouchMode={retouchMode}
                    isCroppingEnabled={appState.activeTool === 'crop'}
                    cropBox={cropBox}
                    onCropBoxChange={setCropBox}
                    cropAspectRatio={cropAspectRatio}
                    liveAdjustments={appState.activeTool === 'adjust' ? panelAdjustments : DEFAULT_ADJUSTMENTS}
                    zoomLevel={zoomLevel}
                    onZoomChange={setZoomLevel}
                    panOffset={panOffset}
                    onPanChange={setPanOffset}
                    selectionMode={selectionMode}
                />
                {currentImage && (
                    <ZoomControls 
                        zoomLevel={zoomLevel}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onZoomReset={handleZoomReset}
                    />
                )}
            </div>
            </div>
            
            {generatedImages.length > 1 && (
                <ThumbnailStrip images={generatedImages} selectedImage={currentImage} onSelectImage={setMainImage} />
            )}
            
            {renderBottomBar()}
        </main>
      ) : null}

      {!isDirectorModalOpen && (
        <RightPanel
            mainImage={currentImage}
            onStartOver={() => {
                reset(null);
                updateState('analysisResult', null);
                setSuggestedPresets([]);
            }}
            isApiOffline={isApiOffline}
            activeTool={appState.activeTool}
            generationPrompt={generationPrompt}
            onGenerationPromptChange={setGenerationPrompt}
            aspectRatio={aspectRatio}
            numberOfImages={numberOfImages}
            onNumberOfImagesChange={setNumberOfImages}
            onGenerate={handleGenerate}
            onUpload={handleUploadClick}
            setActiveModal={setActiveModal}
            generationTags={generationTags}
            onTagToggle={handleTagToggle}
            generationModel={generationModel}
            onGenerationModelChange={setGenerationModel}
            isAiPromptEnhancementEnabled={isAiPromptEnhancementEnabled}
            onAiPromptEnhancementChange={setIsAiPromptEnhancementEnabled}
            onRandomPrompt={handleRandomPrompt}
            imageReferences={imageReferences}
            onAddImageReferenceClick={handleAddImageReferenceClick}
            onRemoveImageReference={handleRemoveImageReference}
            styleReference={styleReference}
            onAddStyleReferenceClick={handleAddStyleReferenceClick}
            onRemoveStyleReference={handleRemoveStyleReference}
            sceneReference={sceneReference}
            onSetSceneReference={handleSetSceneReference}
            sceneCompositionMode={sceneCompositionMode}
            onSetSceneCompositionMode={setSceneCompositionMode}
            selectedSceneImageForComposition={selectedSceneImageForComposition}
            onSetSelectedSceneImageForComposition={setSelectedSceneImageForComposition}
            onRandomStyle={handleRandomStyle}
            adjustments={panelAdjustments}
            onAdjustmentsChange={setPanelAdjustments}
            onApplyAdjustments={handleApplyAdjustments}
            onResetAdjustments={handleResetAdjustments}
            onEnhanceImage={handleEnhanceImage}
            onRemoveBackground={handleRemoveBackground}
            onReplaceBackground={handleReplaceBackground}
            onColorBackground={handleColorBackground}
            analysisResult={appState.analysisResult}
            onAnalyzeImage={handleAnalyzeImage}
            onModifyColor={handleModifyColor}
            onModifyMood={handleModifyMood}
            activeCharacterContext={activeCharacterContext}
            onClearCharacterContext={handleClearCharacterContext}
            onSelectColor={handleSelectColor}
            onSelectObject={handleSelectObject}
            onRemoveObject={handleRemoveObject}
            onSaveObject={handleSaveObject}
            onRestyleImage={handleRestyleImage}
            onSavePalette={handleSavePalette}
            suggestedPresets={suggestedPresets}
            onApplySuggestedAdjustment={handleApplySuggestedAdjustment}
            onAddPalette={setCustomPalettes}
        />
      )}

      {appState.loadingMessage && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
          <LoaderIcon />
          <p className="mt-4 text-lg font-semibold text-text-light">{appState.loadingMessage}</p>
        </div>
      )}
      {appState.error && (
          <div className="absolute top-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
              <p className="font-bold">Error</p>
              <p>{appState.error}</p>
              <button onClick={() => updateState('error', null)} className="absolute top-2 right-2 text-white">&times;</button>
          </div>
      )}

      {activeModal === 'style' && <StyleModal onClose={() => setActiveModal(null)} onSelect={handleTagToggle} selectedTags={generationTags} customStyles={customStyles} onAddStyle={setCustomStyles} />}
      {activeModal === 'composition' && <CompositionModal onClose={() => setActiveModal(null)} onSelect={handleTagToggle} selectedTags={generationTags} />}
      {activeModal === 'effects' && <EffectsModal onClose={() => setActiveModal(null)} onSelect={handleTagToggle} selectedTags={generationTags} />}
      {activeModal === 'character' && <CharacterModal onClose={() => { setActiveModal(null); handleToolSelect('generate'); }} savedCharacters={savedCharacters} selectedCharacter={selectedCharacter} onSelectCharacter={handleSelectCharacterForGeneration} onSelectTag={handleTagToggle} onDeleteCharacter={handleDeleteCharacter} onCreateCharacter={handleCreateCharacter} characterPrompt={""} onCharacterPromptChange={() => {}} onGenerateWithCharacter={() => {}} isLoading={!!appState.loadingMessage} />}
      {activeModal === 'object' && <ObjectModal onClose={() => setActiveModal(null)} onSelectTag={handleTagToggle} selectedTags={generationTags} userObjects={userObjects} onCreateObject={handleCreateObject} isLoading={!!appState.loadingMessage} onSelect={() => {}} />}
      {activeModal === 'colors' && <ColorPaletteModal onClose={() => setActiveModal(null)} onSelect={handleTagToggle} selectedTags={generationTags} customPalettes={customPalettes} onAddPalette={setCustomPalettes} />}
      {activeModal === 'aspectRatio' && <AspectRatioModal onClose={() => setActiveModal(null)} onSelect={(ratio) => { setAspectRatio(ratio); setActiveModal(null); }} currentRatio={aspectRatio} />}
      {activeModal === 'scene' && <SceneModal onClose={() => { setActiveModal(null); handleToolSelect('generate'); }} savedScenes={savedScenes} onCreateScene={handleCreateScene} onDeleteScene={handleDeleteScene} isLoading={!!appState.loadingMessage} onSelectScene={(scene) => { handleSetSceneReference(scene); setActiveModal(null); }} onOpenInspector={handleOpenSceneInspector} />}
      
      {isDirectorModalOpen && (
          <DirectorModal
            onClose={() => setIsDirectorModalOpen(false)}
            blueprintText={blueprintText}
            onBlueprintTextChange={setBlueprintText}
            onParse={handleParseBlueprint}
            onGenerate={handleGenerateStoryboard}
            parsedBlueprint={parsedBlueprint}
            unresolvedAssets={unresolvedAssets}
            storyboardImages={storyboardImages}
            generationStatus={generationStatus}
            onResolveAsset={handleCreateOrResolveAsset}
            onImagineAsset={handleImagineAsset}
            onAddUnresolvedAsset={handleAddUnresolvedAsset}
            onRetryImage={handleRetryImage}
            onGenerateSingleScene={handleGenerateSingleScene}
            onUpdateGlobalContext={handleUpdateGlobalContext}
            savedCharacters={savedCharacters}
            userObjects={userObjects}
            savedScenes={savedScenes}
            onDeleteCharacter={handleDeleteCharacter}
            onCreateCharacter={handleCreateCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteObject={handleDeleteObject}
            onCreateObject={handleCreateObject}
            onUpdateObject={handleUpdateObject}
            onDeleteScene={handleDeleteScene}
            onCreateScene={handleCreateScene}
            onOpenSceneInspector={handleOpenSceneInspector}
            onScriptDirty={handleScriptDirty}
            onUpdateStoryboardImage={handleUpdateStoryboardImage}
          />
      )}

      {activeAssetModal.modalType && (
          <>
              {activeAssetModal.modalType === 'character' && 
                  <CharacterModal 
                      mode={activeAssetModal.initialData?.blueprintId ? "resolution" : "create"}
                      assetNameForResolution={activeAssetModal.initialData?.name}
                      onClose={() => setActiveAssetModal({ modalType: null })}
                      isLoading={!!appState.loadingMessage}
                      initialName={activeAssetModal.initialData?.name}
                      initialDescription={activeAssetModal.initialData?.description}
                      onCreateCharacter={async (imgs, name, desc) => {
                          const newChar = await handleCreateCharacter(imgs, name, desc);
                          if (activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(newChar);
                          } else {
                            setUnresolvedAssets(prev => prev.filter(a => !(a.name === name && a.type === 'Character')));
                          }
                          setActiveAssetModal({ modalType: null });
                          return newChar;
                      }}
                      onSelectCharacter={(char) => {
                        if (char && activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(char);
                        }
                        setActiveAssetModal({ modalType: null });
                      }}
                      savedCharacters={savedCharacters} selectedCharacter={null} onSelectTag={()=>{}} onDeleteCharacter={()=>{}} characterPrompt="" onCharacterPromptChange={()=>{}} onGenerateWithCharacter={()=>{}}
                  />
              }
              {activeAssetModal.modalType === 'object' && 
                  <ObjectModal 
                      mode={activeAssetModal.initialData?.blueprintId ? "resolution" : "create"}
                      assetNameForResolution={activeAssetModal.initialData?.name}
                      onClose={() => setActiveAssetModal({ modalType: null })}
                      isLoading={!!appState.loadingMessage}
                      initialName={activeAssetModal.initialData?.name}
                      initialDescription={activeAssetModal.initialData?.description}
                      onCreateObject={async (prompt, desc) => {
                          const newObj = await handleCreateObject(prompt, desc);
                          if (activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(newObj);
                          } else {
                            setUnresolvedAssets(prev => prev.filter(a => !(a.name === prompt && a.type === 'Object')));
                          }
                          setActiveAssetModal({ modalType: null });
                          return newObj;
                      }}
                      onSelect={(obj) => {
                        if (typeof obj !== 'string' && obj && activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(obj);
                        }
                        setActiveAssetModal({ modalType: null });
                      }}
                      selectedTags={new Set()} userObjects={userObjects} onSelectTag={() => {}}
                  />
              }
              {activeAssetModal.modalType === 'scene' && 
                  <SceneModal 
                      initialMode={activeAssetModal.initialData?.blueprintId ? "list" : "create"}
                      onClose={() => setActiveAssetModal({ modalType: null })}
                      isLoading={!!appState.loadingMessage}
                      initialName={activeAssetModal.initialData?.name}
                      initialDescription={activeAssetModal.initialData?.description}
                      onCreateScene={async (imgs, name, desc) => {
                          const newScene = await handleCreateScene(imgs, name, desc);
                          if (activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(newScene);
                          } else {
                            setUnresolvedAssets(prev => prev.filter(a => !(a.name === name && a.type === 'Scene')));
                          }
                          setActiveAssetModal({ modalType: null });
                          return newScene;
                      }}
                      onSelectScene={(scene) => {
                        if (scene && activeAssetModal.initialData?.blueprintId) {
                            handleAssetAssigned(scene);
                        }
                        setActiveAssetModal({ modalType: null });
                      }}
                      savedScenes={savedScenes} onDeleteScene={handleDeleteScene} onOpenInspector={()=>{}}
                  />
              }
          </>
      )}

      {inspectingScene && (
            <SceneInspectorModal
                onClose={() => setInspectingScene(null)}
                scene={inspectingScene}
                userObjects={userObjects}
                onUpdateScene={handleUpdateScene}
                onRegenerateAsset={handleRegenerateSceneAsset}
                onCastObject={handleCastObjectInScene}
            />
      )}

      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={imageReferenceInputRef} onChange={handleImageReferenceUpload} multiple accept="image/*" className="hidden" />
      <input type="file" ref={styleReferenceInputRef} onChange={handleStyleReferenceUpload} accept="image/*" className="hidden" />

    </div>
  );
};

export default App;
```

---

### `components/Canvas.tsx`

```javascript
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Annotation, Adjustments, SelectionMode, CropAspectRatio } from '../types';

interface CanvasProps {
  image: string | null;
  selectionMask: string | null;
  aspectRatio: string;
  annotations: Annotation[];
  onAddAnnotation: (x: number, y: number) => void;
  onUpdateAnnotationText: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onMaskChange: (maskDataUrl: string | null) => void;
  isDrawingEnabled: boolean;
  brushSize: number;
  retouchMode: 'replace' | 'erase';
  isCroppingEnabled: boolean;
  cropBox: { x: number; y: number; width: number; height: number; } | null;
  onCropBoxChange: (box: { x: number; y: number; width: number; height: number; } | null) => void;
  cropAspectRatio: CropAspectRatio;
  liveAdjustments: Adjustments;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  panOffset: { x: number, y: number };
  onPanChange: (pan: React.SetStateAction<{ x: number, y: number }>) => void;
  selectionMode: SelectionMode;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        if (!src || typeof src !== 'string' || !src.startsWith('data:image')) {
            return reject(new Error('Invalid image source.'));
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = src;
    });
};

const MASK_COLOR = 'rgba(138, 43, 226, 0.7)';
const HANDLE_SIZE = 10; // in pixels

const adjustmentsToCssFilter = (adjustments: Adjustments): string => {
    return `
      brightness(${adjustments.brightness}%) 
      contrast(${adjustments.contrast}%) 
      saturate(${adjustments.saturation}%)
      hue-rotate(${adjustments.hue}deg)
    `.trim();
};

// Fix: Pass an explicit `undefined` to `useRef`. The no-argument overload for `useRef` may not
// be available in older React type definitions, causing a "Expected 1 arguments, but got 0" error.
const usePrevious = <T,>(value: T) => {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

const PADDING_FACTOR = 0.95;


export const Canvas: React.FC<CanvasProps> = ({ 
    image, 
    selectionMask, 
    aspectRatio, 
    annotations, 
    onAddAnnotation, 
    onUpdateAnnotationText, 
    onDeleteAnnotation,
    onMaskChange,
    isDrawingEnabled,
    brushSize,
    retouchMode,
    isCroppingEnabled,
    cropBox,
    onCropBoxChange,
    cropAspectRatio,
    liveAdjustments,
    zoomLevel,
    onZoomChange,
    panOffset,
    onPanChange,
    selectionMode,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDrawing = useRef(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const lassoPoints = useRef<{x: number, y: number}[]>([]);

    const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({ display: 'none' });
    
    // State for cropping interaction
    const [cropCursor, setCropCursor] = useState('default');
    const [dragInfo, setDragInfo] = useState<{
        startMouseX: number;
        startMouseY: number;
        startBox: { x: number; y: number; width: number; height: number; };
        handle: string;
    } | null>(null);

    // State for panning
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const isPanning = useRef(false);
    const lastPanPos = useRef({ x: 0, y: 0 });
    const prevImage = usePrevious(image);


    // --- NEW: Refs and effects for annotation auto-focus ---
    const annotationInputsRef = useRef<Map<string, HTMLInputElement | null>>(new Map());
    const prevAnnotationsLength = usePrevious(annotations.length);

    useEffect(() => {
        // When a new annotation is added, focus its input field automatically.
        if (prevAnnotationsLength !== undefined && annotations.length > prevAnnotationsLength) {
            const newAnnotation = annotations[annotations.length - 1];
            if (newAnnotation) {
                const input = annotationInputsRef.current.get(newAnnotation.id);
                input?.focus();
            }
        }
    }, [annotations, prevAnnotationsLength]);


     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInputFocused =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable;

            if (e.code === 'Space' && !e.repeat && !isInputFocused) {
                e.preventDefault();
                setIsSpacePressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Effect for drawing the main image and resizing/centering canvases
    useEffect(() => {
        const canvas = canvasRef.current;
        const drawingCanvas = drawingCanvasRef.current;
        const container = containerRef.current;
        if (!canvas || !drawingCanvas || !container) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleImageChange = async () => {
            try {
                if (!image) {
                    const [widthRatio, heightRatio] = aspectRatio.split('/').map(s => parseFloat(s.trim()));
                    const w = 512;
                    const h = heightRatio ? (w / widthRatio) * heightRatio : 512;
                    setCanvasSize({ width: w, height: h });
                    canvas.width = w; canvas.height = h;
                    drawingCanvas.width = w; drawingCanvas.height = h;
                    ctx.clearRect(0, 0, w, h);
                    ctx.fillStyle = '#A0A0A0';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '16px sans-serif';
                    ctx.fillText('Canvas is ready. Generate or upload an image.', w / 2, h / 2);

                    const { width: cW, height: cH } = container.getBoundingClientRect();
                    const scale = Math.min(cW / w, cH / h, 1) * PADDING_FACTOR;
                    onZoomChange(scale);
                    onPanChange({ x: (cW - w * scale) / 2, y: (cH - h * scale) / 2 });
                    return;
                }

                const mainImage = await loadImage(image);
                const { naturalWidth, naturalHeight } = mainImage;

                setCanvasSize({ width: naturalWidth, height: naturalHeight });
                canvas.width = naturalWidth; canvas.height = naturalHeight;
                drawingCanvas.width = naturalWidth; drawingCanvas.height = naturalHeight;
                ctx.clearRect(0, 0, naturalWidth, naturalHeight);
                ctx.drawImage(mainImage, 0, 0, naturalWidth, naturalHeight);

                const { width: cW, height: cH } = container.getBoundingClientRect();
                if (cW === 0 || cH === 0) return; // Guard against unmeasured container
                
                const scaleX = cW / naturalWidth;
                const scaleY = cH / naturalHeight;
                const newZoom = Math.min(scaleX, scaleY, 1) * PADDING_FACTOR;
                onZoomChange(newZoom);
                onPanChange({ x: (cW - naturalWidth * newZoom) / 2, y: (cH - h * newZoom) / 2 });

            } catch (error) {
                 console.error("Canvas rendering failed:", error);
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 ctx.fillStyle = 'red';
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';
                 ctx.font = 'bold 16px sans-serif';
                 ctx.fillText('Error: Could not render image.', canvas.width / 2, canvas.height / 2);
            }
        };

        if (image !== prevImage) {
            handleImageChange();
        }
    }, [image, prevImage, aspectRatio, onPanChange, onZoomChange]);

    // Effect to sync the external selectionMask (white mask) to our drawable canvas (purple mask)
    useEffect(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas || !canvas.width || !canvas.height) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (selectionMask) {
            const maskImg = new Image();
            maskImg.onload = () => {
                // Draw the white mask image
                ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
                // Use globalCompositeOperation to 'colorize' the white mask with purple
                ctx.globalCompositeOperation = 'source-in';
                ctx.fillStyle = MASK_COLOR;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Reset composite operation for future drawing
                ctx.globalCompositeOperation = 'source-over';
            };
            maskImg.src = selectionMask;
        }
    }, [selectionMask, canvasSize]);

    const getCoords = (e: React.MouseEvent<HTMLDivElement>): { x: number; y: number } | null => {
        const container = containerRef.current;
        if (!container) return null;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const canvasX = (mouseX - panOffset.x) / zoomLevel;
        const canvasY = (mouseY - panOffset.y) / zoomLevel;
        
        return { x: canvasX, y: canvasY };
    };

    const handleDrawingMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawingEnabled || annotations.length > 0 || !(selectionMode === 'brush' || selectionMode === 'lasso')) return;
        isDrawing.current = true;
        
        const coords = getCoords(e);
        if (!coords) return;
        lastPos.current = coords;

        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        if (selectionMode === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.fillStyle = MASK_COLOR;
            ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (selectionMode === 'lasso') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            onMaskChange(null);
            lassoPoints.current = [coords];
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
        }
    };
    
    const draw = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing.current || !isDrawingEnabled || annotations.length > 0) return;
        
        const canvas = drawingCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const pos = getCoords(e);
        if (!ctx || !pos) return;
        
        if (selectionMode === 'brush' && lastPos.current) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.strokeStyle = MASK_COLOR;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        } else if (selectionMode === 'lasso') {
            lassoPoints.current.push(pos);
            ctx.lineTo(pos.x, pos.y);
            ctx.strokeStyle = MASK_COLOR;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        lastPos.current = pos;
    };
    
    const handleMouseUp = () => {
        if (isPanning.current) {
            isPanning.current = false;
        }

        if (isDrawing.current && isDrawingEnabled) {
            const canvas = drawingCanvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (selectionMode === 'lasso' && lassoPoints.current.length > 2 && ctx) {
                ctx.closePath();
                ctx.fillStyle = MASK_COLOR;
                ctx.fill();
            }

            isDrawing.current = false;
            lastPos.current = null;
            lassoPoints.current = [];
            
            if (canvas) {
                const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
                const isEmpty = !pixelBuffer.some(color => color !== 0);
                
                if (isEmpty) {
                    onMaskChange(null);
                } else {
                    const maskCanvas = document.createElement('canvas');
                    maskCanvas.width = canvas.width;
                    maskCanvas.height = canvas.height;
                    const maskCtx = maskCanvas.getContext('2d');
                    if (!maskCtx) {
                         onMaskChange(null);
                         return;
                    }
                    
                    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const maskData = maskCtx.createImageData(canvas.width, canvas.height);

                    for (let i = 0; i < originalData.data.length; i += 4) {
                        const alpha = originalData.data[i + 3];
                        if (alpha > 0) {
                            maskData.data[i] = 255;
                            maskData.data[i + 1] = 255;
                            maskData.data[i + 2] = 255;
                            maskData.data[i + 3] = alpha;
                        }
                    }
                    maskCtx.putImageData(maskData, 0, 0);
                    onMaskChange(maskCanvas.toDataURL('image/png'));
                }
            }
        }
    
        if (dragInfo) {
            handleCropMouseUp();
        }
    };


    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!image || isDrawingEnabled || isCroppingEnabled || isSpacePressed) return;
        
        const coords = getCoords(event);
        if (!coords) return;
        
        const relativeX = coords.x / canvasSize.width;
        const relativeY = coords.y / canvasSize.height;

        if (relativeX >= 0 && relativeX <= 1 && relativeY >= 0 && relativeY <= 1) {
            onAddAnnotation(relativeX, relativeY);
        }
    };

    const updateCursor = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container || !isDrawingEnabled || !image || selectionMode !== 'brush') {
            setCursorStyle({ display: 'none' });
            return;
        }

        const rect = container.getBoundingClientRect();
        const displayBrushSize = brushSize * zoomLevel;

        setCursorStyle({
            display: 'block',
            left: `${e.clientX - rect.left}px`,
            top: `${e.clientY - rect.top}px`,
            width: `${displayBrushSize}px`,
            height: `${displayBrushSize}px`,
            transform: 'translate(-50%, -50%)',
            borderColor: retouchMode === 'erase' ? '#EF4444' : 'white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 0 5px rgba(0,0,0,0.3)',
        });
    };
    
    const handleMouseLeave = () => {
        setCursorStyle({ display: 'none' });
        if (isDrawing.current) handleMouseUp();
        if (isPanning.current) isPanning.current = false;
        if (dragInfo) handleCropMouseUp();
    };

    // --- CROP LOGIC ---
    const getNumericRatio = (ratio: CropAspectRatio, imageWidth: number, imageHeight: number): number | null => {
        if (!imageWidth || !imageHeight) return null;
        if (ratio === 'free') return null;
        if (ratio === 'original') return imageWidth / imageHeight;
        const [w, h] = ratio.split(':').map(Number);
        return w / h;
    };
    
    const getHandleAt = (mousePos: { x: number; y: number }, box: { x: number; y: number; width: number; height: number; }, imgWidth: number, imgHeight: number) => {
        const handleThreshold = HANDLE_SIZE / zoomLevel;
        const corners = {
            tl: { x: box.x * imgWidth, y: box.y * imgHeight }, 
            tr: { x: (box.x + box.width) * imgWidth, y: box.y * imgHeight },
            bl: { x: box.x * imgWidth, y: (box.y + box.height) * imgHeight }, 
            br: { x: (box.x + box.width) * imgWidth, y: (box.y + box.height) * imgHeight }
        };
        for (const [key, pos] of Object.entries(corners)) {
            if (Math.abs(mousePos.x - pos.x) < handleThreshold && Math.abs(mousePos.y - pos.y) < handleThreshold) return key;
        }

        if (Math.abs(mousePos.x - box.x * imgWidth) < handleThreshold && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'l';
        if (Math.abs(mousePos.x - (box.x + box.width) * imgWidth) < handleThreshold && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'r';
        if (Math.abs(mousePos.y - box.y * imgHeight) < handleThreshold && mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth) return 't';
        if (Math.abs(mousePos.y - (box.y + box.height) * imgHeight) < handleThreshold && mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth) return 'b';
        if (mousePos.x > box.x * imgWidth && mousePos.x < (box.x + box.width) * imgWidth && mousePos.y > box.y * imgHeight && mousePos.y < (box.y + box.height) * imgHeight) return 'move';
        return null;
    };

    const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCroppingEnabled || !cropBox || !canvasRef.current) return;
        const coords = getCoords(e);
        if (!coords) return;
        const handle = getHandleAt(coords, cropBox, canvasSize.width, canvasSize.height);
        if (handle) {
            e.preventDefault();
            e.stopPropagation();
            setDragInfo({ startMouseX: coords.x, startMouseY: coords.y, startBox: { ...cropBox }, handle });
        }
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isCroppingEnabled || !cropBox || !canvasRef.current) return;
        const coords = getCoords(e);
        if (!coords) return;
        
        const numericRatio = getNumericRatio(cropAspectRatio, canvasSize.width, canvasSize.height);

        if (dragInfo) {
            const dx = (coords.x - dragInfo.startMouseX) / canvasSize.width;
            const dy = (coords.y - dragInfo.startMouseY) / canvasSize.height;
            let { x, y, width, height } = dragInfo.startBox;
            const minSize = 0.05;

            if (!numericRatio) { // Freeform
                switch (dragInfo.handle) {
                    case 'tl': x += dx; y += dy; width -= dx; height -= dy; break;
                    case 't': y += dy; height -= dy; break;
                    case 'tr': y += dy; width += dx; height -= dy; break;
                    case 'l': x += dx; width -= dx; break;
                    case 'r': width += dx; break;
                    case 'bl': x += dx; width -= dx; height += dy; break;
                    case 'b': height += dy; break;
                    case 'br': width += dx; height += dy; break;
                    case 'move': x += dx; y += dy; break;
                }
            } else { // Constrained aspect ratio
                const startRight = dragInfo.startBox.x + dragInfo.startBox.width;
                const startBottom = dragInfo.startBox.y + dragInfo.startBox.height;

                switch (dragInfo.handle) {
                    case 'br': {
                        let newWidth = startRight + dx - x;
                        let newHeight = startBottom + dy - y;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        width = newWidth; height = newHeight;
                        break;
                    }
                    case 'tl': {
                        let newWidth = width - dx;
                        let newHeight = height - dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        x = startRight - newWidth; y = startBottom - newHeight; width = newWidth; height = newHeight;
                        break;
                    }
                    case 'tr': {
                        let newWidth = width + dx;
                        let newHeight = height - dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        y = startBottom - newHeight; width = newWidth; height = newHeight;
                        break;
                    }
                     case 'bl': {
                        let newWidth = width - dx;
                        let newHeight = height + dy;
                        if (newWidth / newHeight > numericRatio) newHeight = newWidth / numericRatio; else newWidth = newHeight * numericRatio;
                        x = startRight - newWidth; width = newWidth; height = newHeight;
                        break;
                    }
                    case 'r': {
                        width += dx;
                        const newH = width / numericRatio;
                        y += (height - newH) / 2;
                        height = newH;
                        break;
                    }
                    case 'l': {
                        const newW = width - dx;
                        x += dx;
                        const newH = newW / numericRatio;
                        y += (height - newH) / 2;
                        width = newW;
                        height = newH;
                        break;
                    }
                    case 'b': {
                        height += dy;
                        const newW = height * numericRatio;
                        x += (width - newW) / 2;
                        width = newW;
                        break;
                    }
                    case 't': {
                        const newH = height - dy;
                        y += dy;
                        const newW = newH * numericRatio;
                        x += (width - newW) / 2;
                        width = newW;
                        height = newH;
                        break;
                    }
                    case 'move':
                        x += dx; y += dy;
                        break;
                }
            }

            // Clamp and update
            if (width < 0) { const oldX = x; x = oldX + width; width = -width; }
            if (height < 0) { const oldY = y; y = oldY + height; height = -height; }
            if (width < minSize) width = minSize;
            if (height < minSize) height = minSize;
            if (x < 0) { width += x; x = 0; }
            if (y < 0) { height += y; y = 0; }
            if (x + width > 1) width = 1 - x;
            if (y + height > 1) height = 1 - y;

            onCropBoxChange({ x, y, width, height });
        } else {
            const handle = getHandleAt(coords, cropBox, canvasSize.width, canvasSize.height);
            const cursors: { [key: string]: string } = { tl: 'nwse-resize', t: 'ns-resize', tr: 'nesw-resize', l: 'ew-resize', r: 'ew-resize', bl: 'nesw-resize', b: 'ns-resize', br: 'nwse-resize', move: 'move' };
            setCropCursor(handle ? cursors[handle] : 'default');
        }
    };

    const handleCropMouseUp = () => {
        setDragInfo(null);
    };

    // --- ZOOM & PAN ---
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (!image) return;
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const mousePointX = (mouseX - panOffset.x) / zoomLevel;
        const mousePointY = (mouseY - panOffset.y) / zoomLevel;

        const zoomFactor = 1.1;
        const newZoom = e.deltaY < 0 ? zoomLevel * zoomFactor : zoomLevel / zoomFactor;
        const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));

        if (clampedZoom === zoomLevel) {
            return;
        }

        const newPanX = mouseX - mousePointX * clampedZoom;
        const newPanY = mouseY - mousePointY * clampedZoom;
        
        onZoomChange(clampedZoom);
        onPanChange({ x: newPanX, y: newPanY });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isSpacePressed) {
            e.preventDefault();
            isPanning.current = true;
            lastPanPos.current = { x: e.clientX, y: e.clientY };
            return;
        }
        if (isDrawingEnabled) handleDrawingMouseDown(e);
        if (isCroppingEnabled) handleCropMouseDown(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isPanning.current) {
            const dx = e.clientX - lastPanPos.current.x;
            const dy = e.clientY - lastPanPos.current.y;
            lastPanPos.current = { x: e.clientX, y: e.clientY };
            onPanChange(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            return;
        }
        updateCursor(e);
        if (isDrawingEnabled) draw(e);
        if (isCroppingEnabled) handleCropMouseMove(e);
    };

    const imageExists = !!image;
    let effectiveCursor = 'default';
    if (isPanning.current) {
        effectiveCursor = 'grabbing';
    } else if (isSpacePressed) {
        effectiveCursor = 'grab';
    } else if (isDrawingEnabled && imageExists) {
        if (selectionMode === 'brush') {
            effectiveCursor = 'none';
        } else if (selectionMode === 'lasso') {
            effectiveCursor = 'crosshair';
        } else { // ai_select
            effectiveCursor = 'default';
        }
    } else if (isCroppingEnabled) {
        effectiveCursor = cropCursor;
    } else if (imageExists) {
        effectiveCursor = 'crosshair';
    }


    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden bg-black/20"
            style={{ cursor: effectiveCursor }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
        >
             <div
                className="absolute rounded-lg overflow-hidden"
                style={{
                    left: `${panOffset.x}px`,
                    top: `${panOffset.y}px`,
                    width: canvasSize.width,
                    height: canvasSize.height,
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'top left',
                    willChange: 'transform, top, left',
                }}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{
                        filter: adjustmentsToCssFilter(liveAdjustments),
                        imageRendering: zoomLevel > 2 ? 'pixelated' : 'auto',
                        display: 'block',
                    }}
                />
                <canvas
                    ref={drawingCanvasRef}
                    className="absolute top-0 left-0 opacity-70 pointer-events-none w-full h-full"
                />

                {isCroppingEnabled && cropBox && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-black/50" style={{
                            clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${cropBox.x * 100}% ${cropBox.y * 100}%, ${cropBox.x * 100}% ${(cropBox.y + cropBox.height) * 100}%, ${(cropBox.x + cropBox.width) * 100}% ${(cropBox.y + cropBox.height) * 100}%, ${(cropBox.x + cropBox.width) * 100}% ${cropBox.y * 100}%, ${cropBox.x * 100}% ${cropBox.y * 100}%)`
                        }}/>
                        <div className="absolute border-2 border-white pointer-events-auto" style={{
                            left: `${cropBox.x * 100}%`,
                            top: `${cropBox.y * 100}%`,
                            width: `${cropBox.width * 100}%`,
                            height: `${cropBox.height * 100}%`,
                        }}>
                             {/* Rule of thirds grid lines */}
                             <div className="absolute top-0 left-1/3 w-px h-full bg-white/50"></div>
                             <div className="absolute top-0 left-2/3 w-px h-full bg-white/50"></div>
                             <div className="absolute top-1/3 left-0 w-full h-px bg-white/50"></div>
                             <div className="absolute top-2/3 left-0 w-full h-px bg-white/50"></div>

                             {['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'].map(handle => {
                                let style: React.CSSProperties = {};
                                const offset = -HANDLE_SIZE / 2;
                                if (handle.includes('t')) style.top = offset;
                                if (handle.includes('b')) style.bottom = offset;
                                if (handle.includes('l')) style.left = offset;
                                if (handle.includes('r')) style.right = offset;
                                if (handle.length === 1 && (handle === 't' || handle === 'b')) { style.left = `calc(50% - ${HANDLE_SIZE / 2}px)`; }
                                if (handle.length === 1 && (handle === 'l' || handle === 'r')) { style.top = `calc(50% - ${HANDLE_SIZE / 2}px)`; }
                                return <div key={handle} className="absolute bg-white rounded-full" style={{ width: HANDLE_SIZE, height: HANDLE_SIZE, ...style }} />;
                            })}
                        </div>
                    </div>
                )}
                 {annotations.map(anno => (
                    <div key={anno.id} className="absolute" style={{ left: `${anno.x * 100}%`, top: `${anno.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="relative group">
                            <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg" />
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface p-2 rounded-lg w-48 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <input
                                    ref={el => { annotationInputsRef.current.set(anno.id, el); }}
                                    type="text"
                                    value={anno.text}
                                    onChange={(e) => onUpdateAnnotationText(anno.id, e.target.value)}
                                    placeholder="Add note..."
                                    className="w-full bg-surface-light text-text-light text-xs p-1 rounded focus:ring-primary focus:border-primary border-none"
                                />
                                <button onClick={() => onDeleteAnnotation(anno.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs">&times;</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <div
                className="absolute top-0 left-0 rounded-full border-2 bg-transparent pointer-events-none"
                style={{ ...cursorStyle }}
            />
        </div>
    );
};
```

---

### `components/ControlPanel.tsx`

```javascript
```

---

### `components/Toolbar.tsx`

```javascript
import React, { useState } from 'react';
import type { Tool } from '../types';

// --- Stitch Icons ---

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M247.93,124.52C246.11,77.54,207.07,40,160.06,40A88.1,88.1,0,0,0,81.29,88.67h0A87.48,87.48,0,0,0,72,127.73,8.18,8.18,0,0,1,64.57,136,8,8,0,0,1,56,128a103.66,103.66,0,0,1,5.34-32.92,4,4,0,0,0-4.75-5.18A64.09,64.09,0,0,0,8,152c0,35.19,29.75,64,65,64H160A88.09,88.09,0,0,0,247.93,124.52Zm-58.27,25.14a8,8,0,0,1-11.32,0L160,131.31V192a8,8,0,0,1-16,0V131.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,189.66,149.66Z"></path></svg>;
const GenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path></svg>;
const DirectorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,104H102.09L210,75.51a8,8,0,0,0,5.68-9.84l-8.16-30a15.93,15.93,0,0,0-19.42-11.13L35.81,64.74a15.75,15.75,0,0,0-9.7,7.4,15.51,15.51,0,0,0-1.55,12L32,111.56c0,.14,0,.29,0,.44v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V112A8,8,0,0,0,216,104ZM192.16,40l6,22.07-22.62,6L147.42,51.83Zm-66.69,17.6,28.12,16.24-36.94,9.75L88.53,67.37Zm-79.4,44.62-6-22.08,26.5-7L94.69,89.4ZM208,200H48V120H208v80Z"></path></svg>;
const CharacterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>;
const SceneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M164,80a28,28,0,1,0-28-28A28,28,0,0,0,164,80Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,40Zm90.88,155.92-54.56-92.08A15.87,15.87,0,0,0,186.55,96h0a15.85,15.85,0,0,0-13.76,7.84L146.63,148l-44.84-76.1a16,16,0,0,0-27.58,0L1.11,195.94A8,8,0,0,0,8,208H248a8,8,0,0,0,6.88-12.08ZM88,80l23.57,40H64.43ZM22,192l33-56h66l18.74,31.8,0,0,L154,192Zm150.57,0-16.66-28.28L186.55,112,234,192Z"></path></svg>;
const SelectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M152,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,40Zm-8,168H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM208,32H184a8,8,0,0,0,0,16h24V72a8,8,0,0,0,16,0V48A16,16,0,0,0,208,32Zm8,72a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,216,104Zm0,72a8,8,0,0,0-8,8v24H184a8,8,0,0,0,0,16h24a16,16,0,0,0,16-16V184A8,8,0,0,0,216,176ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM72,32H48A16,16,0,0,0,32,48V72a8,8,0,0,0,16,0V48H72a8,8,0,0,0,0-16Z"></path></svg>;
const CropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,48H160V16a8,8,0,0,0-16,0V48H56a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V64H96v96H64v40a8,8,0,0,0,8,8h40v32a8,8,0,0,0,16,0V208h88a8,8,0,0,0,8-8V160a8,8,0,0,0-16,0v32H112V56a8,8,0,0,0-8-8H160a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8V56A8,8,0,0,0,208,48Z"></path></svg>;
const EnhanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06l-51.61-19-19-51.65a15.92,15.92,0,0,0-29.88,0L78.07,110l-51.65,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0l19-51.61,51.65-19a15.92,15.92,0,0,0,0-29.88ZM140.39,163a15.87,15.87,0,0,0-9.43,9.43l-19,51.46L93,172.39A15.87,15.87,0,0,0,83.61,163h0L32.15,144l51.46-19A15.87,15.87,0,0,0,93,115.61l19-51.46,19,51.46a15.87,15.87,0,0,0,9.43,9.43l51.46,19ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>;
const RemoveBgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120ZM68.67,208A64.36,64.36,0,0,1,87.8,182.2a64,64,0,0,1,80.4,0A64.36,64.36,0,0,1,187.33,208ZM208,208h-3.67a79.9,79.9,0,0,0-46.68-50.29,48,48,0,1,0-59.3,0A79.9,79.9,0,0,0,51.67,208H48V48H208V208Z"></path></svg>;
const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>;
const AdjustIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z"></path></svg>;
const ExpandMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M64,128a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H72A8,8,0,0,1,64,128Zm8,56h96a8,8,0,0,0,0-16H72a8,8,0,0,0,0,16Zm133.66-90.34a8,8,0,0,0-11.32,0l-24,24a8,8,0,0,0,11.32,11.32l24-24A8,8,0,0,0,205.66,93.66ZM72,88a8,8,0,0,0,0-16H168a8,8,0,0,0,0,16Z"></path></svg>;
const CollapseMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16Z"></path></svg>;

// --- Components ---

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  canDownload: boolean;
  onDownload: () => void;
}

interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  isExpanded: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ label, icon, isActive, onClick, disabled = false, isExpanded }) => {
  const baseClasses = 'w-full flex items-center p-3 rounded-lg transition-colors duration-200';
  const activeClasses = 'bg-primary text-white';
  const inactiveClasses = 'text-text-light hover:bg-surface-light';
  const disabledClasses = 'text-gray-600 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isExpanded ? 'justify-start' : 'justify-center'} ${disabled ? disabledClasses : (isActive ? activeClasses : inactiveClasses)}`}
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{icon}</div>
      {isExpanded && <span className="ml-3 font-medium text-sm whitespace-nowrap">{label}</span>}
    </button>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool, canDownload, onDownload }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainTools = [
    { label: "Upload Image", icon: <UploadIcon />, tool: 'upload' as Tool, action: () => onSelectTool('upload') },
    { label: "Generate Image", icon: <GenerateIcon />, tool: 'generate' as Tool, action: () => onSelectTool('generate') },
    { label: "Director Tool", icon: <DirectorIcon />, tool: 'director' as Tool, action: () => onSelectTool('director') },
    { label: "Character Creator", icon: <CharacterIcon />, tool: 'character' as Tool, action: () => onSelectTool('character') },
    { label: "Scene Creator", icon: <SceneIcon />, tool: 'scene' as Tool, action: () => onSelectTool('scene') },
  ];
  
  const editingTools = [
    { label: "Select & Edit", icon: <SelectIcon />, tool: 'select' as Tool, action: () => onSelectTool('select') },
    { label: "Crop/Resize", icon: <CropIcon />, tool: 'crop' as Tool, action: () => onSelectTool('crop') },
    { label: "Enhance Image", icon: <EnhanceIcon />, tool: 'enhance' as Tool, action: () => onSelectTool('enhance') },
    { label: "Remove Background", icon: <RemoveBgIcon />, tool: 'remove-bg' as Tool, action: () => onSelectTool('remove-bg') },
    { label: "Analyze Image", icon: <AnalyzeIcon />, tool: 'analyze' as Tool, action: () => onSelectTool('analyze') },
    { label: "Adjust Colors", icon: <AdjustIcon />, tool: 'adjust' as Tool, action: () => onSelectTool('adjust') },
  ];
  
  const utilityTools = [
      { label: "Download Image", icon: <DownloadIcon />, tool: 'download' as Tool, action: onDownload, disabled: !canDownload },
  ];

  return (
    <nav className={`bg-surface flex flex-col items-center border-r border-surface-light z-20 transition-all duration-300 ease-in-out ${isExpanded ? 'w-56 p-3' : 'w-16 p-2'}`}>
        <div className={`p-2 text-primary font-bold text-lg mb-4 ${isExpanded ? 'self-start' : ''}`}>NB</div>
        
        <div className="flex flex-col space-y-1 w-full">
            {mainTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    isExpanded={isExpanded}
                />
            ))}
        </div>
        
        <hr className={`w-full border-t border-surface-light my-3`} />

        <div className="flex flex-col space-y-1 w-full">
            {editingTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    isExpanded={isExpanded}
                />
            ))}
        </div>
        
        <div className="mt-auto w-full pt-4 space-y-1">
            {utilityTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    disabled={item.disabled}
                    isExpanded={isExpanded}
                />
            ))}
             <ToolButton
                label={isExpanded ? "Collapse" : "Expand"}
                icon={isExpanded ? <CollapseMenuIcon /> : <ExpandMenuIcon />}
                isActive={false}
                onClick={() => setIsExpanded(!isExpanded)}
                isExpanded={isExpanded}
            />
        </div>
    </nav>
  );
};
```

---

### `constants.ts`

```javascript
import React from 'react';
// Fix: Import the new AspectRatio type for type safety.
import type { AspectRatio } from './types';

export const LoaderIcon: React.FC = () => (
    React.createElement('svg', { 
      className: "animate-spin h-12 w-12 text-primary",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24"
    },
      React.createElement('circle', {
        className: "opacity-25",
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        strokeWidth: "4"
      }),
      React.createElement('path', {
        className: "opacity-75",
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      })
    )
);

export const PROMPT_SUGGESTIONS = [
  "A majestic lion in the savannah",
  "A futuristic cityscape at night with flying cars",
  "An enchanted forest with glowing mushrooms and fairy lights",
  "A tranquil beach with crystal clear water and a lone palm tree",
  "A steampunk robot meticulously painting a tiny portrait",
  "A dragon flying over a medieval castle during a thunderstorm",
  "A cozy library in a hobbit-hole, filled with ancient books",
  "An astronaut playing a guitar on the surface of Mars",
  "A secret garden hidden behind a stone wall, overgrown with roses",
  "A bustling Moroccan market at dusk, with colorful lanterns",
  "A serene Japanese zen garden with a koi pond",
  "A giant, friendly octopus serving tea to fish underwater",
  "A whimsical hot air balloon festival in Cappadocia",
  "A photorealistic portrait of a wise old owl wearing glasses",
  "A delicious-looking stack of pancakes dripping with syrup and berries",
  "A magical potion shop with glowing bottles on dusty shelves",
  "An epic fantasy battle between elves and orcs",
  "A cute red panda sleeping on a cherry blossom tree branch",
  "A surreal desert landscape with melting clocks, Dali-style",
  "A cyberpunk alleyway with neon signs reflected in puddles",
  "A vintage car driving on a coastal road during sunset",
  "A house made of candy and gingerbread in a snowy landscape",
  "A detailed macro shot of a snowflake",
  "A group of animals having a picnic in the woods",
  "A mysterious, ancient ruin discovered deep in the Amazon rainforest",
  "A lone lighthouse on a rocky cliff during a storm",
];

// Fix: Use the centralized AspectRatio type for the constant.
export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const ADJUSTMENT_PRESETS = [
    { name: "Cinematic", prompt: "Apply a cinematic look with dramatic lighting and high contrast." },
    { name: "Vintage", prompt: "Give the image a vintage feel, with sepia tones and a faded look." },
    { name: "Vibrant", prompt: "Make the colors in the image more vibrant and saturated." },
    { name: "Cool", prompt: "Apply a cool color grade with a blueish tint for a calm mood." },
    { name: "Warm", prompt: "Apply a warm color grade with a yellowish tint for a cozy feeling." },
];

export const CONCEPTUAL_TAG_MAP: Record<string, string> = {
    '#ruleofthirds': 'composed using the rule of thirds',
    '#leadinglines': 'featuring strong leading lines',
    '#goldenratio': 'composed with the golden ratio',
    '#symmetry': 'with a symmetrical composition',
    '#closeup': 'a close-up shot',
    '#portrait': 'a portrait shot',
    '#mediumshot': 'a medium shot',
    '#wideshot': 'a wide shot',
    '#lowangle': 'shot from a low angle',
    '#highangle': 'shot from a high angle',
    '#aerialview': 'an aerial view',
    '#dutchangle': 'with a dutch angle',
    '#longexposure': 'using a long exposure effect',
    '#tiltshot': 'with a tilt-shift effect',
    '#backlight': 'with dramatic backlighting',
    '#goldenhour': 'during the golden hour',
    '#chiaroscuro': 'using chiaroscuro lighting',
};
```

---

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nano Banana Photo Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'brand-bg': '#121212',
              'surface': '#1e1e1e',
              'surface-light': '#2a2a2a',
              'primary': '#8A2BE2',
              'primary-hover': '#9932CC',
              'text-light': '#E0E0E0',
              'text-dark': '#A0A0A0',
            },
            keyframes: {
              fadeIn: {
                '0%': { opacity: '0', transform: 'translateY(-10px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
              }
            },
            animation: {
              'fade-in': 'fadeIn 0.5s ease-out forwards',
            }
          },
        },
      }
    </script>
  <script type="importmap">
{
  "imports": {
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.19.0",
    "react": "https://aistudiocdn.com/react@^19.1.1",
    "react/": "https://aistudiocdn.com/react@^19.1.1/",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
    "react-hot-toast": "https://aistudiocdn.com/react-hot-toast@^2.4.1"
  }
}
</script>
</head>
  <body class="bg-brand-bg text-text-light">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

### `index.tsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### `metadata.json`

```json
{
  "name": "Copy of Copyc copy of Nano Banana Photo Editorwith expend director script",
  "description": "A revolutionary photo editing application powered by Gemini. Generate images, perform content-aware AI modifications, and gain deep, interactive insights into your photos with an actionable analysis panel.",
  "requestFramePermissions": []
}
```

---

### `PROJECT_REVIEW.md`

```markdown
# Nano Banana Photo Editor: AI Project Dossier

This document provides a complete technical overview, architectural breakdown, and full source code for the Nano Banana Photo Editor. This dossier is intended to serve as a comprehensive guide for developers and AI assistants to understand the project's functionality, technical implementation, and codebase.

## 1. Project Overview & Core Philosophy

### Core Purpose
Nano Banana is an intelligent, web-based photo editor that merges a rich set of generative AI capabilities with an intuitive, conversational user interface. It leverages the Google Gemini API to understand natural language commands, enabling users to perform complex edits—from generating images from scratch to making precise, content-aware modifications—simply by describing their intent. It also features a powerful, interactive analysis panel that deconstructs images into editable components, turning AI insights into actionable editing tools.

A key design principle is providing users with clear, visual feedback and powerful asset management. This is exemplified by the 'Active Character' context system and the **Scene Inspector**, which allows for deep, granular control over generated environments. The application also features a robust, multi-step history system for non-destructive editing.

### Key Features & User Workflow

The application is a single-page application (SPA) built with React. The user interacts with the application through a three-part interface: a main canvas, a left-hand toolbar for high-level tool selection, and a right-hand panel for context-specific controls. A conversational input at the bottom of the canvas serves as the primary "AI co-pilot".

*   **Image Generation**:
    *   **Workflow**: The user selects the 'Generate' tool, enters a descriptive prompt in the right-hand `RightPanel`, selects various artistic tags (style, composition, effects), chooses an aspect ratio, and clicks "Generate". It supports multi-modal prompting using text, image references, style references, and full scene references.
    *   **Technology**: This calls the `generateImage` function in `geminiService.ts`, which uses the `imagen-4.0-generate-001` or `gemini-2.5-flash-image-preview` models to create images.

*   **Image Upload & Editing**:
    *   **Workflow**: The user can upload their own image using the 'Upload' tool. Once an image is on the canvas, a new top-mounted `EditingToolbar` appears, providing quick access to undo, redo, reset, and a "compare to original" feature. Edits can be made using specialized tools or the conversational input.
    *   **Technology**: Uses a standard file input to read the image as a base64 data URL. The state of the main image is managed by the `useHistoryState` custom hook, allowing for a multi-step undo/redo stack.

*   **Conversational AI Control**:
    *   **Workflow**: A central feature is the `ConversationalCanvas` component at the bottom of the screen. The user can type commands like "add a photorealistic cat sitting on the grass," "select the sky," or "make the image look more vintage."
    *   **Technology**: The `onCommandSubmit` handler in `App.tsx` calls `getIntentFromText` in `geminiService.ts`. This service sends the command and a flattened image (if present) to the `gemini-2.5-flash` model with a strict JSON schema. The model returns a structured `Intent` object (e.g., `{ action: 'add', target: 'grass', parameters: { description: 'a photorealistic cat' } }`). A `switch` statement in `App.tsx` then orchestrates the appropriate action based on the parsed intent.

*   **AI-Powered Selections & Inpainting/Outpainting**:
    *   **Workflow**: When a user command is parsed as a `select` intent (e.g., "select the car"), the application calls `getSelectionMaskFromPrompt`. Users can also draw selections manually. Once an area is selected, they can describe a change or ask to remove the content.
    *   **Technology**: AI selection uses `gemini-2.5-flash-image-preview` with a specialized prompt to generate a mask of the requested object. The `editImage` function sends the original image, a prompt, and an optional selection mask to the `gemini-2.5-flash-image-preview` model, which returns the modified image.

*   **Interactive Image Analysis**:
    *   **Workflow**: After an image is on the canvas, the user can select the 'Analyze' tool. The `AnalyzePanel` in the right-hand sidebar populates with a rich, AI-generated breakdown of the image, including dominant colors, identified objects, overall mood, composition, lighting, and artistic style.
    *   **Interactivity as a Core Principle**: This panel is not just a report; it's an interactive editing hub. Every piece of information is actionable:
        *   **Colors**: Users can click to select all instances of a specific color on the canvas or enter a prompt to change that color (e.g., change "sky blue" to "deep purple").
        *   **Objects**: Each identified object can be instantly selected, removed (with content-aware fill), or saved as a new, reusable `UserObject` in the user's library.
        *   **Global Attributes**: The mood, composition, lighting, and style sections are not just text descriptions but are editable fields. Modifying them and submitting triggers a global restyling of the image based on the new prompt.
    *   **Technology**: The initial analysis is powered by the `analyzeImage` function in `geminiService.ts`, which uses `gemini-2.5-flash` to parse the image into a structured JSON object. The interactive features leverage a combination of other services, including `getSelectionMaskFromPrompt` for selections, `editImage` for object removal and restyling, and `createAssetFromImages` for saving new objects.

*   **Persistent Asset Creation (Characters, Objects, Scenes)**: The app features a robust system for creating and managing reusable assets.
    *   **Creation**: Users can open dedicated modals to create Characters, Objects, or Scenes from reference images and text prompts.
    *   **AI Processing**: For complex assets like Scenes, the `createVirtualEnvironment` service in `geminiService.ts` performs a multi-step analysis to generate a rich set of materials: a technical sheet, detail shots, an aerial map, and more. This creates a comprehensive "virtual environment" from the user's input.
    *   **Scene Inspector**: After a scene is created, users can open the `SceneInspectorModal`. This dedicated interface allows them to view all AI-generated assets, manually edit the text-based technical sheet, regenerate specific assets (like the aerial map) with new prompts, and "cast" saved objects into the scene's asset list.
    *   **Technology**: Asset creation is handled by `createAssetFromImages` and `createVirtualEnvironment` in `geminiService.ts`. All created assets are persisted in the browser's Local Storage via dedicated service files (`characterService.ts`, `sceneService.ts`, etc.).

*   **Director Tool & Stateful Generation Engine**:
    *   **Workflow**: A powerful tool for generating multi-image storyboards from a natural language script or "blueprint." The tool parses the script to identify all required assets (characters, scenes). After the user resolves any missing assets using the "Casting Sheet" UI, they can generate the storyboard.
    *   **Technology**: The `parseBlueprint` service uses `gemini-2.5-flash` to convert the script into a structured `ParsedBlueprint` object. Storyboard generation is stateful to ensure visual consistency by chaining previously generated frames as visual references for subsequent frames.

## 2. Technical Architecture & Implementation

*   **Frontend Framework**: React (v19) with TypeScript, utilizing modern hooks for state management and side effects.
*   **AI Backend**: Google Gemini API, accessed via the `@google/genai` SDK.
*   **Styling**: Tailwind CSS, configured directly in the `index.html` for simplicity.
*   **State Management**:
    *   The primary application state is centralized within the main `App.tsx` component using the `useState` hook. The `AppState` interface in `types.ts` defines the core shape.
    *   **History Management**: The main image canvas state is managed by a custom hook, `useHistoryState`. This hook maintains an array of image data URIs and an index pointer, providing robust, multi-step undo, redo, reset, and "compare to original" functionality without polluting the main component's logic.
*   **Component Structure**:
    *   `App.tsx`: The root component, acting as the central controller. It manages all state, orchestrates AI service calls, and passes props down to child components. The main storyboard generation loops and all primary API handlers are located here.
    *   `/components`: Contains all UI components. `Toolbar`, `Canvas`, and `RightPanel` define the main layout. The `/components/modals` subdirectory contains the UI for the various pop-up dialogs, including the `DirectorModal` and `SceneInspectorModal`.
    *   `/hooks`: Contains custom React hooks, such as `useHistoryState.ts`.
    *   `/services`: Contains modules that abstract external interactions.
        *   `geminiService.ts`: The sole interface to the Google Gemini API. It has been expanded to include advanced scene creation functions like `createVirtualEnvironment`, `regenerateSceneAsset`, and `cleanImageOfUI`.
        *   Other services (`characterService`, `projectService`, etc.) handle local storage persistence.
*   **No Build Step**: The project uses an `importmap` in `index.html` to load React, `react-hot-toast`, and `@google/genai` directly from a CDN, eliminating the need for a package manager or build process.

## 3. Full Project Code

This section contains the full, unabridged source code for every file in the project.

---

### `App.tsx`

```javascript
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useHistoryState } from './hooks/useHistoryState';
import { Toolbar } from './components/Toolbar';
import { EditingToolbar } from './components/EditingToolbar';
import { Canvas } from './components/Canvas';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { ConversationalCanvas } from './components/ConversationalCanvas';
import { SelectBottomBar } from './components/bottombars/SelectBottomBar';
import { generateImage, generateObject, getIntentFromText, getSelectionMaskFromPrompt, editImage, getAIAdjustments, getSuggestedAdjustments, generateImageWithCharacter, analyzeImage, createAssetFromImages, editImageWithAnnotations, enhancePrompt, enhanceImage, parseBlueprint, generateStoryboardImage, createSceneAsset, analyzeSceneForPrompting, createVirtualEnvironment, regenerateSceneAsset, cleanImageOfUI } from './services/geminiService';
import { getCharacters, saveCharacters } from './services/characterService';
import { getObjects, saveObjects } from './services/objectService';
import { getCustomStyles, saveCustomStyles } from './services/styleService';
import { getCustomPalettes, saveCustomPalettes } from './services/paletteService';
import { getScenes, saveScenes } from './services/sceneService';
import { saveProject, loadProject } from './services/projectService';
// Fix: Import SelectionMode type for use in component state.
import type { Tool, Adjustments, AspectRatio, AppState, ImageAnalysis, Character, Annotation, ModalType, UserObject, CustomStyle, CustomPalette, ParsedBlueprint, StoryboardImage, SavedScene, DirectorProjectState, SelectionMode, CropAspectRatio, ColorInfo, AssetCreateSuggestionPayload, UnresolvedAsset } from './types';
import { LoaderIcon, ADJUSTMENT_PRESETS, PROMPT_SUGGESTIONS } from './constants';
import { ColorPaletteModal } from './components/modals/ColorPaletteModal';
import { StyleModal } from './components/modals/StyleModal';
import { EffectsModal } from './components/modals/EffectsModal';
import { CompositionModal } from './components/modals/CompositionModal';
import { CharacterModal } from './components/modals/CharacterModal';
import { ObjectModal } from './components/modals/ObjectModal';
import { AspectRatioModal } from './components/modals/AspectRatioModal';
import { DirectorModal } from './components/modals/DirectorModal';
import { RightPanel } from './components/RightPanel';
import { SceneModal } from './components/modals/SceneModal';
import { SceneInspectorModal } from './components/modals/SceneInspectorModal';
import { AdjustPanel } from './components/panels/AdjustPanel';
import { ZoomControls } from './components/ZoomControls';


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

// --- START: Stitch Icons for ToolsQuickAccessToolbar ---
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06l-51.61-19-19-51.65a15.92,15.92,0,0,0-29.88,0L78.07,110l-51.65,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0l19-51.61,51.65-19a15.92,15.92,0,0,0,0-29.88ZM140.39,163a15.87,15.87,0,0,0-9.43,9.43l-19,51.46L93,172.39A15.87,15.87,0,0,0,83.61,163h0L32.15,144l51.46-19A15.87,15.87,0,0,0,93,115.61l19-51.46,19,51.46a15.87,15.87,0,0,0,9.43,9.43l51.46,19ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>;
const BandaidsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M184.57,128l27.71-27.72a40,40,0,1,0-56.56-56.56L128,71.43,100.28,43.72a40,40,0,1,0-56.56,56.56L71.43,128,43.72,155.72a40,40,0,1,0,56.56,56.56L128,184.57l27.72,27.71a40,40,0,1,0,56.56-56.56ZM167,55A24,24,0,1,1,201,89l-27.72,27.72L139.31,82.75Zm-5.09,73L128,161.94,94.06,128,128,94.06ZM55,89h0A24,24,0,1,1,89,55l27.72,27.72L82.75,116.69ZM89,201A24,24,0,1,1,55,167l27.72-27.72,33.94,33.94Zm112,0A24,24,0,0,1,167,201l-27.72-27.72,33.94-33.94L201,167A24,24,0,0,1,201,201Zm-85-73a12,12,0,1,1,12,12A12,12,0,0,1,116,128Z"></path></svg>;
const CornersOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"></path></svg>;
const MoonStarsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M240,96a8,8,0,0,1-8,8H216v16a8,8,0,0,1-16,0V104H184a8,8,0,0,1,0-16h16V72a8,8,0,0,1,16,0V88h16A8,8,0,0,1,240,96ZM144,56h8v8a8,8,0,0,0,16,0V56h8a8,8,0,0,0,0-16h-8V32a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16Zm72.77,97a8,8,0,0,1,1.43,8A96,96,0,1,1,95.07,37.8a8,8,0,0,1,10.6,9.06A88.07,88.07,0,0,0,209.14,150.33,8,8,0,0,1,216.77,153Zm-19.39,14.88c-1.79.09-3.59.14-5.38.14A104.11,104.11,0,0,1,88,64c0-1.79,0-3.59.14-5.38A80,80,0,1,0,197.38,167.86Z"></path></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>;
const SlidersHorizontalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z"></path></svg>;
// --- END: Stitch Icons ---

const ToolsQuickAccessToolbar: React.FC<{ activeTool: Tool; onSelectTool: (tool: Tool) => void }> = ({ activeTool, onSelectTool }) => {
  const tools = [
    { name: 'Edit', icon: <SparkleIcon />, tool: 'auto-enhance' as Tool },
    { name: 'Retouch', icon: <BandaidsIcon />, tool: 'select' as Tool },
    { name: 'Resize', icon: <CornersOutIcon />, tool: 'crop' as Tool },
    { name: 'Restyle', icon: <MoonStarsIcon />, tool: 'restyle' as Tool },
    { name: 'Background', icon: <UserIcon />, tool: 'remove-bg' as Tool },
    { name: 'Upscale', icon: <CornersOutIcon />, tool: 'enhance' as Tool },
    { name: 'Adjust', icon: <SlidersHorizontalIcon />, tool: 'adjust' as Tool },
  ];

  return (
    <div className="bg-black/50 backdrop-blur-sm p-2 rounded-full flex items-center space-x-1">
      {tools.map(({ name, icon, tool }) => (
        <button
          key={name}
          title={name}
          onClick={() => onSelectTool(tool)}
          className={`p-2.5 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${activeTool === tool ? 'bg-primary' : 'hover:bg-white/10'}`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const CropBottomBar: React.FC<{
    isLoading: boolean;
    onApplyCrop: () => void;
    onCancelCrop: () => void;
    aspectRatio: CropAspectRatio;
    onAspectRatioChange: (ratio: CropAspectRatio) => void;
}> = ({ isLoading, onApplyCrop, onCancelCrop, aspectRatio, onAspectRatioChange }) => {
    const ratios: CropAspectRatio[] = ['original', 'free', '1:1', '16:9', '4:3'];
    return (
        <div className="absolute bottom-8 inset-x-0 flex justify-center z-20 px-4 animate-fade-in">
            <div className="bg-[#2B2B2B] border border-surface-light rounded-2xl p-2.5 flex items-center shadow-2xl space-x-4">
                <button onClick={onCancelCrop} className="px-4 py-2 text-sm rounded-lg transition-colors font-medium bg-surface-light text-text-light hover:bg-gray-600">Cancel</button>
                <div className="flex items-center space-x-2">
                    {ratios.map(ratio => (
                        <button 
                            key={ratio}
                            onClick={() => onAspectRatioChange(ratio)}
                            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-colors capitalize ${aspectRatio === ratio ? 'bg-primary text-white' : 'bg-surface-light text-text-dark hover:bg-gray-600'}`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
                <button onClick={onApplyCrop} disabled={isLoading} className="px-6 py-2 text-sm rounded-lg transition-colors font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 flex items-center">
                    {isLoading ? <LoaderIcon /> : 'Apply Crop'}
                </button>
            </div>
        </div>
    );
};


/**
 * Resizes and compresses a base64 image string for local storage.
 * @param base64Str The base64 image data URL.
 * @param maxDimension The maximum width or height of the resulting image.
 * @param quality A number between 0 and 1 indicating the image quality for JPEG.
 * @param format The output format, 'jpeg' for compression or 'png' to preserve transparency.
 * @returns A promise that resolves to the compressed base64 image string.
 */
const compressImageForStorage = async (base64Str: string, maxDimension: number = 512, quality: number = 0.8, format: 'jpeg' | 'png' = 'jpeg'): Promise<string> => {
    return new Promise((resolve) => {
        if (!base64Str || !base64Str.startsWith('data:image')) {
            return resolve(base64Str); // Return original if not a valid image data URL
        }
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let { naturalWidth: width, naturalHeight: height } = img;
            
            if (width <= maxDimension && height <= maxDimension) {
                // If it's small enough, just re-encode to apply JPEG compression, but don't resize.
            } else if (width > height) {
                height = Math.round(height * (maxDimension / width));
                width = maxDimension;
            } else {
                height = maxDimension;
                width = Math.round(width * (maxDimension / height));
