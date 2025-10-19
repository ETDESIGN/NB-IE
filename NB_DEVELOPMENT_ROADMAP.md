# NB photo editor: The Complete Development Roadmap

## Introduction

This document is the master plan and single source of truth for the development of the NB photo editor application. It is based on a detailed user review and outlines all remaining tasks required to stabilize the application, overhaul the user experience, and implement new features. The AI assistant will follow this roadmap sequentially, updating the status of each task upon completion.

---

## Phase 1: Critical Bug Fixes (Stabilize Core Functionality)

**Objective:** Address and resolve all major bugs that are currently breaking core application features.

### **Task 1.1: Fix the Inverted Erase Tool**

*   **Objective:** Correct the logic of the "Erase" function in the selection toolkit.
*   **Files to Modify:** `App.tsx` (specifically the `handleApplyEdit` function).
*   **Acceptance Criteria:**
    1.  When "Erase" mode is active and the user has created a selection mask, the content *inside* the selection is removed and inpainted by the AI.
    2.  The content *outside* the selection must remain completely untouched.
*   **Status:** COMPLETE

### **Task 1.2: Fix the Conversational Prompt (Text Mode)**

*   **Objective:** Re-enable the primary conversational AI control at the bottom of the canvas.
*   **Files to Modify:** `App.tsx` (specifically the `handleCommandSubmit` function).
*   **Acceptance Criteria:**
    1.  Typing a command like "make the image more vintage" into the `ConversationalCanvas` input and submitting it successfully triggers the `getIntentFromText` service.
    2.  The application correctly receives the structured `Intent` object and executes the appropriate action (e.g., calling `getAIAdjustments` and applying them).
    3.  The feature must be fully functional and no longer fail silently.
*   **Status:** COMPLETE

### **Task 1.3: Fix the Resize/Crop Tool**

*   **Objective:** Implement a proper, interactive cropping interface.
*   **Files to Modify:** `App.tsx`, `/components/Canvas.tsx`.
*   **Acceptance Criteria:**
    1.  When the "Resize" tool is selected, a visual cropping overlay with draggable handles appears on the canvas.
    2.  The "Visual" annotation system (placing dots) is disabled while the crop tool is active.
    3.  Dragging the handles updates the crop area. An "Apply Crop" button commits the change.
    4.  The current broken behavior of activating the annotation system is removed.
*   **Status:** COMPLETE

### **Task 1.4: Fix the Dead Toolbar Icons**

*   **Objective:** Wire the left-hand toolbar icons to their respective modals and functions.
*   **Files to Modify:** `App.tsx`.
*   **Acceptance Criteria:**
    1.  Clicking the "Character" icon on the left toolbar now correctly opens the `CharacterModal`.
    2.  All other non-functional icons in that toolbar are wired to their intended actions (e.g., opening modals).
*   **Status:** COMPLETE

---

## Phase 2: Core Workflow & User Experience Overhaul

**Objective:** Refine the application's workflow to be more intuitive, interactive, and professional.

### **Task 2.1: Implement the "Regenerate/Modify" Workflow**

*   **Objective:** Make the main generation panel context-aware based on whether an image is present on the canvas.
*   **Files to Modify:** `/components/RightPanel.tsx`, `/components/SmartPanel.tsx`, `App.tsx`.
*   **Acceptance Criteria:**
    1.  When `mainImage` is `null`, the main button in the `RightPanel` reads "Generate".
    2.  When `mainImage` has a value, the button's text changes to "Regenerate/Modify".
    3.  Clicking this button uses the `mainImage` as a base and applies the new text prompt, styles, or other selected options to it, replacing the current image with the result.
    4.  A new, secondary "Start Over" or "+" icon/button is added to the `RightPanel`, which allows the user to clear the `mainImage` and return to the standard "Generate" mode.
*   **Status:** COMPLETE

### **Task 2.2: Implement Live Adjustments**

*   **Objective:** Provide real-time feedback for the "Adjust" panel sliders to create a more interactive editing experience.
*   **Files to Modify:** `App.tsx`, `/components/Canvas.tsx`, `/components/panels/AdjustPanel.tsx`.
*   **Acceptance Criteria:**
    1.  Moving a slider in the `AdjustPanel` (e.g., Brightness, Contrast) immediately applies a corresponding CSS `filter` to the main canvas image for a live preview.
    2.  The "Apply Adjustments" button now "bakes" these CSS filter values into the image data, making the change permanent and adding it to the history stack.
    3.  The "Reset" button clears all live CSS filters.
*   **Status:** COMPLETE

### **Task 2.3: Implement Canvas Zoom**

*   **Objective:** Add a fundamental zoom capability to the main canvas.
*   **Files to Modify:** `App.tsx`, `/components/Canvas.tsx`.
*   **Acceptance Criteria:**
    1.  A new UI element (e.g., a `+ / -` overlay on the bottom right of the canvas container) is implemented.
    2.  Clicking these controls scales the `Canvas` component, allowing the user to zoom in and out of the image for detailed work.
*   **Status:** COMPLETE

### **Task 2.4: Decouple AI Analysis from Image Upload**

*   **Objective:** Change the AI analysis to be an intentional user action rather than an automatic one.
*   **Files to Modify:** `App.tsx` (specifically `handleImageUpload`).
*   **Acceptance Criteria:**
    1.  The call to `fetchAndSetSuggestions` is completely removed from the `handleImageUpload` function.
    2.  Uploading an image now only displays the image on the canvas.
    3.  The AI analysis is only triggered when the user explicitly clicks the "Analyze Image" tool in the toolbar.
*   **Status:** COMPLETE

---

## Phase 3: Enhance AI & Content

**Objective:** Improve the intelligence of the AI's prompt interpretation and expand the application's built-in content.

### **Task 3.1: Fix Conceptual Tag Interpretation**

*   **Objective:** Refine the prompt engineering for Style, Composition, and Effect tags to prevent the AI from misinterpreting them as literal objects.
*   **Files to Modify:** `App.tsx` (specifically the `handleGenerate` function).
*   **Acceptance Criteria:**
    1.  A mapping or a more intelligent prompt assembly function is created.
    2.  When a user selects a conceptual tag (e.g., "#drone" from the Composition modal), the final prompt sent to the AI includes a descriptive phrase like, "Use a high-angle drone shot perspective," rather than just the raw tag.
*   **Status:** COMPLETE

### **Task 3.2: Verify PNG Transparency for Background Remover**

*   **Objective:** Ensure the background removal tool produces a correctly formatted, transparent PNG.
*   **Files to Modify:** `App.tsx` (specifically `handleRemoveBackground` and `handleDownload`).
*   **Acceptance Criteria:**
    1.  After using the "Remove Background" tool, the `mainImage` state contains a base64 string for a PNG with a transparent background.
    2.  The `handleDownload` function correctly saves this image as a `.png` file that preserves the transparency when opened in other software.
*   **Status:** COMPLETE

### **Task 3.3: Expand the "Dice Roll" Prompt Library**

*   **Objective:** Add more variety to the random prompt suggestions to enhance creativity.
*   **Files to Modify:** `constants.ts`.
*   **Acceptance Criteria:**
    1.  The `PROMPT_SUGGESTIONS` array is expanded to contain at least 20 new, diverse, and creative prompts.
*   **Status:** COMPLETE

---

## Phase 4: Implement Incomplete Features

**Objective:** Bring all non-functional UI elements to life.

### **Task 4.1: Implement the "Auto" Dropdown in Conversational Canvas**

*   **Objective:** Activate the "Auto" dropdown to allow users to control the AI's creative latitude.
*   **Files to Modify:** `App.tsx`, `/components/ConversationalCanvas.tsx`.
*   **Acceptance Criteria:**
    1.  The dropdown menu is populated with three options: "Auto," "Strict," and "Creative."
    2.  Selecting an option updates the `aiMode` state in `App.tsx`.
    3.  The `getIntentFromText` service function uses this `aiMode` state to modify its system prompt accordingly.
*   **Status:** COMPLETE

### **Task 4.2: Implement the Selection Mode Tools**

*   **Objective:** Make the Brush, Lasso, and Click selection modes functional.
*   **Files to Modify:** `App.tsx`, `/components/Canvas.tsx`, `/components/bottombars/SelectBottomBar.tsx`.
*   **Acceptance Criteria:**
    1.  Buttons for "Brush," "Lasso," and "Click" are added to the `SelectBottomBar`.
    2.  The `Canvas` component is updated to support different drawing modes for creating the selection mask based on the active mode. This may require integrating a more advanced canvas library like `Fabric.js` or writing custom event handlers.
*   **Status:** COMPLETE