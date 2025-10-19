import type { Adjustments } from '../types';

export const applyMaskToImage = async (imageB64: string, maskBase64: string, keepMaskedArea: boolean): Promise<string> => {
    const originalImage = new Image();
    originalImage.src = imageB64;
    await new Promise<void>((res, rej) => { originalImage.onload = () => res(); originalImage.onerror = rej; });

    const maskImage = new Image();
    maskImage.src = maskBase64;
    await new Promise<void>((res, rej) => { maskImage.onload = () => res(); maskImage.onerror = rej; });

    const canvas = document.createElement('canvas');
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context.');

    if (keepMaskedArea) {
        ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(originalImage, 0, 0);
    } else {
        ctx.drawImage(originalImage, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/png');
};

export const applyAdjustmentsToImage = async (base64Image: string, adjustments: Adjustments): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            
            ctx.filter = `
              brightness(${adjustments.brightness}%) 
              contrast(${adjustments.contrast}%) 
              saturate(${adjustments.saturation}%)
              hue-rotate(${adjustments.hue}deg)
            `;
            ctx.drawImage(img, 0, 0);
            
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = base64Image;
    });
};

export const applyCrop = async (currentImage: string, cropBox: { x: number, y: number, width: number, height: number }): Promise<string> => {
    const img = new Image();
    img.src = currentImage;
    await new Promise(resolve => { img.onload = resolve });

    const canvas = document.createElement('canvas');
    const cropX = img.naturalWidth * cropBox.x;
    const cropY = img.naturalHeight * cropBox.y;
    const cropWidth = img.naturalWidth * cropBox.width;
    const cropHeight = img.naturalHeight * cropBox.height;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context");
    
    ctx.drawImage(
        img,
        cropX, cropY,
        cropWidth, cropHeight,
        0, 0,
        cropWidth, cropHeight
    );

    return canvas.toDataURL('image/png');
};
