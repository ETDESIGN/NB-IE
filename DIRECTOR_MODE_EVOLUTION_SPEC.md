# [COMPLETE SPECIFICATION V2.0]
# Plugin: Director Mode - The Advanced Storytelling Engine

## 1. Core Philosophy: The "Insightful Co-Director"
The plugin's purpose is to act as an AI partner that understands the craft of storytelling. It will not just execute commands but will also provide expert-level analysis and feedback. This is achieved through the "Living Blueprint," a dynamic project context (`ProjectCodex`) that informs all AI actions and ensures consistency.

## 2. Architectural Overview
The plugin uses a multi-layered architecture featuring a dedicated **Analysis Engine** that works in the background to provide insights.

```mermaid
graph TD
    subgraph A [UI Layer]
        A1[Panel: Script Editor]
        A2[Panel: Interactive Stage (Scene-by-Scene)]
        A3[Panel: AI Co-pilot & Unified Asset Manager]
        A4[Tab: Script Analysis & Insights]
        A5[Tab: Cinematic Style]
    end
    subgraph B [Application Layer]
        B1[State Management (`ProjectCodex`)]
        B2[Service: Action Executor]
        B3[Service: Analysis Engine]
    end
    subgraph C [AI Service Layer]
        C1[Master Function: getDirectorCopilotResponse]
        C2[Service: Deep Script Analysis (`analyzeScriptForInsights`)]
        C3[Service: Controlled Cinematic Generation (`generateImageForShot`)]
    end
    A --> B --> C
    B3 --> C2
    C2 --> B3
    B3 --> A4


3. Core Implementation Mandates
3.1. Asset Management Unification & Enhancement (Top Priority)

    Problem: The current system has two conflicting asset sources ("Discovered" and "Unresolved"), creating duplicate assets and a broken, confusing workflow.

    Required Solution:

        Unify State: There must be only one state array for missing assets: unresolvedAssets. Both the Co-pilot's ASSET_CREATE_SUGGESTION actions and the script parser's findings will add items to this single array.

        Unify UI: The "Assets" tab must be refactored to display only the single unresolvedAssets list.

        Implement "Imagine for Me": Each unresolved asset in the UI must have two buttons: "Resolve" and "Imagine for Me".

            Resolve: Works as before, opening the main app's modal to create a formal visual asset.

            Imagine for Me: This button will not open a modal. It will find the corresponding asset in the parsedBlueprint object, set a new boolean flag isImagined: true, and remove the item from the unresolvedAssets UI list.

        Upgrade Storyboard Generation: The generateStoryboardImage function's logic must be upgraded. When composing the prompt for a shot, if a character has isImagined: true, the function must inject that character's textual description directly into the prompt instead of using a visual reference image. This unblocks the entire workflow.

3.2. UI Fixes & Functionality

    Problem: Key UI tabs are present but buggy or disconnected from the application's logic.

    Required Solution:

        Style Tab Functionality:

            Add a prominent "Save & Apply Style" button to the bottom of the "Style" tab.

            The onClick handler for this button must take the current values from the "Camera Style" and "Color Palette" inputs and save them to the main ProjectCodex state object.

            Provide a toast notification ("Cinematic Style updated!") for user feedback.

        Analysis Tab Scrolling:

            The parent container for the content within the "Analysis" tab must be fixed. It requires CSS properties (overflow-y: auto and a constrained height) to enable vertical scrolling for long reports.

3.3. Intelligence & Cinematic Control Implementation

    Problem: The AI's analysis and generation capabilities are still basic and do not reflect a professional understanding of cinematic language.

    Required Solution:

        Implement the Deep Script Analysis Engine:

            Create the new backend AI function: analyzeScriptForInsights.

            This function must return a structured AnalysisReport object containing pacingGraph data, characterVoiceScores, and showDontTellWarnings.

            The frontend Analysis Engine service will call this function in the background and use the data to populate the (now fixed) "Analysis" tab.

        Implement Professional Cinematic Generation:

            This task connects the "Style" tab to the final output.

            The main ProjectCodex must be updated to store a CinematicStyle object.

            The generateImageForShot function must be upgraded. Its internal prompt engineering logic will now be more sophisticated, combining the scene's text description with the camera, lighting, and color palette information from the saved CinematicStyle object to produce stylistically consistent images.

4. Key Data Models for Evolution

    CinematicStyle (in ProjectCodex): { cameraStyle: string, colorPalette: string, ... }

    AnalysisReport: { pacingGraph: {scene: number, tension: number}[], characterVoiceScores: object, showDontTellWarnings: object[] }

    Asset in parsedBlueprint: Must now support an optional isImagined: boolean flag.