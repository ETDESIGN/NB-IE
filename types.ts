// Fix: Unify 'expand' and 'crop' into a single 'crop' tool.
export type Tool = 'generate' | 'select' | 'adjust' | 'upload' | 'download' | 'remove-bg' | 'character' | 'analyze' | 'crop' | 'enhance' | 'auto-enhance' | 'director' | 'restyle' | 'scene';

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3" | "3:2" | "1:2" | "2:1" | "4:5";

export type CropAspectRatio = 'original' | 'free' | '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type ModalType = 'style' | 'composition' | 'effects' | 'character' | 'object' | 'colors' | 'aspectRatio' | 'scene' | null;

// Fix: Add 'lasso' selection mode.
export type SelectionMode = 'brush' | 'lasso' | 'ai_select';

export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Adjustments {
  // Light
  exposure: number;     // Range, e.g., -100 to 100
  brightness: number;   // Percentage, 100 is default
  contrast: number;     // Percentage, 100 is default
  highlights: number;   // Range, e.g., -100 to 100
  shadows: number;      // Range, e.g., -100 to 100
  // Color
  saturation: number;   // Percentage, 100 is default
  temperature: number;  // Range, e.g., -100 to 100
  hue: number;          // Degrees, 0-360
  // Tint
  tintColor: string;    // Hex color
  tintBlendMode: 'screen' | 'multiply' | 'overlay' | 'color-dodge';
  tintOpacity: number;  // Percentage, 0-100
  // Grain
  grainAmount: number;  // Percentage, 0-100
  // Rotate
  straighten: number;   // Degrees, e.g., -45 to 45
  flip: 'none' | 'horizontal' | 'vertical';
}

export interface ColorInfo {
    hex: string;
    name: string;
}

export interface ImageAnalysis {
    dominantColors: ColorInfo[];
    objects: string[];
    mood: string;
    composition: string[];
    lighting: string;
    artisticStyle: string;
}

export interface AppState {
    mainImage: string | null;
    activeTool: Tool;
    loadingMessage: string | null;
    error: string | null;
    analysisResult: ImageAnalysis | null;
}

// A new type to define the structure of a saved character
export interface Character {
  id: string;
  name: string;
  description: string; // The AI-generated technical blueprint
  referenceSheetImage: string; // The AI-generated multi-panel reference sheet
  avatar: string; // Can be the reference sheet or a specific image
}

// UserObject now mirrors Character for a consistent creation/usage workflow
export interface UserObject {
    id: string;
    name: string;
    description: string;
    referenceSheetImage: string;
    avatar: string;
}

export interface CustomStyle {
    id: string;
    name: string;
    description: string;
}

export interface CustomPalette {
    id: string;
    name: string;
    colors: string[];
}

export interface SavedScene {
    id: string;
    name: string;
    // Core Data
    userImages: string[]; // The original images the user uploaded
    userDescription: string; // The original text description
    // AI-Generated Assets
    technicalSheet: string; // The detailed technical breakdown
    detailShots: string[]; // Close-ups of textures, props, etc.
    aerialMap: string; // The top-down map view
    inferredExteriors?: string[]; // Optional AI-imagined shots
    // Asset Management
    castObjectIds: string[]; // NEW: An array of IDs for saved UserObjects
    // The primary image for UI and simple background use
    referenceSheetImage: string; 
    avatar: string;
}


// Fix: Add Layer type definition for LayersPanel component.
export interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  opacity: number; // Percentage from 0 to 100
}

// Type for the parsed command from the AI Intent Parser
export interface Intent {
    action: 'select' | 'add' | 'remove' | 'change' | 'adjust' | 'generate' | string;
    target: 'subject' | 'background' | 'sky' | 'image' | 'selection' | string;
    parameters?: {
        description?: string;
        mood?: string;
    }
}

// A new type for visual annotations on the canvas
export interface Annotation {
    id: string;
    x: number; // 0 to 1, relative to image width
    y: number; // 0 to 1, relative to image height
    text: string;
}

// --- NEW TYPES FOR DIRECTOR TOOL ---

export interface CinematicStyle {
  cameraStyle: 'Static & Symmetrical' | 'Handheld & Gritty' | 'Sweeping & Epic';
  pacingStyle: 'Fast-paced, quick cuts' | 'Long, deliberate takes';
  lightingStyle: 'High-contrast noir' | 'Soft, natural light' | 'Vibrant & Saturated';
  colorPalette: string; // A text description, e.g., "Saturated blues and accent reds"
}

export interface ProjectCodex {
    id: string;
    title: string;
    principles: string[]; // e.g., "Theatricality Over Realism", "Tangible Futurism"
    cinematicStyle: CinematicStyle;
}

export interface PacingDataPoint {
    sceneNumber: number;
    tensionScore: number; // 1-10
    explanation: string;
}

export interface CharacterVoiceScore {
    characterName: string;
    consistencyScore: number; // 1-10
    analysis: string;
}

export interface ShowDontTellWarning {
    sceneNumber: number;
    lineNumber?: number; // Optional
    lineText: string;
    suggestion: string;
}

export interface ThematicResonance {
    theme: string;
    score: number; // 1-10
    analysis: string;
}

export interface AnalysisReport {
    pacingGraph: PacingDataPoint[];
    characterVoiceScores: CharacterVoiceScore[];
    showDontTellWarnings: ShowDontTellWarning[];
    thematicResonance: ThematicResonance[];
}


// Master object for a Director project
export interface BlueprintProject {
    id: string;
    title: string;
    logline: string;
    scriptContent: string; // The raw script text
    parsedScript: ParsedBlueprint | null;
    cast: {
        characters: string[]; // array of Character IDs
        objects: string[]; // array of UserObject IDs
        scenes: string[]; // array of SavedScene IDs
    };
    projectCodex: ProjectCodex;
    storyboard: StoryboardImage[];
}


export interface BlueprintCharacter {
    name: string; // This is now the ROLE in the story (e.g., "NINJA")
    id: string;   // This is the placeholder ID from the script
    assignedCharacterId?: string; // This will store the REAL ID of the saved Character cast in this role
    isImagined?: boolean;
}

export interface BlueprintObject {
    name: string; // e.g., "ANCIENT COMPASS"
    id: string;   // e.g., "#ancientcompass"
}

export interface BlueprintSavedScene {
    name: string;
    id: string;
}

export interface BlueprintCharacterDescription {
    name: string;
    description: string;
}

export interface BlueprintObjectDescription {
    name: string;
    description: string;
}

// REPLACE the old BlueprintScene with this new, more detailed version
export interface BlueprintScene {
    sceneNumber: number;
    sceneTitle: string;
    duration: string;
    setting: string;
    time: string;
    action: string;
    dialogue: string;
    camera: string;
    lighting: string;
    audio: string;
}

// REPLACE the old ParsedBlueprint to include the new global context fields
export interface ParsedBlueprint {
  metadata: {
    title: string;
    logline: string;
  };
  globalContext: {
    cinematicStyle: CinematicStyle;
    narrativeDevice: string; // NEW
    characters: BlueprintCharacter[];
    objects: BlueprintObject[];
    scenes: BlueprintSavedScene[];
    characterDescriptions?: BlueprintCharacterDescription[];
    objectDescriptions?: BlueprintObjectDescription[];
  };
  directives: {
    imageCountPerScene: number; // This might become obsolete but we keep it for now
    aspectRatio: AspectRatio;
    model: string;
  };
  // The scenes array now uses the new, more structured BlueprintScene
  scenes: BlueprintScene[];
}


export interface StoryboardImage {
    sceneNumber: number;
    frameNumber: number;
    imageData: string | null; // null while generating, base64 string when complete
    status: 'pending' | 'generating' | 'complete' | 'error';
    errorMessage?: string; // NEW: To store the specific error
}

export interface DirectorProjectState {
    blueprintText: string;
    parsedBlueprint: ParsedBlueprint | null;
    storyboardImages: StoryboardImage[];
}

export interface UnresolvedAsset {
  name: string;
  type: 'Character' | 'Object' | 'Scene';
  description?: string;
  blueprintId?: string; // Only present for assets found by the parser
}

export interface CopilotMessage {
  role: 'user' | 'model';
  content: string;
}

// --- NEW TYPES FOR ACTIONABLE AI AGENT ---

export type ActionType = 
  | 'SCRIPT_APPEND' 
  | 'SCRIPT_REPLACE' 
  | 'SCRIPT_INSERT_AT_CURSOR' 
  | 'ASSET_CREATE_SUGGESTION' 
  | 'UI_HIGHLIGHT';

export interface ScriptActionPayload {
  content: string;
}

export interface AssetCreateSuggestionPayload {
  assetName: string;
  assetType: 'Character' | 'Object' | 'Scene';
  description: string;
}

export interface UIHighlightPayload {
  textToHighlight: string;
}

export interface Action {
  type: ActionType;
  payload: ScriptActionPayload | AssetCreateSuggestionPayload | UIHighlightPayload;
}

// The response from the Gemini service
export interface CopilotAgentResponse {
  displayText: string;
  actions: Action[];
}