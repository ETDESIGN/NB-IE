import { createAssetFromImages, generateObject, createVirtualEnvironment, cleanImageOfUI, getIntentFromText } from './geminiService';
import type { Character, UserObject, SavedScene } from '../types';

/**
 * Resizes and compresses a base64 image string for local storage.
 */
const compressImageForStorage = async (base64Str: string, maxDimension: number = 512, quality: number = 0.8, format: 'jpeg' | 'png' = 'jpeg'): Promise<string> => {
    return new Promise((resolve) => {
        if (!base64Str || !base64Str.startsWith('data:image')) {
            return resolve(base64Str);
        }
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let { naturalWidth: width, naturalHeight: height } = img;
            
            if (width <= maxDimension && height <= maxDimension) {
                // No resize needed, but still re-encode for compression
            } else if (width > height) {
                height = Math.round(height * (maxDimension / width));
                width = maxDimension;
            } else {
                width = Math.round(width * (maxDimension / height));
                height = maxDimension;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(base64Str);
            if (format === 'jpeg') {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL(`image/${format}`, quality));
        };
        img.onerror = () => resolve(base64Str);
    });
};


export const createCharacter = async (images: string[], name: string, description?: string): Promise<Character> => {
    if ((images.length === 0 && !description) || !name) {
        throw new Error('Please provide a name and either images or a description.');
    }
    const result = await createAssetFromImages(images, name, 'character', description);
    if (!result) throw new Error("Character creation failed to return data.");

    const compressedSheet = await compressImageForStorage(result.sheetImage, 1024, 0.8, 'jpeg');
    const compressedAvatar = await compressImageForStorage(result.sheetImage, 256, 0.8, 'jpeg');

    const newCharacter: Character = { id: `char-${Date.now()}`, name, description: result.description, referenceSheetImage: compressedSheet, avatar: compressedAvatar };
    return newCharacter;
};

export const createObject = async (prompt: string, description?: string): Promise<UserObject> => {
    if (!prompt) {
        throw new Error('Please provide a description for the new object.');
    }
    
    const image = await generateObject(prompt);
    const finalDescription = description || (await getIntentFromText(`describe this object: ${prompt}`, image, 'strict')).parameters?.description || `A ${prompt}`;
    
    const compressedImage = await compressImageForStorage(image, 512, 1.0, 'png');
    const newObject: UserObject = { id: `obj-${Date.now()}`, name: prompt, description: finalDescription, referenceSheetImage: compressedImage, avatar: compressedImage };
    return newObject;
};

export const createScene = async (images: string[], name: string, description: string): Promise<SavedScene> => {
    const cleanedImages = await Promise.all(images.map(img => cleanImageOfUI(img)));
    if (!cleanedImages) throw new Error("Failed to clean images for scene creation.");

    const envData = await createVirtualEnvironment(cleanedImages, description);
    if (!envData) throw new Error("Failed to create virtual environment.");
    
    const compressedSheet = await compressImageForStorage(envData.referenceSheetImage, 1024, 0.8, 'jpeg');
    const compressedAvatar = await compressImageForStorage(envData.avatar, 256, 0.8, 'jpeg');
    const newScene: SavedScene = { id: `scene-${Date.now()}`, name, ...envData, referenceSheetImage: compressedSheet, avatar: compressedAvatar };
    return newScene;
};
