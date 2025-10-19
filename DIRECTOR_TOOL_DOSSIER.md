# Director Tool: Technical Dossier & Integration Guide

This document provides a complete technical overview for the Director Tool, a feature within the Nano Banana Photo Editor. It details its core purpose, architecture, user workflows, and its deep integration with the main application.

## 1. Overview & Core Philosophy

### Core Purpose
The Director Tool is an integrated, AI-powered pre-production environment. Its primary function is to transform a natural language script (a "blueprint") into a complete, visually-realized cinematic storyboard, ready for production.

### The "Living Blueprint" Philosophy
The tool operates on the principle of the "Living Blueprint." The script is not just static text but a dynamic context that evolves with every user command and AI action. This allows the AI Co-pilot to function as an "Insightful Co-Director," understanding the project's creative goals (style, tone, assets) to ensure all generated content is consistent and production-ready.

## 2. Key Features & User Workflow

### Scripting & Parsing
*   **Workflow**: A user writes or pastes a script into the editor. Clicking "Parse & Validate" triggers an AI analysis of the text.
*   **Technology**: The `DirectorModal.tsx` component handles the UI. Its `onParse` handler calls `parseBlueprint` in `geminiService.ts`, which uses the `gemini-2.5-flash` model with a strict JSON schema to convert the script into a structured `ParsedBlueprint` object. This object is stored in the main `App.tsx` state.

### Unified Asset Management
*   **Workflow**: After parsing, the tool identifies all required assets (Characters, Objects, Scenes). The AI Co-pilot can also suggest new assets during the writing process. All missing or suggested assets are added to a single, unified "Unresolved Assets" list in the "Assets" tab. The user must resolve these items before generation.
*   **"Resolve" vs. "Imagine for Me"**: For each unresolved asset, the user has two choices:
    1.  **Resolve**: Opens the appropriate creation modal (`CharacterModal`, etc.) to create a full visual asset.
    2.  **Imagine for Me**: (For characters) Skips visual asset creation. The AI will use the character's text description from the script to generate their appearance dynamically in the storyboard.
*   **Technology**: `handleParseBlueprint` (in `App.tsx`) and the Co-pilot's `ASSET_CREATE_SUGGESTION` action (in `DirectorModal.tsx`) both populate a single `unresolvedAssets` state array in `App.tsx`. The `AssetsPanel` in `DirectorModal.tsx` renders this list. Clicking "Imagine for Me" calls `handleImagineAsset` in `App.tsx`, which sets an `isImagined: true` flag on the corresponding `BlueprintCharacter` and removes it from the unresolved list.

### AI Co-pilot (The Actionable Agent)
*   **Workflow**: The user interacts with an AI assistant in a chat interface to write scenes, suggest dialogue, or identify new assets from the script.
*   **Technology**: The `CopilotPanel` (inside `DirectorModal.tsx`) manages the chat UI. Sending a message calls `getDirectorCopilotResponse` in `geminiService.ts`, which returns a JSON object containing `displayText` and an array of `actions`. An "Action Executor" logic in `DirectorModal` then programmatically modifies the script or adds to the `unresolvedAssets` list.

### Storyboard Generation (The Stage)
*   **Workflow**: Once all assets are resolved, the user can generate storyboards on a scene-by-scene basis or all at once. The generated frames appear in "The Stage" panel.
*   **Technology**: `handleGenerateStoryboard` and `handleGenerateSingleScene` in `App.tsx` orchestrate this process. They loop through scenes, calling `generateStoryboardImage`. This function is stateful: it passes the previously generated frame as a visual reference to the next call. Crucially, it now checks for `isImagined` characters and dynamically injects their text descriptions into the prompt, while using the visual reference sheets for resolved characters.

### Cinematic Style Control
*   **Workflow**: In the "Style" tab, the user defines the project's visual language (camera, lighting, color). A "Save & Apply Style" button confirms the changes.
*   **Technology**: The `StylePanel` in `DirectorModal.tsx` now uses local state for editing the `cinematicStyle` object. Clicking "Save" calls `onUpdateGlobalContext` (passed from `App.tsx`) to update the main `parsedBlueprint` state and provides user feedback via a toast notification.

### Script Analysis
*   **Workflow**: While the user writes, a background process analyzes the script for pacing, character consistency, and "show, don't tell" issues. The results are displayed in the "Analysis" tab.
*   **Technology**: A debounced `useEffect` hook in `DirectorModal.tsx` calls `analyzeScriptForInsights`. The `AnalysisPanel` container is now correctly configured with `overflow-y: auto` to ensure content is always accessible.

## 3. Technical Architecture & Integration Points

The Director Tool, while presented as a modal, is deeply integrated with the main application's state and services.

*   **Entry Point**: The `DirectorModal` is opened by setting `isDirectorModalOpen` to `true` in `App.tsx`.

*   **State Management**: Core Director Tool state (`blueprintText`, `parsedBlueprint`, `storyboardImages`, `unresolvedAssets`) is managed in the top-level `App.tsx` component. This allows for project persistence (via `projectService.ts`) and enables the tool to access and modify global state.

*   **Shared Modals**: The asset resolution workflow reuses the main application's modals (`CharacterModal`, `ObjectModal`, `SceneModal`). A unified modal state in `App.tsx` (`activeAssetModal`) manages which modal to show, even when triggered from within the Director Tool.

*   **Shared Asset Libraries**: The Director Tool reads from and writes to the same asset libraries as the main editor. `savedCharacters`, `userObjects`, and `savedScenes` are passed down as props from `App.tsx` and are managed by the same Local Storage services.

*   **Data Flow**: The tool follows a standard React unidirectional data flow. User actions within the modal call handler functions passed down from `App.tsx`. These handlers update the top-level state, which is then passed back down as props, causing the `DirectorModal` to re-render with the new information.