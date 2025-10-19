import type { Character } from '../types';

const CHARACTER_STORAGE_KEY = 'nano-banana-characters';

export const getCharacters = (): Character[] => {
    try {
        const storedCharacters = localStorage.getItem(CHARACTER_STORAGE_KEY);
        return storedCharacters ? JSON.parse(storedCharacters) : [];
    } catch (error) {
        console.error("Failed to load characters from localStorage", error);
        return [];
    }
};

export const saveCharacters = (characters: Character[]): void => {
    try {
        localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characters));
    } catch (error) {
        console.error("Failed to save characters to localStorage", error);
    }
};
