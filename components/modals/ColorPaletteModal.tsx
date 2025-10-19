





import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { COLOR_PALETTES } from '../../data/generationData';
import { FilterButton, ModalSection, NewItemButton } from './common';
import type { CustomPalette } from '../../types';

interface ColorPaletteModalProps {
    onClose: () => void;
    onSelect: (paletteName: string) => void;
    selectedTags: Set<string>;
    customPalettes: CustomPalette[];
    onAddPalette: (palettes: CustomPalette[]) => void;
}

const CATEGORIES = ['All', 'Cold', 'Neon', 'Pastel', 'Vibrant', 'Warm'];

type Palette = (typeof COLOR_PALETTES)[number] | (CustomPalette & { category: string });

export const ColorPaletteModal: React.FC<ColorPaletteModalProps> = ({ onClose, onSelect, selectedTags, customPalettes, onAddPalette }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [mode, setMode] = useState<'list' | 'create'>('list');
    const [paletteName, setPaletteName] = useState('');
    const [colors, setColors] = useState(['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']);

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colors];
        newColors[index] = color;
        setColors(newColors);
    };

    const handleSavePalette = () => {
        if (!paletteName) return;
        const newPalette: CustomPalette = {
            id: `palette-${Date.now()}`,
            name: paletteName,
            colors: colors,
        };
        onAddPalette([...customPalettes, newPalette]);
        setMode('list');
        setPaletteName('');
        setColors(['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']);
    };
    
    const sections = useMemo(() => {
        const palettesToDisplay: Palette[] = activeCategory === 'All'
            ? [...COLOR_PALETTES, ...customPalettes.map(p => ({...p, category: 'Custom'}))]
            : (activeCategory === 'Custom' 
                ? customPalettes.map(p => ({...p, category: 'Custom'}))
                : COLOR_PALETTES.filter(p => p.category === activeCategory));
        
        return palettesToDisplay.reduce((acc: Record<string, Palette[]>, palette) => {
            const category = 'category' in palette ? palette.category : 'Custom';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(palette);
            return acc;
        }, {});

    }, [activeCategory, customPalettes]);
    
    const modalActions = <NewItemButton label="New palette" onClick={() => setMode('create')} />;

    if (mode === 'create') {
        return (
            <Modal title="Create New Palette" onClose={onClose}>
                 <div className="flex flex-col h-full max-w-lg mx-auto">
                    <button onClick={() => setMode('list')} className="text-sm text-primary hover:underline self-start mb-4">{'< Back to selection'}</button>
                    <div className="flex-grow space-y-4 flex flex-col">
                        <label className="block text-sm font-medium text-text-dark">Palette Name</label>
                        <input type="text" placeholder="e.g., Sunset Vibes" value={paletteName} onChange={e => setPaletteName(e.target.value)}
                               className="w-full bg-surface-light border border-gray-600 rounded-lg p-2 focus:ring-primary focus:border-primary transition" />
                        <label className="block text-sm font-medium text-text-dark">Colors</label>
                        <div className="flex items-center justify-between bg-surface-light p-2 rounded-lg">
                            {colors.map((color, index) => (
                                <input
                                    key={index}
                                    type="color"
                                    value={color}
                                    onChange={e => handleColorChange(index, e.target.value)}
                                    className="w-16 h-16 border-none cursor-pointer bg-transparent"
                                    style={{'backgroundColor': color}}
                                />
                            ))}
                        </div>
                    </div>
                     <div className="pt-4 mt-auto">
                        <button onClick={handleSavePalette} disabled={!paletteName} className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                           Save Palette
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal title="Color palette" onClose={onClose} actions={modalActions}>
            <div className="flex items-center space-x-2 mb-6 flex-wrap gap-2">
                 {[...CATEGORIES, 'Custom'].map(cat => (
                     <FilterButton 
                        key={cat}
                        label={cat}
                        isActive={activeCategory === cat}
                        onClick={() => setActiveCategory(cat)}
                    />
                ))}
            </div>

            {Object.keys(sections).map((sectionName) => {
                const palettes = sections[sectionName];
                return (
                <ModalSection key={sectionName} title={sectionName}>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-4 gap-y-6">
                        {palettes.map(palette => {
                            const tagName = `palette:${palette.name}`;
                            const isSelected = selectedTags.has(tagName);
                            return (
                                <div key={palette.name} className="text-center group cursor-pointer" onClick={() => onSelect(tagName)}>
                                    <div className={`flex h-12 w-full rounded-md overflow-hidden border-2 transition-all duration-200 ${isSelected ? 'border-primary scale-105' : 'border-transparent group-hover:scale-105'}`}>
                                        {palette.colors.map((color: string, index: number) => (
                                            <div key={index} style={{ backgroundColor: color }} className="h-full w-full" />
                                        ))}
                                    </div>
                                    <p className={`mt-2 text-xs transition-colors ${isSelected ? 'text-text-light font-semibold' : 'text-text-dark'}`}>{palette.name}</p>
                                </div>
                            );
                        })}
                    </div>
                </ModalSection>
            )})}
        </Modal>
    );
};