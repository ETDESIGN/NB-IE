





import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { EFFECTS } from '../../data/generationData';
import { FilterButton, ModalSection, ItemCard } from './common';

interface EffectsModalProps {
    onClose: () => void;
    onSelect: (effectName: string) => void;
    selectedTags: Set<string>;
}

type Category = 'All' | 'Color' | 'Framing' | 'Lighting' | 'Action' | 'Mood';

const CATEGORIES: Category[] = ['All', 'Color', 'Framing', 'Lighting'];

type Effect = (typeof EFFECTS)[number];

export const EffectsModal: React.FC<EffectsModalProps> = ({ onClose, onSelect, selectedTags }) => {
    const [activeCategory, setActiveCategory] = useState<Category>('All');

    const sections = useMemo(() => {
        const effectsToDisplay = activeCategory === 'All'
            ? EFFECTS
            : EFFECTS.filter(e => e.section === activeCategory || e.category === activeCategory);
        
        return effectsToDisplay.reduce((acc: Record<string, Effect[]>, effect) => {
            const section = effect.section;
            if (!acc[section]) {
                acc[section] = [];
            }
            acc[section].push(effect);
            return acc;
        }, {});

    }, [activeCategory]);
    
    return (
        <Modal title="Effects" onClose={onClose}>
            <div className="flex items-center space-x-2 mb-6">
                {CATEGORIES.map(cat => (
                     <FilterButton 
                        key={cat}
                        label={cat}
                        isActive={activeCategory === cat}
                        onClick={() => setActiveCategory(cat)}
                    />
                ))}
            </div>
            
            {Object.keys(sections).map((sectionName) => {
                const effects = sections[sectionName];
                return (
                 <ModalSection key={sectionName} title={sectionName}>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {effects.map(effect => {
                            const isSelected = selectedTags.has(effect.name);
                            return (
                               <ItemCard 
                                    key={effect.name}
                                    name={effect.name}
                                    isSelected={isSelected}
                                    onSelect={() => onSelect(effect.name)}
                                >
                                    <img 
                                        src={effect.image} 
                                        alt={effect.name}
                                        className={`w-full aspect-square object-cover bg-surface-light rounded-lg border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
                                        loading="lazy"
                                    />
                               </ItemCard>
                            )
                        })}
                    </div>
                 </ModalSection>
                );
            })}

        </Modal>
    );
};