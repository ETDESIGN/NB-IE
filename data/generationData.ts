import type { AspectRatio } from '../types';

export const STYLES = [
  { name: '#baroquebloom', image: 'https://source.unsplash.com/200x200/?baroque,painting,flowers' }, { name: '#analogstreet', image: 'https://source.unsplash.com/200x200/?street,photography,35mm' }, { name: '#indieposter', image: 'https://source.unsplash.com/200x200/?indie,music,poster' },
  { name: '#illustratedphoto', image: 'https://source.unsplash.com/200x200/?photo,illustration,mixed' }, { name: '#looselines', image: 'https://source.unsplash.com/200x200/?loose,line,drawing' }, { name: '#watercolortextures', image: 'https://source.unsplash.com/200x200/?watercolor,texture,abstract' },
  { name: '#pastelcartoon', image: 'https://source.unsplash.com/200x200/?pastel,cartoon,cute' }, { name: '#dreamyanime', image: 'https://source.unsplash.com/200x200/?dreamy,anime,scenery' }, { name: '#warmcozy', image: 'https://source.unsplash.com/200x200/?warm,cozy,interior' },
  { name: '#fauvistpainting', image: 'https://source.unsplash.com/200x200/?fauvism,painting,colorful' }, { name: '#grainyflat', image: 'https://source.unsplash.com/200x200/?grainy,flat,illustration' }, { name: '#boldflat', image: 'https://source.unsplash.com/200x200/?bold,flat,vector,art' },
  { name: '#childrensstorybook', image: 'https://source.unsplash.com/200x200/?children,storybook,illustration' }, { name: '#claytoon', image: 'https://source.unsplash.com/200x200/?claymation,cartoon,character' }, { name: '#dreamglass', image: 'https://source.unsplash.com/200x200/?glass,iridescent,dreamy' },
  { name: '#felted', image: 'https://source.unsplash.com/200x200/?felt,craft,animal' }, { name: '#qiam3d', image: 'https://source.unsplash.com/200x200/?3d,render,abstract' }, { name: '#minimalcharacters', image: 'https://source.unsplash.com/200x200/?minimalist,character,design' },
  { name: '#vinytoy', image: 'https://source.unsplash.com/200x200/?vinyl,toy,figurine' }, { name: '#inkwoven', image: 'https://source.unsplash.com/200x200/?ink,drawing,intricate' }, { name: '#blurredwash', image: 'https://source.unsplash.com/200x200/?blur,watercolor,abstract' },
  { name: '#wexrayon', image: 'https://source.unsplash.com/200x200/?crayon,drawing,texture' }, { name: '#risoprint', image: 'https://source.unsplash.com/200x200/?risograph,print,texture' }, { name: '#silentnoir', image: 'https://source.unsplash.com/200x200/?film,noir,detective' },
  { name: '#classicanime', image: 'https://source.unsplash.com/200x200/?90s,anime,style' }, { name: '#craftmotion', image: 'https://source.unsplash.com/200x200/?stop,motion,craft' }, { name: '#photo', image: 'https://source.unsplash.com/200x200/?photorealistic' },
  { name: '#avantproduct', image: 'https://source.unsplash.com/200x200/?avant,garde,product,design' }, { name: '#ultracloseup', image: 'https://source.unsplash.com/200x200/?macro,photography,texture' }, { name: '#vibrantfilm', image: 'https://source.unsplash.com/200x200/?vibrant,cinematic,film' },
  { name: '#fashionphoto', image: 'https://source.unsplash.com/200x200/?fashion,model,editorial' }, { name: '#symeditorial', image: 'https://source.unsplash.com/200x200/?editorial,magazine,style' }, { name: '#glitchcollage', image: 'https://source.unsplash.com/200x200/?glitch,art,collage' },
  { name: '#weirdfilm', image: 'https://source.unsplash.com/200x200/?surreal,film,weird' }, { name: '#editorialslow', image: 'https://source.unsplash.com/200x200/?slow,motion,editorial' }, { name: '#misterymist', image: 'https://source.unsplash.com/200x200/?mystery,misty,forest' },
  { name: '#concretenoir', image: 'https://source.unsplash.com/200x200/?brutalist,architecture,noir' }, { name: '#crossprocessed', image: 'https://source.unsplash.com/200x200/?cross,processed,photography' }, { name: '#pastelblur', image: 'https://source.unsplash.com/200x200/?pastel,blur,gradient' },
];

export const COMPOSITIONS = [
    { name: '#ruleofthirds', image: 'https://source.unsplash.com/200x200/?landscape,composition', category: 'Framing' }, { name: '#leadinglines', image: 'https://source.unsplash.com/200x200/?architecture,leading,lines', category: 'Framing' },
    { name: '#goldenratio', image: 'https://source.unsplash.com/200x200/?nature,fibonacci', category: 'Framing' }, { name: '#symmetry', image: 'https://source.unsplash.com/200x200/?symmetrical,architecture', category: 'Framing' },
    { name: '#closeup', image: 'https://source.unsplash.com/200x200/?close,up,portrait', category: 'Shot Type' }, { name: '#portrait', image: 'https://source.unsplash.com/200x200/?portrait,photography', category: 'Shot Type' },
    { name: '#mediumshot', image: 'https://source.unsplash.com/200x200/?medium,shot,person', category: 'Shot Type' }, { name: '#wideshot', image: 'https://source.unsplash.com/200x200/?wide,shot,landscape', category: 'Shot Type' },
    { name: '#lowangle', image: 'https://source.unsplash.com/200x200/?low,angle,shot,skyscraper', category: 'Angle' }, { name: '#highangle', image: 'https://source.unsplash.com/200x200/?high,angle,shot,city', category: 'Angle' },
    { name: '#aerialview', image: 'https://source.unsplash.com/200x200/?aerial,view,coastline', category: 'Angle' }, { name: '#dutchangle', image: 'https://source.unsplash.com/200x200/?dutch,angle,portrait', category: 'Angle' },
];

export const EFFECTS = [
    { name: '#romantic', image: 'https://source.unsplash.com/200x200/?romantic,couple', category: 'Mood', section: 'Mood' }, { name: '#ethereal', image: 'https://source.unsplash.com/200x200/?ethereal,fantasy,light', category: 'Mood', section: 'Mood' }, { name: '#chaotic', image: 'https://source.unsplash.com/200x200/?chaotic,abstract,art', category: 'Mood', section: 'Mood' },
    { name: '#zen', image: 'https://source.unsplash.com/200x200/?zen,garden,meditation', category: 'Mood', section: 'Mood' }, { name: '#tension', image: 'https://source.unsplash.com/200x200/?dramatic,tension,scene', category: 'Mood', section: 'Mood' }, { name: '#surreal', image: 'https://source.unsplash.com/200x200/?surreal,art,dali', category: 'Mood', section: 'Mood' },
    { name: '#playful', image: 'https://source.unsplash.com/200x200/?playful,fun,colors', category: 'Mood', section: 'Mood' }, { name: '#nostalgic', image: 'https://source.unsplash.com/200x200/?nostalgic,vintage,photo', category: 'Mood', section: 'Mood' }, { name: '#joy', image: 'https://source.unsplash.com/200x200/?joyful,person,laughing', category: 'Mood', section: 'Mood' },
    
    { name: '#walking', image: 'https://source.unsplash.com/200x200/?person,walking,street', category: 'Action', section: 'Action' }, { name: '#jumping', image: 'https://source.unsplash.com/200x200/?person,jumping,air', category: 'Action', section: 'Action' }, { name: '#fading', image: 'https://source.unsplash.com/200x200/?fading,light,abstract', category: 'Action', section: 'Action' },
    { name: '#glitching', image: 'https://source.unsplash.com/200x200/?glitch,art,digital', category: 'Action', section: 'Action' }, { name: '#melting', image: 'https://source.unsplash.com/200x200/?melting,ice,cream', category: 'Action', section: 'Action' }, { name: '#blurring', image: 'https://source.unsplash.com/200x200/?motion,blur,fast', category: 'Action', section: 'Action' },
    { name: '#flying', image: 'https://source.unsplash.com/200x200/?bird,flying,sky', category: 'Action', section: 'Action' }, { name: '#falling', image: 'https://source.unsplash.com/200x200/?autumn,leaf,falling', category: 'Action', section: 'Action' }, { name: '#spinning', image: 'https://source.unsplash.com/200x200/?spinning,carousel,light', category: 'Action', section: 'Action' },
    { name: '#morphing', image: 'https://source.unsplash.com/200x200/?liquid,abstract,morphing', category: 'Action', section: 'Action' }, { name: '#longexposure', image: 'https://source.unsplash.com/200x200/?long,exposure,traffic', category: 'Action', section: 'Action' }, { name: '#indoorlight', image: 'https://source.unsplash.com/200x200/?indoor,lighting,warm', category: 'Action', section: 'Action' },

    { name: '#earthy', image: 'https://source.unsplash.com/200x200/?earthy,tones,nature', category: 'Color', section: 'Color' }, { name: '#softhue', image: 'https://source.unsplash.com/200x200/?soft,hue,pastel', category: 'Color', section: 'Color' }, { name: '#b&w', image: 'https://source.unsplash.com/200x200/?black,and,white,portrait', category: 'Color', section: 'Color' },
    { name: '#sepia', image: 'https://source.unsplash.com/200x200/?sepia,tone,vintage', category: 'Color', section: 'Color' }, { name: '#goldglow', image: 'https://source.unsplash.com/200x200/?golden,glow,sunset', category: 'Color', section: 'Color' }, { name: '#duotone', image: 'https://source.unsplash.com/200x200/?duotone,gradient,portrait', category: 'Color', section: 'Color' },
    { name: '#vibrant', image: 'https://source.unsplash.com/200x200/?vibrant,colors,market', category: 'Color', section: 'Color' }, { name: '#icyblue', image: 'https://source.unsplash.com/200x200/?ice,blue,glacier', category: 'Color', section: 'Color' },
    
    { name: '#layered', image: 'https://source.unsplash.com/200x200/?layered,mountains,mist', category: 'Framing', section: 'Camera' }, { name: '#drone', image: 'https://source.unsplash.com/200x200/?drone,shot,forest', category: 'Framing', section: 'Camera' }, { name: '#360', image: 'https://source.unsplash.com/200x200/?360,photo,landscape', category: 'Framing', section: 'Camera' },
    { name: '#portrait', image: 'https://source.unsplash.com/200x200/?portrait,framing', category: 'Framing', section: 'Camera' }, { name: '#closeup', image: 'https://source.unsplash.com/200x200/?macro,flower', category: 'Framing', section: 'Camera' }, { name: '#lowangle', image: 'https://source.unsplash.com/200x200/?low,angle,building', category: 'Framing', section: 'Camera' },
    { name: '#midshot', image: 'https://source.unsplash.com/200x200/?person,mid,shot', category: 'Framing', section: 'Camera' }, { name: '#wideshot', image: 'https://source.unsplash.com/200x200/?wide,shot,scenery', category: 'Framing', section: 'Camera' }, { name: '#tiltshot', image: 'https://source.unsplash.com/200x200/?tilt,shift,miniature', category: 'Framing', section: 'Camera' },
    { name: '#aerial', image: 'https://source.unsplash.com/200x200/?aerial,cityscape', category: 'Framing', section: 'Camera' },
    
    { name: '#highflash', image: 'https://source.unsplash.com/200x200/?high,flash,fashion', category: 'Lighting', section: 'Lighting' }, { name: '#chiaroscuro', image: 'https://source.unsplash.com/200x200/?chiaroscuro,painting,dramatic', category: 'Lighting', section: 'Lighting' }, { name: '#backlight', image: 'https://source.unsplash.com/200x200/?backlit,portrait,sunset', category: 'Lighting', section: 'Lighting' },
    { name: '#iridescent', image: 'https://source.unsplash.com/200x200/?iridescent,holographic,texture', category: 'Lighting', section: 'Lighting' }, { name: '#dramatic', image: 'https://source.unsplash.com/200x200/?dramatic,lighting,storm', category: 'Lighting', section: 'Lighting' }, { name: '#goldenhour', image: 'https://source.unsplash.com/200x200/?golden,hour,landscape', category: 'Lighting', section: 'Lighting' },
];

export const OBJECTS = [
    { name: '#orangemoka', image: 'https://source.unsplash.com/200x200/?orange,moka,pot' }, { name: '#silvercream', image: 'https://source.unsplash.com/200x200/?silver,cosmetic,tube' }, { name: '#eclispecoffeet...', image: 'https://source.unsplash.com/200x200/?modern,coffee,table' },
    { name: '#nebulahandbag', image: 'https://source.unsplash.com/200x200/?purple,handbag,product' }, { name: '#redlipstick', image: 'https://source.unsplash.com/200x200/?red,lipstick,product' }, { name: '#notebook', image: 'https://source.unsplash.com/200x200/?pink,notebook' },
    { name: '#bluetoaster', image: 'https://source.unsplash.com/200x200/?blue,toaster,retro' }, { name: '#perfum', image: 'https://source.unsplash.com/200x200/?perfume,bottle' }, { name: '#serum', image: 'https://source.unsplash.com/200x200/?serum,dropper,bottle' },
    { name: '#redheels', image: 'https://source.unsplash.com/200x200/?red,high,heels' }, { name: '#teddybag', image: 'https://source.unsplash.com/200x200/?red,tote,bag' }, { name: '#lamp', image: 'https://source.unsplash.com/200x200/?modern,desk,lamp' },
    { name: '#smartwatch', image: 'https://source.unsplash.com/200x200/?smartwatch,product' }, { name: '#glassbottle', image: 'https://source.unsplash.com/200x200/?glass,water,bottle' }, { name: '#bottle', image: 'https://source.unsplash.com/200x200/?reusable,water,bottle' },
    { name: '#totebag', image: 'https://source.unsplash.com/200x200/?canvas,tote,bag' }, { name: '#leatherjacket', image: 'https://source.unsplash.com/200x200/?leather,jacket' }, { name: '#metalmug', image: 'https://source.unsplash.com/200x200/?white,enamel,mug' },
];

export const COLOR_PALETTES = [
    // Cold
    { name: 'glacier', colors: ['#D4E1EA', '#A1B6C5', '#F3D57C', '#3B5F76', '#EAF0F4'], category: 'Cold' },
    { name: 'blueandyellow', colors: ['#3A5FCD', '#F7C548', '#A2A2A2', '#FFFFFF', '#000000'], category: 'Cold' },
    { name: 'greenforest', colors: ['#4A663A', '#9EAD8A', '#E2E6D1', '#1D2A1C', '#D4C5A1'], category: 'Cold' },
    { name: 'frozenmist', colors: ['#A0B8C8', '#D3DFE6', '#F0F4F7', '#5E7A8C', '#C2D1DB'], category: 'Cold' },
    { name: 'icydepth', colors: ['#00A7B5', '#89D9E0', '#D6F2F4', '#006D77', '#E29578'], category: 'Cold' },
    { name: 'forestmist', colors: ['#6E8B80', '#A9C2BB', '#DCE5E2', '#3A5A40', '#EAE0D5'], category: 'Cold' },
    { name: 'polarecho', colors: ['#2E638E', '#8AB2D5', '#D6E4F0', '#1C3A5A', '#A2AEBB'], category: 'Cold' },
    { name: 'minty', colors: ['#99D98C', '#D9ED92', '#E9F5DB', '#76C893', '#B5E48C'], category: 'Cold' },
    { name: 'blueberry', colors: ['#4A5A95', '#A3B1D8', '#D9E0F3', '#2C3A73', '#7B88C4'], category: 'Cold' },
    { name: 'coldspring', colors: ['#39A7A6', '#87D0CF', '#D4EDEC', '#226A69', '#E5989B'], category: 'Cold' },
    { name: 'celestialice', colors: ['#5FC0CE', '#A8DDE4', '#E1F3F5', '#3A8F9B', '#C19EE0'], category: 'Cold' },
    { name: 'nordicdusk', colors: ['#3D5A80', '#98C1D9', '#E0FBFC', '#293241', '#EE6C4D'], category: 'Cold' },
    { name: 'deepsea', colors: ['#006B7F', '#00A8C5', '#87DDE9', '#003E4A', '#F7B538'], category: 'Cold' },
    { name: 'coolbreeze', colors: ['#3A7CA5', '#A1C4E1', '#D4E6F1', '#2C5D7D', '#FFFFFF'], category: 'Cold' },
    { name: 'mistwood', colors: ['#D8D8C0', '#BDBDA0', '#F1F1E4', '#9A9A80', '#7C7C60'], category: 'Cold' },
    { name: 'deepwaterlove', colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51'], category: 'Cold' },
    { name: 'evergreenhaze', colors: ['#A3B1A1', '#C7D1C5', '#E8EDE7', '#808F7E', '#606C5D'], category: 'Cold' },
    // Neon
    { name: 'electricdreams', colors: ['#F7F052', '#00F6FF', '#7122FA', '#FF00A8', '#2B2B2B'], category: 'Neon' },
    { name: 'neonpunch', colors: ['#FF0054', '#FF5400', '#FFBD00', '#00F0B5', '#00C2FF'], category: 'Neon' },
    { name: 'neonight', colors: ['#7000FF', '#FF00C8', '#00F0FF', '#FDF44B', '#232323'], category: 'Neon' },
    { name: 'candypink', colors: ['#FF69B4', '#FF89C4', '#FFA9D4', '#FFC9E4', '#FFE9F4'], category: 'Neon' },
    // Pastel
    { name: 'lavender', colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6', '#BA55D3'], category: 'Pastel' },
    { name: 'springbreeze', colors: ['#FFB6C1', '#FFC0CB', '#FFDAB9', '#E6E6FA', '#ADD8E6'], category: 'Pastel' },
    { name: 'cottoncandydreams', colors: ['#FFD1DC', '#FFF0F5', '#E0FFFF', '#B0E0E6', '#87CEEB'], category: 'Pastel' },
    { name: 'dreamysorbet', colors: ['#FFDAB9', '#FFE4B5', '#FFEFD5', '#FFFACD', '#FAFAD2'], category: 'Pastel' },
    { name: 'berrylemonade', colors: ['#FF6347', '#FF7F50', '#FFA07A', '#FFD700', '#FFFF00'], category: 'Pastel' },
    { name: 'softserenity', colors: ['#F5DEB3', '#FFE4C4', '#FFDAB9', '#EEE8AA', '#F0E68C'], category: 'Pastel' },
    { name: 'magnolia', colors: ['#F8F4FF', '#EAE0FF', '#DCD6FF', '#CEC8FF', '#C0B9FF'], category: 'Pastel' },
    { name: 'daisyseason', colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347'], category: 'Pastel' },
    { name: 'softrose', colors: ['#DDA0DD', '#DA70D6', '#C71585', '#DB7093', '#FF1493'], category: 'Pastel' },
    { name: 'moonlitpastels', colors: ['#ADD8E6', '#B0C4DE', '#B0E0E6', '#87CEEB', '#87CEFA'], category: 'Pastel' },
    { name: 'mochavet', colors: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887'], category: 'Pastel' },
    { name: 'eggshell', colors: ['#FAFAD2', '#FFFFE0', '#FFFFF0', '#F5F5DC', '#FFF8DC'], category: 'Pastel' },
    { name: 'greenhaze', colors: ['#2E8B57', '#3CB371', '#66CDAA', '#8FBC8F', '#98FB98'], category: 'Pastel' },
    { name: 'vanillarouge', colors: ['#FFF5EE', '#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF69B4'], category: 'Pastel' },
    { name: 'softserenity', colors: ['#F5DEB3', '#FFE4C4', '#FFDAB9', '#EEE8AA', '#F0E68C'], category: 'Pastel' },
    { name: 'arcticpastels', colors: ['#B0E0E6', '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF'], category: 'Pastel' },
    { name: 'olivedream', colors: ['#556B2F', '#6B8E23', '#808000', '#BDB76B', '#F0E68C'], category: 'Pastel' },
    // Vibrant
    { name: 'crayons', colors: ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA'], category: 'Vibrant' },
    { name: 'dopamine', colors: ['#FF1D58', '#F75990', '#FFF685', '#00DDFF', '#0049B7'], category: 'Vibrant' },
    { name: 'royaleclipse', colors: ['#4C2A85', '#7F3F98', '#E6A535', '#F2E8C9', '#86C5DA'], category: 'Vibrant' },
    { name: 'violeteclipse', colors: ['#B28DFF', '#C6A9FF', '#D9C5FF', '#EDDEFF', '#3F0071'], category: 'Vibrant' },
    { name: 'primaryenergy', colors: ['#0048BA', '#FFD500', '#FFFFFF', '#C30010', '#000000'], category: 'Vibrant' },
    { name: 'candys', colors: ['#D9F3F4', '#B6E6E8', '#A2DADD', '#80C8D1', '#FFFFFF'], category: 'Vibrant' },
    { name: 'bubblegumpop', colors: ['#FF007A', '#FA5B0F', '#F8D800', '#34EBE9', '#037ADC'], category: 'Vibrant' },
    { name: 'boldharmony', colors: ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'], category: 'Vibrant' },
    { name: 'citrusglow', colors: ['#F4A261', '#E76F51', '#2A9D8F', '#264653', '#E9C46A'], category: 'Vibrant' },
    { name: 'groovy', colors: ['#6D4C41', '#A1887F', '#D7CCC8', '#F5E1DA', '#FFAB91'], category: 'Vibrant' },
    { name: 'wildgrove', colors: ['#588157', '#3A5A40', '#344E41', '#A3B18A', '#DAD7CD'], category: 'Vibrant' },
    { name: 'redlove', colors: ['#FFFFFF', '#F0D9D5', '#D1A39D', '#9A6A64', '#3E2723'], category: 'Vibrant' },
    // Warm
    { name: 'warm', colors: ['#A0522D', '#CD853F', '#D2691E', '#DEB887', '#F4A460'], category: 'Warm' },
    { name: 'beachday', colors: ['#F4A261', '#E76F51', '#2A9D8F', '#264653', '#E9C46A'], category: 'Warm' },
    { name: 'peachsunset', colors: ['#FFDAB9', '#FFA07A', '#FF7F50', '#FF6347', '#FF4500'], category: 'Warm' },
    { name: 'goldenbordeaux', colors: ['#800000', '#A52A2A', '#CD5C5C', '#F08080', '#FFA07A'], category: 'Warm' },
    { name: 'desertdusk', colors: ['#D2691E', '#CD853F', '#A0522D', '#8B4513', '#6B4226'], category: 'Warm' },
    { name: 'coastalsunset', colors: ['#003F5C', '#2F4B7C', '#665191', '#A05195', '#D45087'], category: 'Warm' },
    { name: 'cinnamonsunset', colors: ['#9A6A64', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'], category: 'Warm' },
    { name: 'goldenspice', colors: ['#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63'], category: 'Warm' },
    { name: 'honey&wine', colors: ['#FFD700', '#FFA500', '#800000', '#A52A2A', '#CD5C5C'], category: 'Warm' },
    { name: 'smokysunset', colors: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548'], category: 'Warm' },
    { name: 'cherryspice', colors: ['#800000', '#A52A2A', '#CD5C5C', '#F08080', '#FFA07A'], category: 'Warm' },
    { name: 'velvetsunrise', colors: ['#DDA0DD', '#DA70D6', '#C71585', '#DB7093', '#FF1493'], category: 'Warm' },
    { name: 'duskmirage', colors: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548'], category: 'Warm' },
    { name: 'spicyheat', colors: ['#FF4500', '#FF6347', '#FF7F50', '#FFA07A', '#FFDAB9'], category: 'Warm' },
    { name: 'rusticcharm', colors: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#DEB887'], category: 'Warm' },
];

export const ASPECT_RATIOS_DETAILED: { value: AspectRatio, name: string, icon: 'square' | 'widescreen' | 'portrait' }[] = [
    { value: '1:1', name: 'Square', icon: 'square' },
    { value: '16:9', name: 'Widescreen', icon: 'widescreen' },
    { value: '9:16', name: 'Social story', icon: 'portrait' },
    { value: '2:3', name: 'Portrait', icon: 'portrait' },
    { value: '3:4', name: 'Traditional', icon: 'portrait' },
    { value: '1:2', name: 'Vertical', icon: 'portrait' },
    { value: '2:1', name: 'Horizontal', icon: 'widescreen' },
    { value: '4:5', name: 'Social post', icon: 'portrait' },
    { value: '3:2', name: 'Standard', icon: 'widescreen' },
    { value: '4:3', name: 'Classic', icon: 'widescreen' },
];