import type { UserObject } from '../types';

const OBJECT_STORAGE_KEY = 'nano-banana-user-objects';

export const getObjects = (): UserObject[] => {
    try {
        const storedObjects = localStorage.getItem(OBJECT_STORAGE_KEY);
        if (!storedObjects) return [];

        const objects = JSON.parse(storedObjects) as (Partial<UserObject> & { image?: string })[];
        
        // Data migration for objects created before the new structure was implemented.
        // This prevents crashes when loading old data.
        return objects.map((obj, index) => ({
            id: obj.id || `obj-migrated-${Date.now()}-${index}`,
            name: obj.name || 'Untitled Object',
            description: obj.description || '',
            // If old `image` field exists, use it for the new fields.
            referenceSheetImage: obj.referenceSheetImage || obj.image || '',
            avatar: obj.avatar || obj.image || '',
        }));
    } catch (error) {
        console.error("Failed to load user objects from localStorage", error);
        return [];
    }
};

export const saveObjects = (objects: UserObject[]): void => {
    try {
        localStorage.setItem(OBJECT_STORAGE_KEY, JSON.stringify(objects));
    } catch (error) {
        console.error("Failed to save user objects to localStorage", error);
    }
};