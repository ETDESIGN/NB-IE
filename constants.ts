import React from 'react';
// Fix: Import the new AspectRatio type for type safety.
import type { AspectRatio } from './types';

export const LoaderIcon: React.FC = () => (
    React.createElement('svg', { 
      className: "animate-spin h-12 w-12 text-primary",
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24"
    },
      React.createElement('circle', {
        className: "opacity-25",
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        strokeWidth: "4"
      }),
      React.createElement('path', {
        className: "opacity-75",
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      })
    )
);

export const PROMPT_SUGGESTIONS = [
  "A majestic lion in the savannah",
  "A futuristic cityscape at night with flying cars",
  "An enchanted forest with glowing mushrooms and fairy lights",
  "A tranquil beach with crystal clear water and a lone palm tree",
  "A steampunk robot meticulously painting a tiny portrait",
  "A dragon flying over a medieval castle during a thunderstorm",
  "A cozy library in a hobbit-hole, filled with ancient books",
  "An astronaut playing a guitar on the surface of Mars",
  "A secret garden hidden behind a stone wall, overgrown with roses",
  "A bustling Moroccan market at dusk, with colorful lanterns",
  "A serene Japanese zen garden with a koi pond",
  "A giant, friendly octopus serving tea to fish underwater",
  "A whimsical hot air balloon festival in Cappadocia",
  "A photorealistic portrait of a wise old owl wearing glasses",
  "A delicious-looking stack of pancakes dripping with syrup and berries",
  "A magical potion shop with glowing bottles on dusty shelves",
  "An epic fantasy battle between elves and orcs",
  "A cute red panda sleeping on a cherry blossom tree branch",
  "A surreal desert landscape with melting clocks, Dali-style",
  "A cyberpunk alleyway with neon signs reflected in puddles",
  "A vintage car driving on a coastal road during sunset",
  "A house made of candy and gingerbread in a snowy landscape",
  "A detailed macro shot of a snowflake",
  "A group of animals having a picnic in the woods",
  "A mysterious, ancient ruin discovered deep in the Amazon rainforest",
  "A lone lighthouse on a rocky cliff during a storm",
];

// Fix: Use the centralized AspectRatio type for the constant.
export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export const ADJUSTMENT_PRESETS = [
    { name: "Cinematic", prompt: "Apply a cinematic look with dramatic lighting and high contrast." },
    { name: "Vintage", prompt: "Give the image a vintage feel, with sepia tones and a faded look." },
    { name: "Vibrant", prompt: "Make the colors in the image more vibrant and saturated." },
    { name: "Cool", prompt: "Apply a cool color grade with a blueish tint for a calm mood." },
    { name: "Warm", prompt: "Apply a warm color grade with a yellowish tint for a cozy feeling." },
];

export const CONCEPTUAL_TAG_MAP: Record<string, string> = {
    '#ruleofthirds': 'composed using the rule of thirds',
    '#leadinglines': 'featuring strong leading lines',
    '#goldenratio': 'composed with the golden ratio',
    '#symmetry': 'with a symmetrical composition',
    '#closeup': 'a close-up shot',
    '#portrait': 'a portrait shot',
    '#mediumshot': 'a medium shot',
    '#wideshot': 'a wide shot',
    '#lowangle': 'shot from a low angle',
    '#highangle': 'shot from a high angle',
    '#aerialview': 'an aerial view',
    '#dutchangle': 'with a dutch angle',
    '#longexposure': 'using a long exposure effect',
    '#tiltshot': 'with a tilt-shift effect',
    '#backlight': 'with dramatic backlighting',
    '#goldenhour': 'during the golden hour',
    '#chiaroscuro': 'using chiaroscuro lighting',
};