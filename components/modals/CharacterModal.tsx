import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { FilterButton, SearchBar, NewItemButton, ItemCard } from './common';
import type { Character } from '../../types';
import { LoaderIcon } from '../../constants';
import { featuredCharacters } from '../../data/featuredCharacters';

interface CharacterModalProps {
    onClose: () => void;
    savedCharacters: Character[];
    selectedCharacter: Character | null;
    onSelectCharacter: (character: Character | null) => void;
    onSelectTag: (tagName: string) => void;
    onDeleteCharacter: (id: string) => void;
    // FIX: Add optional `description` parameter to align with `handleCreateCharacter` function signature.
    onCreateCharacter: (images: string[], name: string, description?: string) => Promise<Character>;
    onUpdateCharacter?: (character: Character) => void;
    characterToEdit?: Character | null;
    characterPrompt: string;
    onCharacterPromptChange: (prompt: string) => void;
    onGenerateWithCharacter: () => void;
    isLoading: boolean;
    mode?: "use" | "create" | "resolution" | "edit";
    assetNameForResolution?: string;
    initialName?: string;
    initialDescription?: string;
}

const PanelButton: React.FC<{ onClick: () => void; children: React.ReactNode; primary?: boolean; disabled?: boolean; }> = ({ onClick, children, primary, disabled }) => (
    <button onClick={onClick} disabled={disabled}
        className={`w-full text-center p-3 rounded-lg transition-colors duration-200 font-semibold ${primary ? 'bg-primary text-white hover:bg-primary-hover' : 'bg-surface-light text-text-light hover:bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
    </button>
);


export const CharacterModal: React.FC<CharacterModalProps> = (props) => {
    const [activeTab, setActiveTab] = useState('My Characters');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'use' | 'create' | 'edit'>(props.mode === 'create' ? 'create' : props.mode === 'edit' ? 'edit' : 'use');
    const [localSelectedCharacter, setLocalSelectedCharacter] = useState<Character | null>(null);

    // State for creating/editing a character
    const [characterName, setCharacterName] = useState(props.initialName || '');
    const [characterDescription, setCharacterDescription] = useState(props.initialDescription || '');
    const [characterImages, setCharacterImages] = useState<string[]>([]);
    const newCharFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.mode === 'edit' && props.characterToEdit) {
            setCharacterName(props.characterToEdit.name);
            setCharacterDescription(props.characterToEdit.description);
        } else if (props.mode === 'resolution' && props.assetNameForResolution) {
            setViewMode('use'); // Start in list view for resolution
            setCharacterName(props.assetNameForResolution);
        } else if (props.initialName) {
            setCharacterName(props.initialName);
            setCharacterDescription(props.initialDescription || '');
        }
    }, [props.mode, props.characterToEdit, props.assetNameForResolution, props.initialName, props.initialDescription]);


    const handleCreateCharacterClick = async () => {
        try {
            // FIX: Pass characterDescription to onCreateCharacter to support creation with a predefined description.
            const newChar = await props.onCreateCharacter(characterImages, characterName, characterDescription);
            setCharacterName('');
            setCharacterDescription('');
            setCharacterImages([]);
            // The parent (App.tsx) now handles closing and assigning
        } catch (error) {
            console.error("Failed to create character in modal", error);
        }
    };

    const handleUpdateCharacterClick = () => {
        if (props.mode === 'edit' && props.characterToEdit && props.onUpdateCharacter) {
            props.onUpdateCharacter({
                ...props.characterToEdit,
                name: characterName,
                description: characterDescription,
            });
            props.onClose(); // Close after updating
        }
    };

    const handleNewCharacterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files: File[] = Array.from(e.target.files);
            const promises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(promises).then(base64Images => {
                setCharacterImages(prev => [...prev, ...base64Images]);
            });
             if (newCharFileInputRef.current) newCharFileInputRef.current.value = "";
        }
    };

    const removeNewCharacterImage = (index: number) => {
        setCharacterImages(prev => prev.filter((_, i) => i !== index));
    };

    const myFilteredCharacters = props.savedCharacters.filter(char => 
        char.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const allFilteredCharacters = featuredCharacters.filter(char => 
        char.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const charactersToDisplay = activeTab === 'All' ? allFilteredCharacters : myFilteredCharacters;
    
    const currentSelection = props.mode === 'resolution' ? localSelectedCharacter : props.selectedCharacter;

    const modalActions = (
        <div className="flex items-center space-x-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by character" />
            {(props.mode === 'use' || !props.mode) && (
                <NewItemButton label="New character" onClick={() => setViewMode('create')} />
            )}
        </div>
    );

    const renderForm = (isEdit: boolean) => (
         <Modal title={isEdit ? `Edit Character: ${props.characterToEdit?.name}` : "Create New Character"} onClose={props.onClose}>
            <div className="flex flex-col h-full">
                <button onClick={() => { setViewMode('use'); if (props.mode !== 'resolution') props.onClose(); }} className="text-sm text-primary hover:underline self-start mb-4">{'< Back to selection'}</button>
                <div className="flex-grow space-y-4 overflow-y-auto pr-2 flex flex-col">
                    <label className="block text-sm font-medium text-text-dark">Character Name</label>
                    <input type="text" placeholder="e.g., Captain Eva" value={characterName} onChange={e => setCharacterName(e.target.value)}
                        className="w-full bg-surface-light border border-gray-600 rounded-lg p-2 focus:ring-primary focus:border-primary transition" />
                    
                    {isEdit || (props.initialDescription && viewMode === 'create') ? (
                        <>
                            <label className="block text-sm font-medium text-text-dark">Technical Description</label>
                            <textarea
                                value={characterDescription}
                                onChange={e => setCharacterDescription(e.target.value)}
                                className="w-full h-32 bg-surface-light border border-gray-600 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                            />
                             {isEdit && <img src={props.characterToEdit?.referenceSheetImage} alt="Reference" className="w-full rounded-lg" />}
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-surface-light rounded-lg text-sm text-text-dark">
                                Upload one or more photos of your character. The AI will generate a detailed description and a visual reference sheet.
                            </div>
                            <label className="block text-sm font-medium text-text-dark">Character Photos</label>
                            <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center flex-grow flex flex-col justify-center">
                                {characterImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {characterImages.map((imgSrc, index) => (
                                            <div key={index} className="relative group">
                                                <img src={imgSrc} alt={`upload preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                                <button onClick={() => removeNewCharacterImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => newCharFileInputRef.current?.click()} className="bg-surface-light text-text-light hover:bg-gray-600 font-semibold p-2 rounded-lg transition-colors">
                                    Upload Images
                                </button>
                            </div>
                            <input type="file" ref={newCharFileInputRef} onChange={handleNewCharacterImageUpload} multiple accept="image/*" className="hidden" />
                        </>
                    )}
                </div>
                <div className="pt-4 mt-auto">
                    <PanelButton onClick={isEdit ? handleUpdateCharacterClick : handleCreateCharacterClick} primary disabled={!characterName || (characterImages.length === 0 && !characterDescription) || props.isLoading}>
                       {props.isLoading ? <LoaderIcon /> : (isEdit ? 'Update Character' : 'Generate & Save Character')}
                    </PanelButton>
                </div>
            </div>
        </Modal>
    );

    if (viewMode === 'create') return renderForm(false);
    if (viewMode === 'edit') return renderForm(true);

    return (
        <Modal title={props.mode === 'resolution' ? `Select Character for "${props.assetNameForResolution}"` : "Character"} onClose={props.onClose} actions={modalActions}>
             <div className="flex h-full">
                {/* Left side: Character Grid */}
                <div className={`${props.mode === 'resolution' ? 'w-full' : 'w-2/3 pr-6 border-r border-surface-light'} flex flex-col`}>
                    <div className="flex items-center space-x-2 mb-6 flex-shrink-0">
                        {props.mode !== 'resolution' && (
                            <FilterButton label="All" isActive={activeTab === 'All'} onClick={() => setActiveTab('All')} isTab />
                        )}
                        <FilterButton label="My Characters" isActive={activeTab === 'My Characters'} onClick={() => setActiveTab('My Characters')} isTab />
                    </div>
                     <div className="flex-grow overflow-y-auto pr-2">
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                            <div 
                                className="w-full aspect-square bg-surface-light rounded-lg flex items-center justify-center text-center p-2 border-2 border-dashed border-gray-600 hover:border-primary transition-colors cursor-pointer flex-col text-text-dark hover:text-text-light"
                                onClick={() => setViewMode('create')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                                <span className="text-xs mt-1">New character</span>
                            </div>
                            {charactersToDisplay.map(char => (
                                <ItemCard
                                    key={char.id}
                                    name={char.name}
                                    isSelected={currentSelection?.id === char.id}
                                    onSelect={() => props.mode === 'resolution' ? setLocalSelectedCharacter(char) : props.onSelectCharacter(char)}
                                >
                                     <div className={`relative group border-2 rounded-lg transition-colors overflow-hidden ${currentSelection?.id === char.id ? 'border-primary' : 'border-transparent'}`}>
                                         <img src={char.avatar} alt={char.name} className="w-full aspect-square object-cover bg-surface-light" />
                                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                            {props.mode !== 'resolution' && <button onClick={(e) => { e.stopPropagation(); props.onSelectCharacter(char); }} className="w-full text-xs bg-primary/80 text-white rounded px-2 py-1 mb-1 hover:bg-primary">Add to Context</button>}
                                            {activeTab === 'My Characters' && (
                                                <button onClick={(e) => { e.stopPropagation(); props.onDeleteCharacter(char.id)}} className="w-full text-xs bg-red-600/80 text-white rounded px-2 py-1 hover:bg-red-600">Delete</button>
                                            )}
                                         </div>
                                     </div>
                                </ItemCard>
                            ))}
                        </div>
                     </div>
                    {props.mode === 'resolution' && ( // Add a select button for resolution mode
                        <div className="pt-4 mt-auto">
                            <PanelButton 
                                onClick={() => props.onSelectCharacter(localSelectedCharacter)} 
                                primary 
                                disabled={!localSelectedCharacter}
                            >
                                Assign Character
                            </PanelButton>
                        </div>
                    )}
                </div>

                {/* Right side: Scene generation (Hidden in resolution mode) */}
                {props.mode !== 'resolution' && (
                    <div className="w-1/3 pl-6 flex flex-col">
                        {currentSelection ? (
                            <>
                             <h3 className="text-lg font-bold text-text-light mb-4 flex-shrink-0">Generate Scene</h3>
                             <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                                <img
                                    src={currentSelection.referenceSheetImage}
                                    alt={`${currentSelection.name} reference sheet`}
                                    className="w-full rounded-lg border border-surface-light object-contain bg-surface-light"
                                />
                                <div className='flex justify-between items-center'>
                                    <label className="block text-sm font-medium text-text-dark">Scene for: <span className="text-text-light font-semibold">{currentSelection.name}</span></label>
                                    <button onClick={() => props.onSelectCharacter(null)} className="text-xs text-primary hover:underline font-semibold">Clear</button>
                                </div>
                                <textarea
                                    placeholder="Describe the scene..."
                                    value={props.characterPrompt}
                                    onChange={e => props.onCharacterPromptChange(e.target.value)}
                                    className="w-full h-32 bg-surface-light border border-gray-600 rounded-lg p-2 focus:ring-primary focus:border-primary transition"
                                />
                            </div>
                            <div className="pt-4 mt-auto">
                                <PanelButton onClick={props.onGenerateWithCharacter} primary disabled={!props.characterPrompt || props.isLoading}>
                                     {props.isLoading ? <LoaderIcon /> : 'Generate Scene'}
                                </PanelButton>
                            </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-dark text-center">
                                Select a character to add to the active context for generation in the main panel.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
