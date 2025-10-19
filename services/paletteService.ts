import type { CustomPalette } from '../types';

const PALETTE_STORAGE_KEY = 'nano-banana-custom-palettes';

export const getCustomPalettes = (): CustomPalette[] => {
    try {
        const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load custom palettes from localStorage", error);
        return [];
    }
};

export const saveCustomPalettes = (palettes: CustomPalette[]): void => {
    try {
        localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(palettes));
    } catch (error) {
        console.error("Failed to save custom palettes to localStorage", error);
    }
};
