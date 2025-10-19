import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { OBJECTS } from '../../data/generationData';
import { FilterButton, SearchBar, ItemCard, NewItemButton } from './common';
import type { UserObject } from '../../types';
import { LoaderIcon } from '../../constants';

interface ObjectModalProps {
    onClose: () => void;
    onSelect: (object: UserObject | string) => void;
    selectedTags: Set<string>;
    userObjects: UserObject[];
    // FIX: Add optional `description` parameter to align with `handleCreateObject` function signature.
    onCreateObject: (prompt: string, description?: string) => Promise<UserObject>;
    onUpdateObject?: (object: UserObject) => void;
    objectToEdit?: UserObject | null;
    onSelectTag: (tagName: string) => void;
    isLoading: boolean;
    mode?: "list" | "create" | "resolution" | "edit";
    assetNameForResolution?: string;
    initialName?: string;
    initialDescription?: string;
}

export const ObjectModal: React.FC<ObjectModalProps> = (props) => {
    const [activeTab, setActiveTab] = useState('My Objects');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>(props.mode === 'create' ? 'create' : props.mode === 'edit' ? 'edit' : 'list');
    const [objectPrompt, setObjectPrompt] = useState(props.initialName || '');
    const [objectDescription, setObjectDescription] = useState(props.initialDescription || '');
    const [selectedObject, setSelectedObject] = useState<UserObject | null>(null);

    useEffect(() => {
        if (props.mode === 'edit' && props.objectToEdit) {
            setObjectPrompt(props.objectToEdit.name);
            setObjectDescription(props.objectToEdit.description);
        } else if (props.mode === 'resolution' && props.assetNameForResolution) {
            setViewMode('list'); // Start in list view for resolution
            setObjectPrompt(props.assetNameForResolution);
        } else if (props.initialName) {
            setObjectPrompt(props.initialName);
            setObjectDescription(props.initialDescription || '');
            if (props.mode === 'create') setViewMode('create');
        }
    }, [props.mode, props.objectToEdit, props.assetNameForResolution, props.initialName, props.initialDescription]);


    const handleCreate = async () => {
        try {
            // FIX: Pass objectDescription to onCreateObject to support creation with a predefined description.
            await props.onCreateObject(objectPrompt, objectDescription);
            // Parent now handles closing/assigning
        } catch (error) {
            console.error("Failed to create object in modal", error);
        }
    };

    const handleUpdate = () => {
        if (props.mode === 'edit' && props.objectToEdit && props.onUpdateObject) {
            props.onUpdateObject({
                ...props.objectToEdit,
                name: objectPrompt,
                description: objectDescription,
            });
        }
    };

    const handleSelectObject = (obj: UserObject) => {
        if (props.mode === 'resolution') {
            setSelectedObject(obj); 
        } else {
            props.onSelectTag(obj.name); // Original behavior for adding tags
        }
    };
    
    const myObjects = useMemo(() => {
        return props.userObjects.filter(obj => 
            obj.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, props.userObjects]);

    const modalActions = (
        <div className="flex items-center space-x-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search by object" />
            <NewItemButton label="New object" onClick={() => setViewMode('create')} />
        </div>
    );
    
    const renderForm = (isEdit: boolean) => (
        <Modal title={isEdit ? `Edit Object: ${props.objectToEdit?.name}` : "Create New Object"} onClose={props.onClose}>
            <div className="flex flex-col h-full max-w-lg mx-auto">
                <button onClick={() => { setViewMode('list'); if(props.mode !== 'resolution') props.onClose(); }} className="text-sm text-primary hover:underline self-start mb-4">{'< Back to selection'}</button>
                <div className="flex-grow space-y-4 flex flex-col">
                    <label htmlFor="object-prompt" className="block text-sm font-medium text-text-dark">{isEdit ? 'Object Name' : 'Object Description'}</label>
                    <textarea
                        id="object-prompt"
                        placeholder={isEdit ? "e.g., Red Leather Armchair" : "e.g., a photorealistic red leather armchair"}
                        value={objectPrompt}
                        onChange={e => setObjectPrompt(e.target.value)}
                        className="w-full h-24 bg-surface-light border border-gray-600 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                    />
                    {isEdit || (props.initialDescription && viewMode === 'create') ? (
                        <>
                             <label htmlFor="object-desc" className="block text-sm font-medium text-text-dark">Technical Description</label>
                            <textarea
                                id="object-desc"
                                value={objectDescription}
                                onChange={e => setObjectDescription(e.target.value)}
                                className="w-full h-32 bg-surface-light border border-gray-600 rounded-lg p-3 focus:ring-primary focus:border-primary transition"
                            />
                        </>
                    ) : (
                         <p className="text-xs text-text-dark">The AI will generate this object on a transparent background.</p>
                    )}
                </div>
                 <div className="pt-4 mt-auto">
                    <button onClick={isEdit ? handleUpdate : handleCreate} disabled={!objectPrompt || props.isLoading} className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                       {props.isLoading ? <LoaderIcon /> : (isEdit ? 'Update Object' : 'Generate & Save Object')}
                    </button>
                </div>
            </div>
        </Modal>
    );

    if (viewMode === 'create') return renderForm(false);
    if (viewMode === 'edit') return renderForm(true);

    return (
        <Modal title={props.mode === 'resolution' ? `Select Object for "${props.assetNameForResolution}"` : "Object"} onClose={props.onClose} actions={modalActions}>
            <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-6">
                    <FilterButton label="My Objects" isActive={activeTab === 'My Objects'} onClick={() => setActiveTab('My Objects')} isTab />
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        <div
                            onClick={() => setViewMode('create')}
                            className="w-full aspect-square bg-surface-light rounded-lg flex items-center justify-center text-center p-2 border-2 border-dashed border-gray-600 hover:border-primary transition-colors cursor-pointer flex-col text-text-dark hover:text-text-light"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                            <span className="text-xs mt-1">New object</span>
                        </div>
                        
                        {myObjects.map(obj => {
                            const isSelectedInTags = props.selectedTags.has(obj.name);
                            const isSelectedForResolution = props.mode === 'resolution' && selectedObject?.id === obj.id;
                            const isSelected = isSelectedInTags || isSelectedForResolution;
                            return (
                                <ItemCard 
                                    key={obj.id}
                                    name={obj.name}
                                    isSelected={isSelected}
                                    onSelect={() => handleSelectObject(obj)}
                                >
                                    <img 
                                        src={obj.avatar} 
                                        alt={obj.name}
                                        className={`w-full aspect-square object-cover bg-surface-light rounded-lg border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}
                                        loading="lazy"
                                    />
                                </ItemCard>
                            );
                        })}
                    </div>
                </div>

                {props.mode === 'resolution' && (
                    <div className="pt-6 mt-auto">
                        <button 
                            onClick={() => selectedObject && props.onSelect(selectedObject)}
                            className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed"
                            disabled={!selectedObject}
                        >
                            Assign Object
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
