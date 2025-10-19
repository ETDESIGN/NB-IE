import type { DirectorProjectState } from '../types';

const PROJECT_STORAGE_KEY = 'nano-banana-director-project';

export const saveProject = (projectState: DirectorProjectState): void => {
    try {
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectState));
    } catch (error) {
        console.error("Failed to save project to localStorage", error);
    }
};

export const loadProject = (): DirectorProjectState | null => {
    try {
        const storedProject = localStorage.getItem(PROJECT_STORAGE_KEY);
        return storedProject ? JSON.parse(storedProject) : null;
    } catch (error) {
        console.error("Failed to load project from localStorage", error);
        return null;
    }
};
