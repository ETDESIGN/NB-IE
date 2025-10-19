import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { NewItemButton, ItemCard, SearchBar } from './common';
import type { SavedScene } from '../../types';
import { LoaderIcon } from '../../constants';

interface SceneModalProps {
    onClose: () => void;
    savedScenes: SavedScene[];
    onCreateScene: (images: string[], name: string, description: string) => Promise<SavedScene>;
    onDeleteScene: (id: string) => void;
    isLoading: boolean;
    onSelectScene: (scene: SavedScene) => void;
    onOpenInspector: (sceneId: string) => void;
    initialMode?: 'list' | 'create';
    initialName?: string;
    initialDescription?: string;
}

export const SceneModal: React.FC<SceneModalProps> = (props) => {
    const [mode, setMode] = useState<'list' | 'create'>(props.initialMode || 'list');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [newSceneName, setNewSceneName] = useState(props.initialName || '');
    const [newSceneDescription, setNewSceneDescription] = useState(props.initialDescription || '');
    const [newSceneImages, setNewSceneImages] = useState<string[]>([]);
    const newSceneFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (props.initialMode === 'create') {
            setNewSceneName(props.initialName || '');
            setNewSceneDescription(props.initialDescription || '');
            setMode('create');
        }
    }, [props.initialMode, props.initialName, props.initialDescription]);

    const handleCreateSceneClick = async () => {
        if (!newSceneName || newSceneImages.length === 0) return;
        try {
            await props.onCreateScene(newSceneImages, newSceneName, newSceneDescription);
            // Parent now handles closing & assignment
        } catch (error) {
            console.error("Failed to create scene in modal", error);
        }
    };
    
    const handleNewSceneImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files: File[] = [];
            for (let i = 0; i < e.target.files.length; i++) {
                const item = e.target.files.item(i);
                if (item) {
                    files.push(item);
                }
            }
            const promises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(promises).then(base64Images => {
                setNewSceneImages(prev => [...prev, ...base64Images]);
            });
             if (newSceneFileInputRef.current) newSceneFileInputRef.current.value = "";
        }
    };

    const removeNewSceneImage = (index: number) => {
        setNewSceneImages(prev => prev.filter((_, i) => i !== index));
    };

    const filteredScenes = props.savedScenes.filter(scene =>
        scene.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const modalActions = (
        <div className="flex items-center space-x-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search scenes..." />
            <NewItemButton label="New Scene" onClick={() => setMode('create')} />
        </div>
    );

    if (mode === 'create') {
        return (
            <Modal title="Create New Scene" onClose={props.onClose} size="max-w-2xl">
                <div className="flex flex-col h-full">
                    <button onClick={() => { setMode('list'); if (props.initialMode !== 'list') props.onClose(); }} className="text-sm text-primary hover:underline self-start mb-4">{'< Back to list'}</button>
                    <div className="flex-grow space-y-4 flex flex-col">
                        <div>
                            <label className="block text-sm font-medium text-text-dark">Scene Name</label>
                            <input type="text" placeholder="e.g., Mystic Forest" value={newSceneName} onChange={e => setNewSceneName(e.target.value)}
                                className="w-full bg-surface-light border border-gray-600 rounded-lg p-2 focus:ring-primary focus:border-primary transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-dark">Scene Description (Optional)</label>
                            <textarea
                                placeholder="A dense, magical forest with glowing mushrooms and ancient trees..."
                                value={newSceneDescription}
                                onChange={e => setNewSceneDescription(e.target.value)}
                                className="w-full h-24 bg-surface-light border border-gray-600 rounded-lg p-3 focus:ring-primary focus:border-primary transition resize-none"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-text-dark">Reference Images</label>
                             <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg text-center flex-grow flex flex-col justify-center">
                                {newSceneImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {newSceneImages.map((imgSrc, index) => (
                                            <div key={index} className="relative group">
                                                <img src={imgSrc} alt={`upload preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                                                <button onClick={() => removeNewSceneImage(index)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => newSceneFileInputRef.current?.click()} className="bg-surface-light text-text-light hover:bg-gray-600 font-semibold p-2 rounded-lg transition-colors">
                                    Upload Images
                                </button>
                             </div>
                             <input type="file" ref={newSceneFileInputRef} onChange={handleNewSceneImageUpload} multiple accept="image/*" className="hidden" />
                        </div>
                    </div>
                    <div className="pt-4 mt-auto">
                        <button onClick={handleCreateSceneClick} disabled={!newSceneName || newSceneImages.length === 0 || props.isLoading} className="w-full flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                           {props.isLoading ? <LoaderIcon /> : 'Generate & Save Scene'}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal title="Scenes & Backgrounds" onClose={props.onClose} actions={modalActions}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div 
                    className="w-full aspect-video bg-surface-light rounded-lg flex items-center justify-center text-center p-2 border-2 border-dashed border-gray-600 hover:border-primary transition-colors cursor-pointer flex-col text-text-dark hover:text-text-light"
                    onClick={() => setMode('create')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs mt-1">New Scene</span>
                </div>
                {filteredScenes.map(scene => (
                    <ItemCard
                        key={scene.id}
                        name={scene.name}
                        isSelected={false}
                        onSelect={() => props.onSelectScene(scene)}
                    >
                        <div className="relative group border-2 border-transparent hover:border-primary/50 transition-colors rounded-lg overflow-hidden aspect-video">
                            <img src={scene.avatar} alt={scene.name} className="w-full h-full object-cover bg-surface-light" />
                             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white font-semibold text-center text-sm mb-2">{scene.name}</p>
                                <button onClick={(e) => { e.stopPropagation(); props.onOpenInspector(scene.id) }} className="w-full text-xs bg-surface-light/80 text-white rounded px-2 py-1 mb-1 hover:bg-surface-light">Inspect</button>
                                <button onClick={(e) => { e.stopPropagation(); props.onSelectScene(scene) }} className="w-full text-xs bg-primary/80 text-white rounded px-2 py-1 mb-1 hover:bg-primary">Use</button>
                                <button onClick={(e) => { e.stopPropagation(); props.onDeleteScene(scene.id)}} className="w-full text-xs bg-red-600/80 text-white rounded px-2 py-1 hover:bg-red-600">Delete</button>
                            </div>
                        </div>
                    </ItemCard>
                ))}
            </div>
             {filteredScenes.length === 0 && (
                 <div className="text-center text-text-dark py-16">
                    You haven't created any scenes yet.
                </div>
             )}
        </Modal>
    );
};
