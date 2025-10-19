import React, { useState, useMemo } from 'react';
import { Modal } from './Modal';
import { STYLES } from '../../data/generationData';
import { FilterButton, SearchBar, ItemCard, NewItemButton } from './common';
import type { CustomStyle } from '../../types';
import { LoaderIcon } from '../../constants';


interface StyleModalProps {
    onClose: () => void;
    onSelect: (styleName: string) => void;
    selectedTags: Set<string>;
    customStyles: CustomStyle[];
    onAddStyle: (styles: CustomStyle[]) => void;
}

export const StyleModal: React.FC<StyleModalProps> = ({ onClose, onSelect, selectedTags, customStyles, onAddStyle }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [mode, setMode] = useState<'list' | 'create'>('list');
    const [styleName, setStyleName] = useState('');
    const [styleDescription, setStyleDescription] = useState('');

    const handleSaveStyle = () => {
        if (!styleName || !styleDescription) return;
        const newStyle: CustomStyle = {
            id: `style-${Date.now()}`,
            name: `#${styleName.replace(/\s+/g, '')}`,
            description: styleDescription,
        };
        onAddStyle([...customStyles, newStyle]);
        setMode('list');
        setStyleName('');
        setStyleDescription('');
        setActiveTab('My Styles');
    };

    const filteredStyles = useMemo(() => {
        return STYLES.filter(style => 
            style.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);
    
    const filteredCustomStyles = useMemo(() => {
        return customStyles.filter(style =>
            style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            style.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, customStyles]);

    const displayStyles = activeTab === 'All' ? filteredStyles : filteredCustomStyles;

    const modalActions = (
        <div className="flex items-center space-x-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by style" />
            <NewItemButton label="New style" onClick={() => setMode('create')} />
        </div>
    );

    if (mode === 'create') {
        return (
            <Modal title="Create New Style" onClose={onClose}>
                <div className="flex flex-col h-full max-w-lg mx-auto">
                    <button onClick={() => setMode('list')} className="text-sm text-primary hover:underline self-start mb-4">{'< Back to selection'}</button>
                    <div className="flex-grow space-y-4 flex flex-col">
                        <label className="block text-sm font-medium text-text-dark">Style Name</label>
                        <input type="text" placeholder="#MyVibe" value={styleName} onChange={e => setStyleName(e.target.value)}
                               className="w-full bg-surface-light border border-gray-600 rounded-lg p-2 focus:ring-primary focus:border-primary transition" />
                        <label className="block text-sm font-medium text-text-dark">Style Description (Prompt)</label>
                        <textarea
                            placeholder="A dark, moody, cinematic style with high contrast and blue tones..."
                            value={styleDescription}
                            onChange={e => setStyleDescription(e.target.value)}
                            className="w-full h-32 bg-surface-light border border-gray-600 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                     <div className="pt-4 mt-auto">
                        <button onClick={handleSaveStyle} disabled={!styleName || !styleDescription} className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                           Save Style
                        </button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal title="Style" onClose={onClose} actions={modalActions}>
            <div className="flex items-center space-x-2 mb-6">
                <FilterButton label="All" isActive={activeTab === 'All'} onClick={() => setActiveTab('All')} isTab />
                <FilterButton label="My Styles" isActive={activeTab === 'My Styles'} onClick={() => setActiveTab('My Styles')} isTab />
            </div>

             <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {displayStyles.map(style => {
                    const isSelected = selectedTags.has(style.name);
                    return (
                    <ItemCard 
                        key={style.name}
                        name={style.name}
                        isSelected={isSelected}
                        onSelect={() => onSelect(style.name)}
                    >
                        <div 
                            className={`w-full aspect-square bg-surface-light rounded-lg border-2 flex items-center justify-center p-2 text-center ${isSelected ? 'border-primary' : 'border-transparent'}`}
                        >
                           { 'image' in style ? 
                                <img src={style.image} alt={style.name} className="w-full h-full object-cover" loading="lazy"/> : 
                                <span className="text-xs text-text-dark">{style.description}</span>
                            }
                        </div>
                    </ItemCard>
                )})}
            </div>

            {activeTab === 'My Styles' && filteredCustomStyles.length === 0 && (
                <div className="text-center text-text-dark py-16">
                    You haven't created any styles yet.
                </div>
            )}
        </Modal>
    );
};
