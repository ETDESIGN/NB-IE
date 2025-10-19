import type { CustomStyle } from '../types';

const STYLE_STORAGE_KEY = 'nano-banana-custom-styles';

export const getCustomStyles = (): CustomStyle[] => {
    try {
        const stored = localStorage.getItem(STYLE_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Failed to load custom styles from localStorage", error);
        return [];
    }
};

export const saveCustomStyles = (styles: CustomStyle[]): void => {
    try {
        localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(styles));
    } catch (error) {
        console.error("Failed to save custom styles to localStorage", error);
    }
};
