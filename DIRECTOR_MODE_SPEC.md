 [COMPLETE SPECIFICATION]
# Plugin: Director Mode - The Advanced Storytelling Engine

## 1. Core Philosophy: The "Insightful Co-Director"
The plugin's purpose is to act as an AI partner that understands the craft of storytelling. It will not just execute commands but will also provide expert-level analysis and feedback. This is achieved through the "Living Blueprint," a dynamic project context that informs all AI actions and ensures consistency.

## 2. System Architecture
The plugin uses a multi-layered architecture featuring a dedicated **Analysis Engine** that works in the background to provide insights.

```mermaid
graph TD
    subgraph A [UI Layer]
        A1[Script Editor w/ Annotations]
        A2[Interactive Stage (Scene-by-Scene)]
        A3[AI Co-pilot & Asset Manager]
        A4[Script Analysis & Insights Tab]
    end
    subgraph B [Application Layer]
        B1[State Management]
        B2[Action Executor]
        B3[Professional Blueprint Export]
        B4[Analysis Engine]
    end
    subgraph C [AI Service Layer]
        C1[Master Function: getDirectorCopilotResponse]
        C2[Service: Deep Script Analysis]
        C3[Service: Controlled Cinematic Generation]
    end
    A --> B --> C
    B4 --> C2
    C2 --> B4
    B4 --> A4

  

3. Total List of Required Functions & Features
3.1. The Actionable AI Agent

    Status: Needs to be implemented in DirectorModal.

    Description: The Co-pilot chat must be integrated into the Director Tool. The getDirectorCopilotResponse function must be refactored to return a { displayText: string, actions: Action[] } JSON object. The frontend Action Executor will automatically perform actions like SCRIPT_APPEND and ASSET_CREATE_SUGGESTION.

3.2. Complete Asset Management Workflow

    Status: Buggy and Incomplete.

    Description:

        Button Fix: The "Create" and "Resolve" buttons must be fixed. They must trigger the main application's modals (CharacterModal, ObjectModal) and pre-fill them with the asset's name and description. State management for modals must be lifted to App.tsx. A CSS z-index fix is required to make the modals appear on top of the DirectorModal overlay.

        Add from Library: Each asset category (Characters, Objects) needs a "+" button. This will open a "Library Browser" modal, allowing the user to add existing assets from their main library to the current script's "Living Blueprint" (Project Context).

3.3. The Interactive Stage (Scene-by-Scene Control)

    Status: Not Implemented.

    Description: The central panel of the DirectorModal must be rebuilt. It will parse the script and display a list of all scenes. Each scene will have its own "Generate Storyboard" button. Clicking this button will generate images only for that scene, allowing for granular, cost-effective pre-visualization.

3.4. The Deep Script Analysis Engine

    Status: Not Implemented.

    Description: A new background service, the Analysis Engine, will call a new AI function, analyzeScriptForInsights. This function will return a structured report containing:

        pacingGraph: Data to visualize the story's tension.

        characterVoiceScores: Consistency scores for dialogue.

        showDontTellWarnings: Suggestions to turn exposition into visual action.

        This data will be displayed in a new "Analysis" tab in the DirectorModal.

3.5. Professional Cinematic Generation

    Status: Not Implemented.

    Description:

        Cinematic Style: The user can define a CinematicStyle object (camera style, lighting, color palette) in the project settings.

        Upgraded Functions: The generateCinematography and generateImageForShot functions must be upgraded to use this CinematicStyle object. This ensures all generated shots and storyboards are consistent with the Director's chosen visual language.