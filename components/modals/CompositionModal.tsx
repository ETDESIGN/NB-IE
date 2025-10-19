





import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { COMPOSITIONS } from '../../data/generationData';
import { FilterButton, ModalSection, ItemCard } from './common';

interface CompositionModalProps {
    onClose: () => void;
    onSelect: (tagName: string) => void;
    selectedTags: Set<string>;
}

const CATEGORIES = ['All', 'Framing', 'Shot Type', 'Angle'];

type Composition = (typeof COMPOSITIONS)[number];

export const CompositionModal: React.FC<CompositionModalProps> = ({ onClose, onSelect, selectedTags }) => {
    const [activeCategory, setActiveCategory] = useState('All');

    const sections = useMemo(() => {
        const itemsToDisplay = activeCategory === 'All'
            ? COMPOSITIONS
            : COMPOSITIONS.filter(c => c.category === activeCategory);
        
        return itemsToDisplay.reduce((acc: Record<string, Composition[]>, item) => {
            const category = item.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

    }, [activeCategory]);

    return (
        <Modal title="Composition" onClose={onClose}>
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
                const items = sections[sectionName];
                return (
                <ModalSection key={sectionName} title={sectionName}>
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {items.map(item => {
                            const isSelected = selectedTags.has(item.name);
                            return (
                               <ItemCard 
                                    key={item.name}
                                    name={item.name}
                                    isSelected={isSelected}
                                    onSelect={() => onSelect(item.name)}
                                >
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className={`w-full aspect-square object-cover bg-surface-light rounded-lg border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
                                        loading="lazy"
                                    />
                               </ItemCard>
                            );
                        })}
                    </div>
                </ModalSection>
            )})}
        </Modal>
    );
};