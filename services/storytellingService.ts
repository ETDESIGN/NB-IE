import { parseBlueprint as parseBlueprintApi, generateStoryboardImage as generateStoryboardImageApi } from './geminiService';
import type { ParsedBlueprint, StoryboardImage, Character } from '../types';

export const parseAndValidateBlueprint = async (
    blueprintText: string,
    savedCharacters: Character[]
): Promise<{ parsed: ParsedBlueprint, unresolved: { type: 'Character' | 'Object' | 'Scene', name: string, blueprintId: string, description?: string }[] }> => {
    
    const parsed = await parseBlueprintApi(blueprintText);
    if (!parsed) throw new Error("Parsing failed.");

    const unresolved: { type: 'Character' | 'Object' | 'Scene', name: string, blueprintId: string, description?: string }[] = [];
    
    parsed.globalContext.characters.forEach(char => {
        const found = savedCharacters.find(sChar => sChar.name === char.name);
        if (!found) {
            const charDesc = parsed.globalContext.characterDescriptions?.find(d => d.name === char.name);
            unresolved.push({ type: 'Character', name: char.name, blueprintId: char.id, description: charDesc?.description });
        } else {
            char.assignedCharacterId = found.id;
        }
    });

    // Future: Add validation for objects and scenes here.

    return { parsed, unresolved };
};

export const generateStoryboard = async (
    parsedBlueprint: ParsedBlueprint,
    storyboardImages: StoryboardImage[],
    savedCharacters: Character[],
    updateImageCallback: (sceneNumber: number, frameNumber: number, imageData: string | null, status: 'generating' | 'complete' | 'error', errorMessage?: string) => void
) => {
    let previousFrameB64: string | null = null;
    let lastSceneNumber = -1;

    for (const image of storyboardImages.sort((a, b) => a.sceneNumber - b.sceneNumber || a.frameNumber - b.frameNumber)) {
        if (image.sceneNumber !== lastSceneNumber) {
            previousFrameB64 = null;
            lastSceneNumber = image.sceneNumber;
        }
        
        try {
            updateImageCallback(image.sceneNumber, image.frameNumber, null, 'generating');
            
            const imageData = await generateStoryboardImageApi(parsedBlueprint, image.sceneNumber, image.frameNumber, savedCharacters, previousFrameB64 ? [previousFrameB64] : null);

            if (imageData) {
                updateImageCallback(image.sceneNumber, image.frameNumber, imageData, 'complete');
                previousFrameB64 = imageData;
            } else {
                throw new Error('API returned no image.');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            updateImageCallback(image.sceneNumber, image.frameNumber, null, 'error', message);
        }
    }
};
