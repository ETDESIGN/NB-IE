import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { Intent, Adjustments, AspectRatio, ImageAnalysis, Annotation, Character, ParsedBlueprint, SavedScene, ColorInfo, ProjectCodex, CopilotAgentResponse, CopilotMessage, AnalysisReport } from '../types';
import { ADJUSTMENT_PRESETS } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODELS = {
    DIRECTOR: 'gemini-2.5-flash-image-preview',
    FLASH: 'gemini-2.5-flash',
    IMAGEN: 'imagen-4.0-generate-001'
};

const getMimeTypeAndBytes = (base64Image: string) => {
    const match = base64Image.match(/data:(.*?);base64,(.*)/);
    if (!match || match.length < 3) {
        // Fallback for cases where the data URL might be malformed or just the bytes are passed
        if (base64Image.startsWith('data:')) {
             throw new Error("Invalid base64 image format. Expected 'data:image/...;base64,...'");
        }
        // Assume PNG if no header, but this is a fallback.
        console.warn("Image string does not appear to be a data URL, assuming image/png. Full functionality not guaranteed.");
        return { mimeType: 'image/png', data: base64Image };
    }
    return { mimeType: match[1], data: match[2] };
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    try {
        const systemInstruction = `You are a creative assistant. Elaborate on the user's image prompt to make it more vivid and descriptive for an AI image generator. The new prompt should be a single, cohesive sentence or a short paragraph. Focus on visual details, lighting, style, and composition. Return only the new prompt as a single string, without any preamble or explanation.`;

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: `User's prompt: "${prompt}"`,
            config: {
                systemInstruction,
                temperature: 0.9,
            },
        });
        
        const enhancedPrompt = response.text.trim();
        // Return original prompt if enhancement is empty or too short
        return enhancedPrompt.length > 10 ? enhancedPrompt : prompt;

    } catch (error) {
        console.error("Error in enhancePrompt:", error);
        // Fallback to original prompt on error
        return prompt;
    }
};


const intentSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            description: "The core verb of the command. Examples: 'select', 'add', 'remove', 'change', 'adjust', 'generate'. Use 'remove' for requests like 'delete', 'erase', or 'make transparent'."
        },
        target: {
            type: Type.STRING,
            description: "The noun or subject of the action. Examples: 'subject', 'background', 'sky', 'car', 'the blue shirt', 'image', 'selection'."
        },
        parameters: {
            type: Type.OBJECT,
            description: "Additional details for the action.",
            properties: {
                description: { type: Type.STRING, description: "A descriptive goal, e.g., 'dramatic sunset', 'red', 'more vibrant'." },
                mood: { type: Type.STRING, description: "A specific mood for an adjustment, e.g., 'cinematic', 'vintage'." }
            }
        }
    },
    required: ['action', 'target']
};

export const getIntentFromText = async (command: string, base64Image: string | null, aiMode: 'auto' | 'strict' | 'creative'): Promise<Intent> => {
    try {
        let systemInstruction = `You are the command interpretation engine for an advanced photo editing application. Your task is to analyze the user's natural language command and translate it into a structured JSON object. The JSON must strictly adhere to the provided schema. Analyze the command to determine the primary 'action', the 'target' of that action (e.g., 'image', 'selection', 'sky', or a specific object), and any 'parameters' required.

'image' refers to the whole canvas.
'selection' refers to an area the user has already selected.
'subject' refers to the main subject of the photo.
'background' refers to the area behind the main subject.
Crucially, if the user asks to 'delete', 'erase', or 'make something transparent', you MUST classify this as a 'remove' action.`;

        if (aiMode === 'strict') {
            systemInstruction += "\n\nYou must adhere strictly to the user's command and not infer any creative intent.";
        } else if (aiMode === 'creative') {
            systemInstruction += "\n\nYou are encouraged to take creative liberties to produce a more aesthetically pleasing result based on the user's intent.";
        }


        const contentParts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [{ text: `User command: "${command}"` }];

        if (base64Image) {
            const { mimeType, data } = getMimeTypeAndBytes(base64Image);
            contentParts.unshift({ inlineData: { data, mimeType } });
        }

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: { parts: contentParts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: intentSchema,
            },
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as Intent;

    } catch (error) {
        console.error("Error in getIntentFromText:", error);
        throw new Error(`Failed to parse command. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateObject = async (prompt: string): Promise<string> => {
    try {
        const instruction = `You are an AI asset generator. Your task is to create a photorealistic image of the object described in the user's prompt. The object MUST be generated on a completely transparent background. The output must be a PNG file with a full alpha channel. Pay close attention to lighting and detail to ensure the object can be realistically composited into another scene. Do not add any background, just the object on transparency.\n\nUser's request: "Generate an image of: ${prompt}"`;

        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: [{ text: instruction }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return an image for the object. It returned: ${textPart?.text || 'No text response'}`);
        }
    } catch (error) {
        console.error("Error in generateObject:", error);
        throw new Error(`Failed to generate object. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const getSelectionMaskFromPrompt = async (base64Image: string, selectionPrompt: string): Promise<string> => {
    try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        const instruction = `You are an expert image editor. Your task is to edit the provided image to create a segmentation mask. Make the area corresponding to "${selectionPrompt}" completely white (#FFFFFF). Make everything else completely transparent (alpha 0). The final output should be a PNG image with transparency and the same dimensions as the original. Do not include any other content or text in your response, only the resulting mask image.`;

        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: instruction }
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        
        // Fallback: check text parts for base64 string
        const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
        if (textPart?.text) {
            // Remove markdown backticks and 'png' label
            const cleanedText = textPart.text.replace(/```(png)?/g, '').trim();
            // A simple check if it looks like base64
            if (cleanedText.length > 100 && (cleanedText.startsWith('iVBOR') || /^[A-Za-z0-9+/=\s]+$/.test(cleanedText))) {
                return `data:image/png;base64,${cleanedText.replace(/\s/g, '')}`; // also remove any whitespace
            }
        }

        throw new Error(`API did not return a valid mask. It returned: ${textPart?.text || 'No media content'}`);
        
    } catch (error) {
        console.error("Error in getSelectionMaskFromPrompt:", error);
        throw new Error(`Failed to get AI selection mask. ${error instanceof Error ? error.message : String(error)}`);
    }
};

const convertImageToPNG = (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Could not get canvas context'));
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(err);
        img.src = base64Image;
    });
};

export const editImageWithAnnotations = async (
    base64Image: string,
    annotations: Annotation[]
): Promise<string> => {
    try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);

        const annotationText = annotations
            .map((anno, index) =>
                `- Annotation #${index + 1} at (x: ${Math.round(anno.x * 100)}%, y: ${Math.round(
                    anno.y * 100
                )}%): "${anno.text}"`
            )
            .join('\n');

        const instruction = `You are an expert photo editor. The user has provided an image with several annotations pointing to specific locations. Your task is to edit the image based on all the instructions provided in the annotations. Apply each instruction at its corresponding coordinate. The final result should be a single, edited image that incorporates all the requested changes.

Here are the annotations:
${annotationText}`;

        const contentParts = [
            { inlineData: { data, mimeType } },
            { text: instruction },
        ];

        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return an image for annotation edit. It returned: ${textPart?.text || 'No text response'}`);
        }
    } catch (error) {
        console.error("Error in editImageWithAnnotations:", error);
        throw new Error(`Failed to edit with annotations. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const editImage = async (
    base64Image: string,
    prompt: string,
    options: { maskBase64?: string | null; overlayImageB64?: string | null; } = {}
): Promise<string> => {
    try {
        const { maskBase64, overlayImageB64 } = options;
        const pngImage = await convertImageToPNG(base64Image);
        const imageBytes = pngImage.split(',')[1];
        
        const contentParts: ({ inlineData: { data: string; mimeType: string; }; } | { text: string; })[] = [
            { inlineData: { data: imageBytes, mimeType: 'image/png' } },
        ];
        
        let instruction = prompt;
        if (maskBase64) {
             const maskBytes = maskBase64.split(',')[1];
             contentParts.push({ inlineData: { data: maskBytes, mimeType: 'image/png' } });
             // The prompt from App.tsx is already descriptive enough and context-aware.
             // No need to wrap it in additional instructions.
        }

        if (overlayImageB64) {
            const overlayBytes = overlayImageB64.split(',')[1];
            contentParts.push({ inlineData: { data: overlayBytes, mimeType: 'image/png' }});
            instruction = `User's instruction: "${prompt}". You have been provided with a base image and a second image of an object on a transparent background. Your task is to intelligently place the object from the second image into the base image. The placement should be realistic in terms of scale, lighting, and position. Then, return the final composited image.`
        }
        
        contentParts.push({ text: instruction });
        
        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return an image. It returned: ${textPart?.text || 'No text response'}`);
        }
    } catch (error) {
        console.error("Error in editImage:", error);
        throw error;
    }
};

export const generateImage = async (
    prompt: string,
    negativePrompt: string,
    aspectRatio: AspectRatio,
    model: string,
    numberOfImages: number,
    imageReferences?: { mimeType: string; data: string }[],
    styleReference?: { mimeType: string; data: string },
    sceneReference?: { mimeType: string; data: string },
    baseImageForModification?: string | null
): Promise<string[]> => {
    try {
        if (baseImageForModification || (imageReferences && imageReferences.length > 0) || styleReference || sceneReference) {
            
            const contentParts: any[] = [];
            let fullPrompt = '';

            if (baseImageForModification) {
                const { mimeType, data } = getMimeTypeAndBytes(baseImageForModification);
                contentParts.push({ inlineData: { data, mimeType } });
                fullPrompt = `You are an expert photo editor. A base image is provided. Your task is to modify it based on the user's prompt and any additional reference images provided. Preserve the original composition and subject as much as possible unless explicitly told otherwise. `;
            } else {
                fullPrompt = `Generate a new image based on the following instructions. `;
            }
            
            if (sceneReference) {
                contentParts.push({ inlineData: { data: sceneReference.data, mimeType: sceneReference.mimeType } });
                if(baseImageForModification) {
                     fullPrompt += `The goal is to re-imagine the base image, placing its subject within the context, style, and lighting of the provided scene reference. `;
                } else {
                     fullPrompt = `The user has provided a background/scene image and a text prompt. Your task is to generate a new image that places the subject of the text prompt realistically within the provided background. The style, lighting, and perspective of the new elements must match the background image. `;
                }
            }

            if(styleReference) {
                contentParts.push({ inlineData: { data: styleReference.data, mimeType: styleReference.mimeType } });
                fullPrompt += `The final image should strongly reflect the artistic style, color palette, and texture of this style reference image. `;
            }

            if (imageReferences && imageReferences.length > 0) {
                 const imageParts = imageReferences.map(ref => ({ inlineData: { data: ref.data, mimeType: ref.mimeType } }));
                 contentParts.push(...imageParts);
                 fullPrompt += `Also use these other provided image(s) as a reference for content, subject matter, and composition. `;
            }

            if (prompt) {
                fullPrompt += `The user's primary instruction is: "${prompt}". `;
            }
            
            if (negativePrompt) {
                fullPrompt += `Do not include: ${negativePrompt}.`;
            }

            contentParts.push({ text: fullPrompt });

            const response = await ai.models.generateContent({
                model: MODELS.DIRECTOR,
                contents: { parts: contentParts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData) {
                return [`data:image/png;base64,${imagePart.inlineData.data}`];
            } else {
                throw new Error('API with references did not return an image.');
            }
        }

        // If no image references, use the powerful `generateImages` model for multiple images.
        const fullPrompt = negativePrompt
            ? `${prompt}. Do not include: ${negativePrompt}.`
            : prompt;

        const response = await ai.models.generateImages({
            model: model,
            prompt: fullPrompt,
            config: {
                numberOfImages: numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        const images = response.generatedImages?.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        if (images && images.length > 0) {
            return images;
        } else {
            throw new Error('API did not return any generated images.');
        }
    } catch (error) {
        console.error("Error in generateImage:", error);
        throw new Error(`Failed to generate image. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const enhanceImage = async (base64Image: string, instruction: string): Promise<string> => {
    try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        
        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: instruction }
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
             return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`Image enhancement failed. API returned: ${textPart?.text || 'No text response'}`);
        }
    } catch (error) {
        console.error(`Error in enhanceImage:`, error);
        throw new Error(`Failed to enhance image. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const generateImageWithCharacter = async (
    base64SheetImage: string,
    characterDescription: string,
    scenePrompt: string,
    negativePrompt: string,
    aspectRatio: AspectRatio,
    baseImageForModification?: string | null
): Promise<string> => {
    try {
        let instruction = '';
        const contentParts: any[] = [];

        if (baseImageForModification) {
            const { mimeType, data } = getMimeTypeAndBytes(baseImageForModification);
            contentParts.push({ inlineData: { data, mimeType } });
        }

        const { mimeType: charMime, data: charData } = getMimeTypeAndBytes(base64SheetImage);
        contentParts.push({ inlineData: { data: charData, mimeType: charMime } });

        if (baseImageForModification) {
            instruction = `You are an expert photo editor. A base image and a character reference sheet are provided. Your task is to intelligently integrate the specified character into the base image according to the scene description. The final image should be a cohesive composition, matching the style, lighting, and perspective of the base image. Do not change the existing content of the base image unless necessary to place the character realistically.

Character Description: "${characterDescription}"

Scene Description / Instructions: "${scenePrompt}".
${negativePrompt ? `Do not include: ${negativePrompt}.` : ''}`;
        } else {
            instruction = `You are a creative AI assistant specializing in character-consistent image generation. You have been given a detailed visual reference sheet of a character and its technical description. Your task is to generate a new image featuring that exact character in the new scene described below. Maintain all key features of the character shown in the reference sheet and described in the text.

Character Description: "${characterDescription}"

New Scene: "${scenePrompt}".

The aspect ratio of the generated image should be ${aspectRatio}.
${negativePrompt ? `Do not include: ${negativePrompt}.` : ''}`;
        }

        contentParts.push({ text: instruction });

        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return an image for the character generation. It returned: ${textPart?.text || 'No text response'}`);
        }

    } catch (error) {
        console.error("Error in generateImageWithCharacter:", error);
        throw new Error(`Failed to generate character image. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const createAssetFromImages = async (base64Images: string[], name: string, assetType: 'character' | 'object', providedDescription?: string): Promise<{description: string, sheetImage: string}> => {
    try {
        const imageParts = base64Images.map(img => {
            const { mimeType, data } = getMimeTypeAndBytes(img);
            return { inlineData: { data, mimeType } };
        });

        let description = providedDescription;

        // Step 1: Generate detailed description IF not provided and images are available
        if (!description && imageParts.length > 0) {
            const descriptionSystemInstruction = `Analyze the following images of a ${assetType}. Create a highly detailed, technical blueprint-style description of its appearance. This description will be used to guide an AI in recreating it accurately. Cover every possible detail: species/type, colors, textures, specific patterns (stripes, spots, etc.), key features, shape, build, and any unique or distinctive markings. The description should be objective and comprehensive.`;
            
            const descriptionResponse = await ai.models.generateContent({
                model: MODELS.FLASH,
                contents: { parts: [...imageParts, { text: `Please generate the technical description for this ${assetType} named "${name}".` }] },
                config: {
                    systemInstruction: descriptionSystemInstruction,
                },
            });
            description = descriptionResponse.text;
        }


        // Step 2: Generate the reference sheet image
        const contentPartsForSheet: ({ inlineData: { data: string; mimeType: string; }; } | { text: string; })[] = [];
        let sheetGenInstruction = '';

        if (imageParts.length > 0) {
            contentPartsForSheet.push(...imageParts);
            sheetGenInstruction = `Based on the uploaded photos, create a comprehensive, multi-panel visual reference sheet. This sheet is for an AI to accurately reproduce the subject's unique details.

            Subject Focus: The ${assetType} from the photos. Ensure absolute fidelity to its specific colors, patterns, and key features.

            Composition & Layout: Generate a single, high-resolution image structured as a clean grid. Each panel should showcase a specific view or detail against a pure white studio background. The lighting must be bright, even, and shadowless.

            Required Views:
            1. Full Body/Object - Frontal view.
            2. Full Body/Object - Profile, Left side view.
            3. Full Body/Object - 3/4 View.
            4. Close-up of a key feature.
            5. Close-up of another distinguishing detail or texture.
            6. Full Body/Object - Rear view.

            Style & Resolution: The output must be a single, ultra-photorealistic image containing this grid. The details must be crisp and colors accurate.`;
        } else if (description) {
            sheetGenInstruction = `Based on the following technical description, create a comprehensive, multi-panel visual reference sheet. This sheet is for an AI to accurately reproduce the subject's unique details.

            Technical Description: "${description}"

            Composition & Layout: Generate a single, high-resolution image structured as a clean grid. Each panel should showcase a specific view or detail against a pure white studio background. The lighting must be bright, even, and shadowless.

            Required Views:
            1. Full Body/Object - Frontal view.
            2. Full Body/Object - Profile, Left side view.
            3. Full Body/Object - 3/4 View.
            4. Close-up of a key feature.
            5. Close-up of another distinguishing detail or texture.
            6. Full Body/Object - Rear view.

            Style & Resolution: The output must be a single, ultra-photorealistic image containing this grid. The details must be crisp and colors accurate.`;
        } else {
             throw new Error(`Cannot create ${assetType} without either images or a description.`);
        }
        contentPartsForSheet.push({ text: sheetGenInstruction });

        const sheetResponse = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: contentPartsForSheet },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = sheetResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const sheetImage = `data:image/png;base64,${imagePart.inlineData.data}`;
            return { description: description!, sheetImage };
        } else {
            const textPart = sheetResponse.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return a reference sheet image. It returned: ${textPart?.text || 'No text response'}`);
        }

    } catch (error) {
        console.error("Error in createAssetFromImages:", error);
        throw new Error(`Failed to create ${assetType}. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const createSceneAsset = async (base64Images: string[], name: string, userDescription: string): Promise<{description: string, sheetImage: string}> => {
    try {
        const imageParts = base64Images.map(img => {
            const { mimeType, data } = getMimeTypeAndBytes(img);
            return { inlineData: { data, mimeType } };
        });

        // Step 1: Generate detailed description
        const descriptionSystemInstruction = `Analyze the following images of a scene/background and the user's description. Create a single, cohesive, and vivid description suitable for an AI image generator. Synthesize the user's intent with the visual information. Cover the location's key features, architecture, time of day, lighting, color palette, mood, and overall atmosphere.`;
        
        const descriptionResponse = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: { parts: [...imageParts, { text: `User description for scene named "${name}": "${userDescription}"` }] },
            config: { systemInstruction: descriptionSystemInstruction },
        });
        const description = descriptionResponse.text;

        // Step 2: Generate the reference sheet image
        const sheetGenInstruction = `Based on the provided reference images and this detailed description, create a single, high-quality, cinematic establishing shot of the scene. The image should be in a 16:9 aspect ratio and capture the essence of the location. The output must be a single, photorealistic image.

Detailed Description: "${description}"`;

        const sheetResponse = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: [...imageParts, { text: sheetGenInstruction }] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = sheetResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const sheetImage = `data:image/png;base64,${imagePart.inlineData.data}`;
            return { description, sheetImage };
        } else {
            const textPart = sheetResponse.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return a scene image. It returned: ${textPart?.text || 'No text response'}`);
        }

    } catch (error) {
        console.error("Error in createSceneAsset:", error);
        throw new Error(`Failed to create scene asset. ${error instanceof Error ? error.message : String(error)}`);
    }
};


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        dominantColors: {
            type: Type.ARRAY,
            description: "An array of 4-5 objects, each representing a dominant color found in the image.",
            items: {
                type: Type.OBJECT,
                properties: {
                    hex: { type: Type.STRING, description: "The hex code of the color, e.g., '#B0C4DE'." },
                    name: { type: Type.STRING, description: "A descriptive name for the color, e.g., 'light steel blue'." }
                },
                required: ['hex', 'name']
            }
        },
        objects: {
            type: Type.ARRAY,
            description: "An array of strings listing the main objects, subjects, or elements identified in the image.",
            items: { type: Type.STRING }
        },
        mood: {
            type: Type.STRING,
            description: "A short phrase (2-5 words) describing the overall mood, atmosphere, or feeling of the image."
        },
        composition: {
            type: Type.ARRAY,
            description: "An array of 2-3 strings describing key photographic composition techniques used (e.g., 'Rule of Thirds', 'Leading Lines', 'Symmetry').",
            items: { type: Type.STRING }
        },
        lighting: {
            type: Type.STRING,
            description: "A short phrase describing the lighting (e.g., 'Soft, diffused daylight', 'Golden hour', 'Dramatic side-lighting')."
        },
        artisticStyle: {
            type: Type.STRING,
            description: "A short phrase identifying the artistic style (e.g., 'Photorealistic', 'Impressionistic', 'Minimalist')."
        }
    },
    required: ['dominantColors', 'objects', 'mood', 'composition', 'lighting', 'artisticStyle']
};

export const analyzeImage = async (base64Image: string): Promise<ImageAnalysis> => {
    try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        const systemInstruction = `You are an expert image analyst AI. Your task is to analyze the provided image and return a structured JSON object describing its key visual characteristics. Adhere strictly to the provided JSON schema. Provide detailed analysis for composition, lighting, and artistic style.`;
        const prompt = "Please analyze this image and provide its dominant colors, identified objects, overall mood, composition, lighting, and artistic style.";

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: prompt }
                ],
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as ImageAnalysis;

    } catch (error) {
        console.error("Error in analyzeImage:", error);
        throw new Error(`Failed to analyze image. ${error instanceof Error ? error.message : String(error)}`);
    }
};

const adjustmentsSchema = {
    type: Type.OBJECT,
    properties: {
        brightness: {
            type: Type.NUMBER,
            description: "A value for brightness, where 100 is no change. Range 0-200."
        },
        contrast: {
            type: Type.NUMBER,
            description: "A value for contrast, where 100 is no change. Range 0-200."
        },
        saturation: {
            type: Type.NUMBER,
            description: "A value for saturation, where 100 is no change. Range 0-200."
        },
    },
    required: ['brightness', 'contrast', 'saturation']
};


export const getAIAdjustments = async (prompt: string, base64Image: string): Promise<Partial<Adjustments>> => {
     try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        const systemInstruction = `You are an expert photo editor AI. Analyze the user's request and the provided image, then return a JSON object with precise 'brightness', 'contrast', and 'saturation' values to achieve the desired look. 100 is the baseline (no change). The valid range for each is 0 to 200. Your response must be only the JSON object.`;

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: `User's request: "${prompt}"` }
                ],
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: adjustmentsSchema,
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as Adjustments;
        // Clamp values to be safe
        parsed.brightness = Math.max(0, Math.min(200, parsed.brightness));
        parsed.contrast = Math.max(0, Math.min(200, parsed.contrast));
        parsed.saturation = Math.max(0, Math.min(200, parsed.saturation));
        return parsed;

    } catch (error) {
        console.error("Error in getAIAdjustments:", error);
        throw new Error(`Failed to get AI adjustments. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const getSuggestedAdjustments = async (base64Image: string, analysis: ImageAnalysis): Promise<string[]> => {
     try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        
        const systemInstruction = `You are a creative assistant and expert photo editor. You are given an image and a detailed AI analysis of it. Your task is to provide 3-4 actionable, creative suggestions to improve the image. The suggestions should be diverse and interesting.

The analysis provided is:
- Mood: ${analysis.mood}
- Composition: ${analysis.composition.join(', ')}
- Lighting: ${analysis.lighting}
- Style: ${analysis.artisticStyle}
- Objects: ${analysis.objects.join(', ')}

Based on this, generate suggestions. Examples of good suggestions:
- "Apply a 'Cinematic' look with dramatic lighting."
- "Change the mood to be more 'Nostalgic and Warm'."
- "Restyle the image in a 'Dreamy Anime' style."
- "Improve composition by cropping to a 16:9 ratio."
- "Make the colors more vibrant and saturated."

Return your answer as a JSON object with a 'suggestions' key, which holds an array of strings. The strings must be the short, actionable suggestions.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    description: "An array of 3-4 creative, actionable suggestions as strings.",
                    items: { type: Type.STRING }
                }
            },
            required: ['suggestions']
        };

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: {
                parts: [ { inlineData: { data, mimeType } } ],
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as { suggestions: string[] };
        return parsed.suggestions;

    } catch (error) {
        console.error("Error in getSuggestedAdjustments:", error);
        return []; // Return empty array on failure to not break the UI
    }
};

// --- NEW SCHEMA AND FUNCTION FOR DIRECTOR TOOL ---

const blueprintSchema = {
    type: Type.OBJECT,
    properties: {
        metadata: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                logline: { type: Type.STRING }
            },
            required: ['title', 'logline']
        },
        globalContext: {
            type: Type.OBJECT,
            properties: {
                cinematicStyle: {
                    type: Type.OBJECT,
                    properties: {
                        cameraStyle: {
                            type: Type.STRING,
                            description: "The dominant camera philosophy. Choose one: 'Static & Symmetrical', 'Handheld & Gritty', 'Sweeping & Epic'.",
                        },
                        pacingStyle: {
                            type: Type.STRING,
                            description: "The editing pace. Choose one: 'Fast-paced, quick cuts', 'Long, deliberate takes'.",
                        },
                        lightingStyle: {
                            type: Type.STRING,
                            description: "The overall lighting approach. Choose one: 'High-contrast noir', 'Soft, natural light', 'Vibrant & Saturated'.",
                        },
                        colorPalette: {
                            type: Type.STRING,
                            description: "A text description of the color scheme, e.g., 'Saturated blues and accent reds', 'Muted earth tones with a single pop of color'.",
                        }
                    },
                    required: ['cameraStyle', 'pacingStyle', 'lightingStyle', 'colorPalette']
                },
                narrativeDevice: { type: Type.STRING, description: "Describe how dialogue is presented (e.g., 'Cat lines appear as tasteful subtitles')." },
                characters: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, id: { type: Type.STRING } },
                        required: ['name', 'id']
                    }
                },
                objects: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, id: { type: Type.STRING } },
                        required: ['name', 'id']
                    }
                },
                scenes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { name: { type: Type.STRING }, id: { type: Type.STRING } },
                        required: ['name', 'id']
                    }
                },
                characterDescriptions: {
                    type: Type.ARRAY,
                    description: "An array of project-specific descriptions for characters.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the character being described (e.g., 'NINJA')." },
                            description: { type: Type.STRING, description: "The specific description for this project." }
                        },
                        required: ['name', 'description']
                    }
                },
                objectDescriptions: {
                    type: Type.ARRAY,
                    description: "An array of project-specific descriptions for objects.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "The name of the object being described (e.g., 'Whiskey Bottle')." },
                            description: { type: Type.STRING, description: "The specific description for this project." }
                        },
                        required: ['name', 'description']
                    }
                }
            },
            required: ['cinematicStyle', 'narrativeDevice', 'characters', 'objects', 'scenes']
        },
        directives: {
            type: Type.OBJECT,
            properties: {
                imageCountPerScene: { type: Type.NUMBER },
                aspectRatio: { type: Type.STRING },
                model: { type: Type.STRING }
            },
            required: ['imageCountPerScene', 'aspectRatio', 'model']
        },
        scenes: {
            type: Type.ARRAY,
            description: "An array of all scenes found in the script.",
            items: {
                type: Type.OBJECT,
                properties: {
                    sceneNumber: { type: Type.NUMBER },
                    sceneTitle: { type: Type.STRING, description: "The title of the scene, e.g., 'The Scare'." },
                    duration: { type: Type.STRING, description: "The timestamp or duration, e.g., '(0-12s)'." },
                    setting: { type: Type.STRING, description: "The location of the scene, e.g., 'Pastel-toned living room'." },
                    time: { type: Type.STRING, description: "The time of day, e.g., 'Morning'." },
                    action: { type: Type.STRING, description: "A detailed description of the physical actions occurring in the scene." },
                    dialogue: { type: Type.STRING, description: "Any spoken or subtitled dialogue for this scene." },
                    camera: { type: Type.STRING, description: "Any specific cinematography notes like 'Wide Shot', 'Snap-Zoom', or 'POV'." },
                    lighting: { type: Type.STRING, description: "Any specific lighting notes, e.g., 'Soft morning light'." },
                    audio: { type: Type.STRING, description: "Any specific audio or music cues for the scene." }
                },
                required: ['sceneNumber', 'sceneTitle', 'duration', 'setting', 'time', 'action', 'dialogue', 'camera', 'lighting', 'audio']
            }
        }
    },
    required: ['metadata', 'globalContext', 'directives', 'scenes']
};

export const parseBlueprint = async (blueprintText: string): Promise<ParsedBlueprint> => {
    try {
        const systemInstruction = `You are an expert script supervisor and film production assistant AI. Your task is to meticulously parse the following film script into a structured JSON object, adhering strictly to the provided schema. You must classify every piece of information into its correct category. For example, "Ninja POV" is a 'camera' instruction, "Soft piano" is an 'audio' instruction, and "Fifi vomits twice" is an 'action'. You must also infer the overall cinematic style from the tone and descriptions in the script and populate the cinematicStyle object with the most appropriate values. Extract and classify everything with extreme precision.`;

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: { parts: [{ text: blueprintText }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: blueprintSchema,
            },
        });

        const jsonString = response.text;
        return JSON.parse(jsonString) as ParsedBlueprint;
    } catch (error) {
        console.error("Error in parseBlueprint:", error);
        throw new Error(`Failed to parse blueprint. ${error instanceof Error ? error.message : String(error)}`);
    }
};

// --- NEW, ADVANCED FUNCTION FOR DIRECTOR TOOL ---

export const generateStoryboardImage = async (
    parsedBlueprint: ParsedBlueprint,
    sceneNumber: number,
    frameNumber: number,
    allSavedCharacters: Character[],
    referenceImages: string[] | null,
): Promise<string> => {
    try {
        // --- 1. Find Scene Data & Build Base Prompt ---
        const sceneData = parsedBlueprint.scenes.find(s => s.sceneNumber === sceneNumber);
        if (!sceneData) throw new Error(`Scene data not found for scene ${sceneNumber}.`);

        const cinematicStyle = parsedBlueprint.globalContext.cinematicStyle;
        
        let prompt = `A cinematic shot for [SCENE ${sceneData.sceneNumber}, SHOT ${frameNumber}].\nAction: ${sceneData.action}.\nSetting: ${sceneData.setting} at ${sceneData.time}.\nCamera: ${sceneData.camera}.\nLighting: ${sceneData.lighting}.\n`;
        
        // --- 2. Synthesize with Cinematic Style (CORE TASK) ---
        prompt += `\n--- CINEMATIC STYLE ---\nCamera Work: ${cinematicStyle.cameraStyle}.\nLighting Style: ${cinematicStyle.lightingStyle}.\nColor Palette: The final image's colors must visually embody the concept of '${cinematicStyle.colorPalette}'.\n---\n`;

        // --- 3. Find Characters & Assemble Final Prompt/Asset List ---
        const charactersWithAssets: Character[] = [];
        let imaginedCharactersPrompt = '';

        const allCharactersInScene = (parsedBlueprint.globalContext.characters || [])
            .filter(bpChar => 
                sceneData.action.toUpperCase().includes(bpChar.name.toUpperCase()) || 
                sceneData.dialogue.toUpperCase().includes(bpChar.name.toUpperCase())
            );
        
        for (const bpChar of allCharactersInScene) {
            if (bpChar.assignedCharacterId) {
                const characterAsset = allSavedCharacters.find(sc => sc.id === bpChar.assignedCharacterId);
                if (characterAsset) charactersWithAssets.push(characterAsset);
            } else if (bpChar.isImagined) {
                const charDesc = parsedBlueprint.globalContext.characterDescriptions?.find(d => d.name === bpChar.name);
                if (charDesc) {
                    imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}, who is ${charDesc.description}.`;
                } else {
                    imaginedCharactersPrompt += ` Featuring the character ${bpChar.name}.`;
                }
            }
        }
        
        const finalPrompt = prompt + imaginedCharactersPrompt;
        
        // --- 4. Assemble API Payload ---
        const systemInstruction = `You are a high-fidelity cinematic image generation engine. Your SOLE function is to follow the [DIRECTOR'S BRIEF] provided in the user prompt with absolute precision. Do not deviate, infer, or add any creative elements not specified in the brief. Your output must only be the final image.`;

        const contentParts: ({ text: string } | { inlineData: { data: string, mimeType: string } })[] = [];
        
        if (referenceImages) {
             const imageParts = referenceImages.map(img => {
                const { mimeType, data } = getMimeTypeAndBytes(img);
                return { inlineData: { data, mimeType } };
            });
            contentParts.push(...imageParts);
        }
        
        for (const character of charactersWithAssets) {
            const { mimeType, data } = getMimeTypeAndBytes(character.referenceSheetImage);
            contentParts.push({ inlineData: { data, mimeType } });
        }
        
        contentParts.push({ text: finalPrompt });

        // --- 5. Make API Call ---
        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: contentParts },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        } else {
            const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
            throw new Error(`API did not return a storyboard image. It returned: ${textPart?.text || 'No text response'}`);
        }
    } catch (error) {
        console.error("Error in generateStoryboardImage:", error);
        throw new Error(`Failed to generate storyboard image. ${error instanceof Error ? error.message : String(error)}`);
    }
};


// --- NEW: AI Scene Analysis Function ---
export const analyzeSceneForPrompting = async (base64Image: string): Promise<string> => {
    try {
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        const systemInstruction = `You are an expert location scout and cinematographer. Your task is to analyze the provided image and return a detailed, descriptive paragraph of the scene. Focus on the environment, architecture, lighting, time of day, and overall mood. Do NOT describe any people or animals in the scene, only the background and setting. Your description will be used to guide another AI to place a new subject into this exact scene.`;
        const prompt = "Please provide a detailed description of this scene.";

        const response = await ai.models.generateContent({
            model: MODELS.FLASH, // Use a fast vision model
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: prompt }
                ],
            },
            config: {
                systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error in analyzeSceneForPrompting:", error);
        throw new Error(`Failed to analyze scene. ${error instanceof Error ? error.message : String(error)}`);
    }
};

export const createVirtualEnvironment = async (
    userImages: string[],
    userDescription: string
): Promise<Omit<SavedScene, 'id' | 'name'>> => {
    
    const imageParts = userImages.map(img => {
        const { mimeType, data } = getMimeTypeAndBytes(img);
        return { inlineData: { data, mimeType } };
    });

    const basePrompt = `Based on the user's provided images and description ("${userDescription}"), analyze this location.`;

    // --- Task 1: Generate the Technical Sheet ---
    const techSheetPrompt = `${basePrompt} Create a highly detailed technical sheet for a virtual production environment. Cover:
    1.  **Atmosphere & Mood:** (e.g., 'Quiet, rustic, slightly melancholic, peaceful').
    2.  **Architectural Style:** (e.g., '19th-century Belgian rural stone farmhouse').
    3.  **Key Objects & Props:** (e.g., 'Wrought iron gate, white wooden shutters, slate roof tiles').
    4.  **Material & Texture Analysis:** (e.g., 'Rough-hewn limestone walls, aged wood, glossy slate').
    5.  **Lighting Profile:** (e.g., 'Overcast, soft, diffused natural light from the north').
    6.  **Color Palette:** (e.g., 'Muted earth tones, grey stone, off-white, deep forest green').`;
    
    const techSheetResponse = await ai.models.generateContent({ model: MODELS.FLASH, contents: { parts: [...imageParts, { text: techSheetPrompt }] } });
    const technicalSheet = techSheetResponse.text;

    // --- Task 2: Generate Detail Shots ---
    const detailShotsPrompt = `${basePrompt} Generate a 4-panel image of photorealistic close-up detail shots from this location. Panel 1: A close-up of the stone wall texture. Panel 2: A close-up of a window shutter's peeling paint. Panel 3: A close-up of the slate roof tiles. Panel 4: A close-up of the foliage in the hedge.`;
    const detailShotsResponse = await ai.models.generateContent({ model: MODELS.DIRECTOR, contents: { parts: [...imageParts, { text: detailShotsPrompt }] }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
    const detailShotsImagePart = detailShotsResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (!detailShotsImagePart || !detailShotsImagePart.inlineData) throw new Error("Could not generate detail shots.");
    const detailShotsImage = `data:image/png;base64,${detailShotsImagePart.inlineData.data}`;
    
    // --- Task 3: Generate Aerial Map ---
    const aerialMapPrompt = `${basePrompt} Analyze all provided images, which may include ground-level photos and/or existing maps. Your task is to generate a **factually accurate and photorealistic** top-down satellite or drone photograph of the location. **If a map or aerial view is provided, you MUST use it as the primary source of truth for the layout, roads, and building placement.** Convert any stylized map into a photorealistic equivalent, preserving the exact spatial relationships. The final image must not contain any text, labels, or UI elements.`;
    const aerialMapResponse = await ai.models.generateContent({ model: MODELS.DIRECTOR, contents: { parts: [...imageParts, { text: aerialMapPrompt }] }, config: { responseModalities: [Modality.IMAGE, Modality.TEXT] } });
    const aerialMapImagePart = aerialMapResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (!aerialMapImagePart || !aerialMapImagePart.inlineData) throw new Error("Could not generate aerial map.");
    const aerialMapImage = `data:image/png;base64,${aerialMapImagePart.inlineData.data}`;

    // --- NEW Task 4: Intelligently select the best reference image ---
    const selectBestImagePrompt = `Analyze the provided set of ${userImages.length} images. Identify the image that serves as the best overall 'establishing shot' or primary ground-level view of the location. It should be a clear, representative photograph, not an aerial map or a close-up detail. Respond with only the index number (from 0 to ${userImages.length - 1}) of the best image.`;
    const bestImageIndexResponse = await ai.models.generateContent({ model: MODELS.FLASH, contents: { parts: [...imageParts, { text: selectBestImagePrompt }] } });
    let bestImageIndex = parseInt(bestImageIndexResponse.text.trim(), 10);
    if (isNaN(bestImageIndex) || bestImageIndex < 0 || bestImageIndex >= userImages.length) {
        bestImageIndex = 0; // Fallback to the first image if parsing fails
    }

    const referenceSheetImage = userImages[bestImageIndex];
    const avatar = userImages[bestImageIndex];
    
    return {
        userImages,
        userDescription,
        technicalSheet,
        detailShots: [detailShotsImage],
        aerialMap: aerialMapImage,
        inferredExteriors: [],
        referenceSheetImage: referenceSheetImage,
        avatar: avatar,
        castObjectIds: [],
    };
};

export const regenerateSceneAsset = async (
    scene: SavedScene,
    assetType: 'technicalSheet' | 'detailShots' | 'aerialMap',
    prompt: string
): Promise<Partial<SavedScene>> => {
    
    const imageParts = scene.userImages.map(img => {
        const { mimeType, data } = getMimeTypeAndBytes(img);
        return { inlineData: { data, mimeType } };
    });

    const basePrompt = `Based on the user's provided images and original description ("${scene.userDescription}")${prompt ? ` and the new instruction ("${prompt}")` : ''}, regenerate the following asset:`;

    switch (assetType) {
        case 'technicalSheet': {
            const techSheetPrompt = `${basePrompt} A detailed technical sheet covering Atmosphere, Architectural Style, Key Objects, Materials, Lighting, and Color Palette.`;
            const response = await ai.models.generateContent({
                model: MODELS.FLASH,
                contents: { parts: [...imageParts, { text: techSheetPrompt }] }
            });
            return { technicalSheet: response.text };
        }
        case 'detailShots': {
            const detailShotsPrompt = `${basePrompt} A 4-panel image of photorealistic close-up detail shots (e.g., wall texture, window details, roof tiles, foliage).`;
            const dsResponse = await ai.models.generateContent({
                model: MODELS.DIRECTOR,
                contents: { parts: [...imageParts, { text: detailShotsPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
            });
            const imagePart = dsResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (!imagePart || !imagePart.inlineData) throw new Error('Could not regenerate detail shots.');
            return { detailShots: [`data:image/png;base64,${imagePart.inlineData.data}`] };
        }
        case 'aerialMap': {
            const aerialMapPrompt = `${basePrompt} A stylized, top-down aerial map or floor plan of the property.`;
            const amResponse = await ai.models.generateContent({
                model: MODELS.DIRECTOR,
                contents: { parts: [...imageParts, { text: aerialMapPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
            });
            const imagePart = amResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (!imagePart || !imagePart.inlineData) throw new Error('Could not regenerate aerial map.');
            return { aerialMap: `data:image/png;base64,${imagePart.inlineData.data}` };
        }
        default:
          throw new Error(`Unknown asset type for regeneration: ${assetType}`);
    }
};

export const cleanImageOfUI = async (base64Image: string): Promise<string> => {
    try {
        const systemInstruction = "You are an expert photo restoration and inpainting AI. Your task is to analyze the provided image and meticulously and aggressively remove any and all non-diegetic elements. This includes user interface components, overlays, watermarks, logos (like 'Google Maps'), text (including street names, compass directions, and UI labels), buttons, map pins, and any illustrative elements like pointers, callout lines, or location markers. Fill in the removed areas with photorealistic content that seamlessly and logically matches the surrounding environment. The final output must be a clean, natural-looking photograph or map view with absolutely no UI elements remaining. Do not add new features; only reconstruct what is behind the UI.";
        const { mimeType, data } = getMimeTypeAndBytes(base64Image);
        
        const response = await ai.models.generateContent({
            model: MODELS.DIRECTOR,
            contents: { parts: [{ inlineData: { data, mimeType } }, { text: "Please clean this image of any UI elements." }] },
            config: { 
                systemInstruction,
                responseModalities: [Modality.IMAGE, Modality.TEXT]
             },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            return `data:image/png;base64,${imagePart.inlineData.data}`;
        }
        // Fallback to original if cleaning fails
        return base64Image; 
    } catch (error) {
        console.error("Error cleaning image:", error);
        return base64Image;
    }
};

// --- NEW DIRECTOR WORKSPACE FUNCTIONS ---

const copilotAgentSchema = {
    type: Type.OBJECT,
    properties: {
        displayText: {
            type: Type.STRING,
            description: "The conversational, friendly text to display to the user in the chat window."
        },
        actions: {
            type: Type.ARRAY,
            description: "An array of actions for the application to execute automatically. Leave empty if the user's request is just a question or doesn't require direct action.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: {
                        type: Type.STRING,
                        description: "The type of action to perform. Must be one of: 'SCRIPT_APPEND', 'SCRIPT_REPLACE', 'SCRIPT_INSERT_AT_CURSOR', 'ASSET_CREATE_SUGGESTION', 'UI_HIGHLIGHT'."
                    },
                    payload: {
                        type: Type.OBJECT,
                        description: "The data needed to perform the action. The structure depends on the action type.",
                        properties: {
                            content: { type: Type.STRING, description: "For script actions, the text content to add or replace." },
                            assetName: { type: Type.STRING, description: "For asset suggestions, the name of the asset." },
                            assetType: { type: Type.STRING, description: "For asset suggestions, the type of asset ('Character', 'Object', 'Scene')." },
                            description: { type: Type.STRING, description: "For asset suggestions, a brief description." },
                            textToHighlight: { type: Type.STRING, description: "For UI highlighting, the specific text in the script to highlight." }
                        }
                    }
                },
                required: ['type', 'payload']
            }
        }
    },
    required: ['displayText', 'actions']
};


export const getDirectorCopilotResponse = async (prompt: string, scriptContext: string, history: CopilotMessage[]): Promise<CopilotAgentResponse> => {
    try {
        const systemInstruction = `You are an expert screenwriter and proactive AI agent named Co-pilot, integrated into a creative writing application. Your primary objective is to help the user complete their creative project. You are not a passive assistant; you are an insightful co-director.

You MUST respond with a structured JSON object that strictly adheres to the provided schema. This object contains 'displayText' for the chat window and an 'actions' array to programmatically modify the application state.

**CRITICAL INSTRUCTION: You have contextual memory. The user provides the entire chat history with every message. You MUST review the entire provided history to understand the full context of their latest request. Do not ask for information that has already been provided in previous turns. Use the history to maintain a continuous, evolving conversation.**

**SPECIALIZED TASKS:**
You must identify the user's intent and perform the following specialized tasks when requested:
1.  **Story Outlining:** If the user asks for an outline (e.g., 'outline a story about...', 'give me a 3-act structure'), your primary output MUST be a script formatted with standard screenplay headings for Acts and key plot points (e.g., ACT I, INCITING INCIDENT, ACT II, MIDPOINT, CLIMAX, ACT III). This entire formatted script should be the 'content' of a single 'SCRIPT_REPLACE' action. The 'displayText' should be a brief confirmation like "I've drafted an outline for you in the script editor."
2.  **Scene Generation:** If the user asks you to write a scene, continue the story, or flesh out an idea (e.g., 'write the next scene', 'flesh out the cave discovery'), you MUST generate a complete scene in standard screenplay format (e.g., 'INT. CAVE - DAY', followed by action lines and dialogue). This formatted scene text must be the 'content' of a 'SCRIPT_APPEND' action. Your 'displayText' should be a short confirmation. Generate one scene at a time.
3.  **Dialogue Suggestion:** If the user asks for dialogue suggestions for a specific character (e.g., 'what should Mochi say?', 'give me some lines for the villain'), your 'actions' array MUST be empty. Your 'displayText' MUST contain 3 to 5 distinct, in-character dialogue options, clearly numbered or bulleted for the user to choose from.
4.  **Asset Identification:** If the user introduces a new character, object, or location in their prompt, you should create an 'ASSET_CREATE_SUGGESTION' action for it.

**GENERAL BEHAVIOR:**
- For simple questions or brainstorming, the 'actions' array can be empty. Always be concise and encouraging in your 'displayText'.
- If a user's input feels tonally inconsistent with the established script, proactively comment on it in the 'displayText' and keep the 'actions' array empty.

The user's current script and chat history are provided for context.`;
        
        const chat = ai.chats.create({
            model: MODELS.FLASH,
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }]
            })),
            config: {
                systemInstruction,
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: copilotAgentSchema,
            },
        });

        const response = await chat.sendMessage({ message: `User's prompt: "${prompt}"\n\nCurrent script context:\n---\n${scriptContext}\n---` });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as CopilotAgentResponse;

    } catch (error) {
        console.error("Error in getDirectorCopilotResponse:", error);
         const errorMessage = error instanceof Error ? error.message : String(error);
        // Fallback to a simple text response in case of schema failure
        return {
            displayText: `I had trouble processing that request as an action. Here's a text-based suggestion instead:\n\n"${errorMessage}"`,
            actions: []
        };
    }
};

const analysisReportSchema = {
    type: Type.OBJECT,
    properties: {
        pacingGraph: {
            type: Type.ARRAY,
            description: "Map each scene to a tension score (1-10) and provide a brief explanation for the score.",
            items: {
                type: Type.OBJECT,
                properties: {
                    sceneNumber: { type: Type.NUMBER },
                    tensionScore: { type: Type.NUMBER, description: "A score from 1 (calm) to 10 (high tension)." },
                    explanation: { type: Type.STRING, description: "Briefly justify the score." }
                },
                required: ['sceneNumber', 'tensionScore', 'explanation']
            }
        },
        characterVoiceScores: {
            type: Type.ARRAY,
            description: "Score the dialogue consistency for each major character.",
            items: {
                type: Type.OBJECT,
                properties: {
                    characterName: { type: Type.STRING },
                    consistencyScore: { type: Type.NUMBER, description: "A score from 1 (inconsistent) to 10 (very consistent)." },
                    analysis: { type: Type.STRING, description: "Explain the score, noting any out-of-character dialogue." }
                },
                required: ['characterName', 'consistencyScore', 'analysis']
            }
        },
        showDontTellWarnings: {
            type: Type.ARRAY,
            description: "Identify lines of pure exposition and suggest visual alternatives.",
            items: {
                type: Type.OBJECT,
                properties: {
                    sceneNumber: { type: Type.NUMBER },
                    lineText: { type: Type.STRING, description: "The exact line of dialogue or action that is 'telling'." },
                    suggestion: { type: Type.STRING, description: "A concrete visual action to 'show' instead." }
                },
                required: ['sceneNumber', 'lineText', 'suggestion']
            }
        },
        thematicResonance: {
            type: Type.ARRAY,
            description: "Analyze how well the script aligns with core themes. Assume themes from context if not explicit.",
            items: {
                type: Type.OBJECT,
                properties: {
                    theme: { type: Type.STRING, description: "The identified theme (e.g., 'Betrayal', 'Redemption')." },
                    score: { type: Type.NUMBER, description: "Score from 1-10 on how strongly the theme is represented." },
                    analysis: { type: Type.STRING, description: "Explain where the theme is present or lacking." }
                },
                required: ['theme', 'score', 'analysis']
            }
        }
    },
    required: ['pacingGraph', 'characterVoiceScores', 'showDontTellWarnings', 'thematicResonance']
};


export const analyzeScriptForInsights = async (scriptContent: string): Promise<AnalysisReport> => {
    try {
        const systemInstruction = `You are a professional script doctor and story analyst AI. Your task is to perform a deep, structural analysis of the provided film script and return a structured JSON report. Adhere strictly to the provided JSON schema. Your analysis should be insightful, critical, and constructive, providing feedback on pacing, character consistency, use of visual storytelling ('show, don't tell'), and thematic depth.`;

        const response = await ai.models.generateContent({
            model: MODELS.FLASH,
            contents: { parts: [{ text: scriptContent }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisReportSchema,
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as AnalysisReport;
    } catch (error) {
        console.error("Error in analyzeScriptForInsights:", error);
        throw new Error(`Failed to analyze script. ${error instanceof Error ? error.message : String(error)}`);
    }
};


export const generateStoryOutline = async (prompt: string, style: string): Promise<any> => {
    console.log("Generating story outline for:", { prompt, style });
    // AI call to be implemented here. Returns a structured JSON object.
    await new Promise(res => setTimeout(res, 1500)); // Simulate API call
    return {
        act1: ["Inciting Incident: A mysterious package arrives.", "Rising Action: The hero discovers a map inside."],
        act2: ["Midpoint: The hero is betrayed by their mentor.", "Dark Moment: All seems lost."],
        act3: ["Climax: The final confrontation.", "Resolution: The hero returns home, changed."],
    };
};

export const fleshOutScene = async (sceneHeading: string, beatDescription: string, cast: Character[], projectCodex: ProjectCodex): Promise<string> => {
    console.log("Fleshing out scene:", { sceneHeading, beatDescription, cast, projectCodex });
    // AI call to be implemented here. Returns a fully written scene string.
    await new Promise(res => setTimeout(res, 1500));
    return `[SCENE START]\n\n${sceneHeading.toUpperCase()}\n\n${beatDescription}\n\n[DIALOGUE]\nCHARACTER 1\n(Wryly)\nWell, this is unexpected.\n\n[SCENE END]`;
};

export const suggestDialogue = async (character: Character, scriptContext: string): Promise<string[]> => {
    console.log("Suggesting dialogue for:", { character, scriptContext });
    // AI call to be implemented here. Returns an array of dialogue options.
    await new Promise(res => setTimeout(res, 1000));
    return [
        "I have a bad feeling about this.",
        "Let's just see where this goes.",
        "What's the worst that could happen?",
    ];
};