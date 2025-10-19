import type { Character } from '../types';

// NOTE: Using a simple 1x1 pixel transparent PNG as a placeholder for base64 image data to keep file size small.
const placeholderBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export const featuredCharacters: Character[] = [
    {
        id: 'featured-char-1',
        name: 'Cosmo the Cat',
        description: 'A fluffy calico cat with one blue eye and one green eye. Has a small nick in its left ear. Very curious and adventurous.',
        referenceSheetImage: 'https://source.unsplash.com/512x512/?calico,cat,portrait',
        avatar: 'https://source.unsplash.com/512x512/?calico,cat,portrait',
    },
    {
        id: 'featured-char-2',
        name: 'Bolt the Robot',
        description: 'A small, friendly robot with a single glowing blue eye. Its body is made of polished chrome and it moves on a single wheel. It often carries a small plant in a pot.',
        referenceSheetImage: 'https://source.unsplash.com/512x512/?cute,robot',
        avatar: 'https://source.unsplash.com/512x512/?cute,robot',
    },
     {
        id: 'featured-char-3',
        name: 'Whisper the Fox',
        description: 'A mystical nine-tailed fox with fur that shifts colors like a sunset. Its eyes glow with a soft, ethereal light. Often seen with floating magical embers around it.',
        referenceSheetImage: 'https://source.unsplash.com/512x512/?fantasy,fox',
        avatar: 'https://source.unsplash.com/512x512/?fantasy,fox',
    }
];