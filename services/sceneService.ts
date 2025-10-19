import type { SavedScene } from '../types';

const SCENE_STORAGE_KEY = 'nano-banana-scenes';

export const getScenes = (): SavedScene[] => {
    try {
        const storedScenes = localStorage.getItem(SCENE_STORAGE_KEY);
        if (!storedScenes) return [];
        const scenes = JSON.parse(storedScenes) as any[]; 
        
        return scenes.map((scene, index) => {
            // Check for a field that only exists in the new structure to identify old data
            if (!scene.technicalSheet) {
                // This is an old scene object, migrate it
                return {
                    id: scene.id || `scene-migrated-${Date.now()}-${index}`,
                    name: scene.name || 'Untitled Scene',
                    userImages: [scene.referenceSheetImage || scene.imageData].filter(Boolean),
                    userDescription: scene.description || 'A beautiful scene.',
                    technicalSheet: scene.description || 'A beautiful scene.',
                    detailShots: [],
                    aerialMap: '',
                    inferredExteriors: [],
                    referenceSheetImage: scene.referenceSheetImage || scene.imageData || '',
                    avatar: scene.avatar || scene.imageData || '',
                    castObjectIds: [], // Initialize new field for old data
                };
            }
             // This is a new scene object, ensure castObjectIds exists
            return {
                ...scene,
                castObjectIds: scene.castObjectIds || [],
            };
        });
    } catch (error) {
        console.error("Failed to load scenes from localStorage", error);
        return [];
    }
};


export const saveScenes = (scenes: SavedScene[]): void => {
    try {
        localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify(scenes));
    } catch (error) {
        console.error("Failed to save scenes to localStorage", error);
    }
};