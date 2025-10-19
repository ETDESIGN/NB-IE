This Markdown file is designed to be the single source of truth for any AI or human developer tasked with understanding, maintaining, or extending this feature. It synthesizes all our previous discussions, including the core philosophy, the final architecture, a complete list of functions with their interactions, and the required user workflows.
[COMPLETE SPECIFICATION]
Plugin: Director Mode - The Actionable AI Agent
1. High-Level Vision & Core Philosophy
1.1. Plugin Purpose

Director Mode is a comprehensive, AI-powered creative environment integrated within the main application. Its purpose is to guide a user (The "Director") through the entire pre-production process, from a single idea to a complete, production-ready cinematic blueprint.
1.2. The Core Philosophy: The "Living Blueprint"

The entire plugin is built on the concept of the "Living Blueprint" or "Project Context." This is a dynamic, in-memory data object that represents the project's creative soul.

    It is not a static file: It is an active context that evolves with every user command and AI action.

    It is the Single Source of Truth: All AI functions, from script generation to image creation, must reference this object to ensure absolute narrative, stylistic, and visual consistency.

    It enables an Agentic AI: This context allows the Co-pilot to be more than a chatbot. It becomes an Actionable Agent that understands the project's goals and can take direct, automated actions to help achieve them.

2. System Architecture

The plugin operates on a multi-layered architecture designed for modularity and scalability.
code Mermaid

    
graph TD
    subgraph A [User Interface Layer (DirectorWorkspace.tsx)]
        A1[Panel: Script Editor & Story Map]
        A2[Panel: The Stage (Scene-by-Scene Storyboard)]
        A3[Panel: AI Co-pilot & Asset Manager]
    end

    subgraph B [Application Layer (The Conductor)]
        B1[Service: State Management (React State/Zustand)]
        B2[Service: Action Executor]
        B3[Service: Blueprint Export System]
    end
    
    subgraph C [AI Service Layer (geminiService.ts)]
        C1[Master Function: getDirectorCopilotResponse]
        C2[Sub-Logic: Narrative Generation]
        C3[Sub-Logic: Technical Generation (Camera/Sound)]
        C4[Sub-Logic: Asset Parsing & Image Generation]
    end

    subgraph D [Data Layer]
        D1[Database: Project & Script Data]
        D2[Database: User Assets (Characters, Objects)]
        D3[Types: Data Models (types.ts)]
    end

    A -- "User Input" --> B
    B -- "Calls AI w/ Context" --> C
    C -- "Returns Action JSON" --> B
    B -- "Executes Actions & Updates State" --> A
    A -- "Renders Updated State" --> A
    C -- "Reads/Writes" --> D

  

3. UI/UX Component Breakdown (DirectorWorkspace.tsx)

The user interacts with the plugin through a three-panel workspace.
3.1. Left Panel: The Script Editor

    Description: A professional, distraction-free writing environment.

    Features:

        Rich Text Editor: Supports industry-standard screenplay formatting (Scene Headings, Character, Dialogue).

        Future Expansion (Story Map View): A planned feature to visualize the script's structure as draggable scene cards.

    Interaction: The content of this editor is the primary input for the AI's contextual understanding. The AI Agent can directly append, replace, or insert text here via the Action Executor.

3.2. Center Panel: The Stage

    Description: The primary visual workspace, designed for cost-effective and controlled storyboard generation.

    Features:

        Scene List: The panel automatically parses the script from the Left Panel and displays a list of all scenes (e.g., "1. INT. BIO-LUMINESCENT CAVERN - NIGHT").

        On-Demand Generation: Each scene in the list has a "Generate Storyboard" button. This allows the user to generate visuals incrementally, one scene at a time.

        Storyboard Display: Once generated, the storyboard images for a scene are displayed in a grid directly under the scene heading.

    Interaction: Clicking "Generate Storyboard" triggers a call to the AI service, passing only that specific scene's content, saving processing credits and time.

3.3. Right Panel: AI Co-pilot & Asset Manager

    Description: The command center for interacting with the AI Agent and managing the project's creative assets.

    Features:

        Co-pilot Tab: The conversational chat interface. This is where the user gives commands to the AI.

        Assets Tab:

            My Assets: A gallery of all user-created and saved characters, objects, etc.

            Discovered: An auto-populated list of potential assets the AI has identified from the script (e.g., a new character name). Each item has a "Create" button.

    Interaction: This is the primary control panel. User prompts trigger the AI Agent, and the "Create" button on discovered assets initiates the asset creation workflow.

4. Total List of AI Functions (geminiService.ts)

This section details every critical AI function, its purpose, and its interaction with the application.
getDirectorCopilotResponse (The Master Function)

    Signature: getDirectorCopilotResponse(prompt: string, scriptContext: string, projectCodex: ProjectCodex): Promise<AgentResponse>

    Description: This is the single entry point for all conversational interactions. It acts as an orchestrator, interpreting the user's prompt and deciding which sub-logic to invoke. It is designed to be a proactive, goal-oriented agent.

    Parameters:

        prompt: The user's latest message from the chat.

        scriptContext: The entire current script text.

        projectCodex: The "Living Blueprint" object containing the project's tone, style, and established assets.

    Return Value: A promise that resolves to an AgentResponse object: { displayText: string, actions: Action[] }.

    Interaction with App:

        Called by: The "Send" button in the Co-pilot chat.

        Impact: The returned displayText is rendered in the chat. The actions array is passed to the Action Executor service in the Application Layer, which then modifies the application state (e.g., updates the script, adds a discovered asset). This is the core loop of the agentic system.

Internal Logic & Sub-Functions (Orchestrated by getDirectorCopilotResponse)
generateStoryOutline & fleshOutScene (Narrative Generation)

    Description: These are no longer standalone functions but are now internal logic modules used by getDirectorCopilotResponse. When a prompt like "Start a story about a ninja cat" is received, the master function uses this logic to create the initial scenes and plot points.

    Interaction with App: This logic produces SCRIPT_APPEND actions. For example, it will generate the text for Scene 1 and package it into an action: { type: 'SCRIPT_APPEND', payload: { content: '...' } }.

rewriteScene (The "Script Doctor")

    Description: An internal logic module for handling complex rewrite commands (e.g., "make this scene more tense").

    Interaction with App: It produces a SCRIPT_REPLACE action, containing the rewritten scene text, which the Action Executor uses to update the script editor.

extractAssetsFromScript

    Description: This function is called frequently to parse the script text and identify all named characters, unique props, and scene headings.

    Interaction with App:

        Its output is used to populate the Scene List in "The Stage" panel.

        It is also used by the master function to identify new potential assets, which are then turned into ASSET_CREATE_SUGGESTION actions.

generateCinematography & generateSoundDesign

    Description: These are specialized internal modules used during the final blueprint export phase. They read a scene's content and generate professional-grade technical details.

    Interaction with App: They don't directly affect the main UI in real-time. Their output (shot lists, sound cues) is stored and later used by the Blueprint Export System to populate the columns of the final PDF document.

generateImageForShot

    Description: The core image generation function. It takes a single scene's description and the full ProjectCodex to produce a series of consistent storyboard images.

    Interaction with App:

        Called by: The "Generate Storyboard" button next to a scene in "The Stage" panel.

        Impact: The returned image URLs are added to a state variable, which causes the UI to render the storyboard grid for that specific scene. This granular, scene-by-scene call is a key feature.

5. Key Data Models & Types (types.ts)

    ProjectCodex: The "Living Blueprint." An object containing:

        title: string

        style: string (e.g., "Belgium comics style")

        principles: string[]

        assets: { characters: Asset[], objects: Asset[] }

    Action: The command object returned by the AI.

        type: 'SCRIPT_APPEND' | 'SCRIPT_REPLACE' | 'ASSET_CREATE_SUGGESTION' | ...

        payload: any (e.g., for SCRIPT_APPEND, the payload is { content: string })

    Asset: A user-approved creative element.

        id: string

        name: string

        type: 'Character' | 'Object' | ...

        description: string

        imageUrl?: string

    AssetSuggestion: A potential asset identified by the AI.

        assetName: string

        assetType: 'Character' | 'Object'

        description: string

6. User Workflows
Workflow 1: Starting a New Story (Agentic)

    User: Types "Help me start a 1-minute cartoon about a ninja cat in a Belgium comics style" into the Co-pilot.

    System: The getDirectorCopilotResponse function is called. It uses its narrative logic.

    AI Responds with Actions: The AI returns a JSON object.

    UI Executes:

        The displayText ("Fantastic! I've started the story...") appears in the chat.

        The SCRIPT_APPEND action fires, and the first scene's text automatically appears in the Script Editor.

        The ASSET_CREATE_SUGGESTION action fires, and "Mochi (Character)" automatically appears in the "Discovered" assets list with a "Create" button.

Workflow 2: Creating a Discovered Asset

    User: Clicks the "Create" button next to the "Mochi" suggestion.

    System: The handleCreateDiscoveredAsset function is triggered.

    UI Executes:

        The Character creation modal opens.

        The form is pre-filled with the name "Mochi" and his description.

        The user saves the character.

        The suggestion is removed from the "Discovered" list and "Mochi" now appears in "My Assets."

Workflow 3: Generating a Storyboard (Granular Control)

    User: Looks at "The Stage" panel, which shows a list of scenes from the script.

    User: Clicks the "Generate Storyboard" button next to "SCENE 2: INT. SENSEI YUMI'S DOJO - DAY".

    System: The handleGenerateSceneStoryboard function is called, passing only the text content of Scene 2 to the generateImageForShot service.

    UI Executes: A loading indicator appears. When complete, a grid of storyboard images for Scene 2 is displayed under its heading. The user can continue to write or generate storyboards for other scenes at their own pace.

Model
Thinking Thoughts (experimental)
Auto

Expand to view model thoughts
chevron_right

You are absolutely right. My apologies. The previous specification was the essential architectural foundation—the chassis and the engine. You are correct to push for the next step, as we discussed earlier. A professional tool is not just about executing commands; it's about providing insight, offering granular control, and deeply understanding the craft of storytelling.

Let's expand this a step further. We will now architect the advanced, complex features that elevate this plugin from a functional assistant to a true professional creative partner. This is where we add the onboard computer, the professional-grade controls, and the polished finish.
[PROFESSIONAL EVOLUTION SPECIFICATION]
Plugin: Director Mode - The Advanced Storytelling Engine
1. The Philosophical Shift: From Assistant to Partner

The previous architecture enabled an "Actionable Agent." The new architecture enables an "Insightful Co-Director." This AI will not just follow orders; it will analyze the script, understand cinematic language, and offer expert-level feedback.
2. Revised Architecture: Introducing the Analysis Engine

The core architecture is sound, but we will add a crucial new component: the Analysis Engine. This is a non-real-time service that continuously reads the script and provides deep insights.
code Mermaid

    
graph TD
    subgraph A [User Interface Layer]
        A1[Panel: Script Editor w/ Annotations]
        A2[Panel: The Interactive Stage]
        A3[Panel: AI Co-pilot & Asset Manager]
        A4[Tab: Script Analysis & Insights]
    end

    subgraph B [Application Layer]
        B1[Service: State Management]
        B2[Service: Action Executor]
        B3[Service: Blueprint Export System (PRO)]
        B4[Service: Analysis Engine]
    end
    
    subgraph C [AI Service Layer (geminiService.ts)]
        C1[Master Function: getDirectorCopilotResponse]
        C2[Service: Deep Script Analysis]
        C3[Service: Controlled Cinematic Generation]
        C4[Service: Asset Parsing & Image Generation]
    end

    subgraph D [Data Layer]
        D1[Database: Project & Script Data]
        D2[Database: User Assets]
        D3[Types: Data Models (PRO)]
    end

    A -- "User Input" --> B
    B -- "Calls AI w/ Context" --> C
    C -- "Returns Action JSON" --> B
    B -- "Executes Actions & Updates State" --> A
    A -- "Renders Updated State" --> A
    
    %% The New Loop %%
    B1 -- "Script Changes" --> B4
    B4 -- "Sends Script for Analysis" --> C2
    C2 -- "Returns Analysis Data" --> B4
    B4 -- "Updates State with Insights" --> A4

  

3. Function Evolution: From Basic to Professional

Here we detail the expansion of each key function to achieve professional-grade complexity.
getDirectorCopilotResponse (The Master Function)

    Current State: Responds to direct commands and generates actions.

    Professional Evolution: The function will now be imbued with Creative Initiative and Contextual Memory.

        Initiative: If the user writes a scene that feels tonally inconsistent with the ProjectCodex, the AI will proactively comment: displayText: "I've added the dialogue you wrote. I noticed the tone is quite comedic, which differs from the 'dramatic thriller' style we established. Is this an intentional shift?", actions: [].

        Memory: The AI will remember the last few turns of the conversation to understand nuanced requests better, preventing the user from having to repeat themselves.

[NEW] analyzeScriptForInsights (The Digital Script Supervisor)

    Signature: analyzeScriptForInsights(scriptContent: string, projectCodex: ProjectCodex): Promise<AnalysisReport>

    Description: This is the heart of the new Analysis Engine. It performs a deep read of the script and returns a structured report on the craft of the storytelling. This is not a simple text generation; it is a true analytical function.

    Return Value (AnalysisReport):

        pacingGraph: A data array mapping scene numbers to a tension score (1-10), allowing the UI to render a visual graph of the story's rhythm.

        characterVoiceScores: An object scoring how consistent each character's dialogue is ({ "Mochi": 9.5, "Sensei Yumi": 8.2 }). A low score might trigger a warning.

        showDontTellWarnings: An array of objects identifying lines of pure exposition and suggesting visual alternatives (e.g., warning: "Line 45 is telling us Mochi is sad.", suggestion: "Consider a shot where Mochi looks at a faded photo of his family.").

        thematicResonance: An analysis of how well the current script aligns with the core themes defined in the ProjectCodex.

    Interaction with App: This function is called by the Analysis Engine in the background. The returned report populates a new "Analysis" tab in the Right Panel, providing the user with invaluable, export-level feedback on their work.

generateCinematography (The Virtual DP)

    Current State: Generates a generic list of shots for a scene.

    Professional Evolution: This function will now be guided by a much more detailed CinematicStyle object within the ProjectCodex. The user defines their visual language once, and the AI executes it.

        New ProjectCodex properties:
        code TypeScript

            
        interface CinematicStyle {
          cameraStyle: 'Static & Symmetrical' | 'Handheld & Gritty' | 'Sweeping & Epic';
          pacingStyle: 'Fast-paced, quick cuts' | 'Long, deliberate takes';
          lightingStyle: 'High-contrast noir' | 'Soft, natural light' | 'Vibrant & Saturated';
          colorPalette: { primary: string, secondary: string, accent: string };
        }

          

        The function signature becomes: generateCinematography(sceneContent: string, projectCodex: ProjectCodex): Promise<Shot[]>

        The AI's Logic: The AI no longer just reads the action. It reads the action through the lens of the specified style. A fight scene with a 'Handheld & Gritty' style will generate shaky-cam close-ups, while the same scene with a 'Sweeping & Epic' style will generate wide, stabilized crane shots.

    Interaction with App: The user defines their CinematicStyle in a new "Project Settings" area. This makes the AI's visual suggestions feel like they're coming from a consistent Director of Photography who understands the project's vision.

generateImageForShot (The Smart Storyboard Artist)

    Current State: Generates an image based on a scene description.

    Professional Evolution: The function will now synthesize a richer set of data points to create far more accurate and stylistically consistent images.

        New Signature: generateImageForShot(shotInfo: Shot, sceneContent: string, projectCodex: ProjectCodex): Promise<ImageURL>

        The AI's Logic: The underlying prompt sent to the image model will be a sophisticated compilation:

            Scene Content: "Mochi leaps from the shadows."

            Cinematography Data (shotInfo): "Extreme close-up, low angle..."

            Cinematic Style (projectCodex): "...in a high-contrast noir lighting style, with a saturated blue and accent red color palette."

            Asset Data (projectCodex): "...featuring the character 'Mochi' who looks like [approved asset description]."

    Interaction with App: This results in storyboard panels that are not just illustrative but are true pre-visualizations of the final film, consistent in character design, lighting, color, and camera language.

4. UI/UX Evolution: From Workspace to Studio
The Interactive Stage (Center Panel)

    Current State: A list of scenes with a "Generate" button.

    Professional Evolution: It becomes a fully Interactive Pre-visualization Board.

        Bi-Directional Syncing: Clicking a line of dialogue in the Script Editor will highlight the corresponding storyboard panel. Clicking a storyboard panel will highlight the corresponding line in the script. This creates a powerful link between text and image.

        On-Panel Shot Data: The cinematography data (e.g., CAMERA: CU, 85mm, Low-Angle) will be displayed as an overlay or directly beneath each storyboard panel.

        Panel Regeneration: Each individual storyboard panel will have a "Regenerate" button, allowing the user to iterate on a single shot without re-generating the entire scene.

The Professional Blueprint Export

    Current State: A planned feature to export the script and storyboard.

    Professional Evolution: The export system will generate a complete, industry-standard production bible.

        Automated Breakdowns: Using the data from extractAssetsFromScript, the PDF will automatically include:

            A Title Page

            A Character Breakdown (cast list)

            A Location Breakdown (scene list)

            A Prop Breakdown

        Analysis Report: The full report from the Analysis Engine can be optionally included as an appendix, perfect for pitching or script doctoring sessions.

This evolution transforms the plugin from a tool that helps you write into a partner that helps you direct. It understands the why behind the what, providing the deep, complex, and professional-grade functionality we originally envisioned.
Use Arrow Up and Arrow Down to select a turn, Enter to jump to it, and Escape to return to the chat.
