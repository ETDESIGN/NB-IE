import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { SavedScene, UserObject } from '../../types';

// Define the types of assets we can regenerate
export type RegenerateAssetType = 'technicalSheet' | 'detailShots' | 'aerialMap';

interface SceneInspectorModalProps {
    onClose: () => void;
    scene: SavedScene;
    userObjects: UserObject[]; // The entire library of saved objects
    onUpdateScene: (updatedScene: SavedScene) => void;
    onRegenerateAsset: (sceneId: string, assetType: RegenerateAssetType, prompt: string) => void;
    onCastObject: (sceneId: string, objectId: string, shouldCast: boolean) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${active ? 'bg-surface-light text-text-light' : 'bg-surface text-text-dark hover:bg-surface-light'}`}>
        {children}
    </button>
);

export const SceneInspectorModal: React.FC<SceneInspectorModalProps> = (props) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [editableSheet, setEditableSheet] = useState(props.scene.technicalSheet);
    const [regenPrompt, setRegenPrompt] = useState('');

    // Ensure the editable sheet updates if the scene prop changes (e.g., after regeneration)
    useEffect(() => {
        setEditableSheet(props.scene.technicalSheet);
    }, [props.scene.technicalSheet]);


    const handleSave = () => {
        // Create an updated scene object with the edited technical sheet
        if (editableSheet !== props.scene.technicalSheet) {
            const updatedScene = { ...props.scene, technicalSheet: editableSheet };
            props.onUpdateScene(updatedScene);
        }
        props.onClose();
    };

    const handleRegenerate = (assetType: RegenerateAssetType) => {
        props.onRegenerateAsset(props.scene.id, assetType, regenPrompt);
        setRegenPrompt(''); // Clear prompt after use
    };

    const renderCurrentTab = () => {
        switch (activeTab) {
            case 'assets':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2 text-text-light">Detail Shots</h4>
                            {props.scene.detailShots && props.scene.detailShots.length > 0 ? (
                                <img src={props.scene.detailShots[0]} className="rounded-lg w-full aspect-square object-cover bg-surface"/>
                            ) : <div className="rounded-lg w-full aspect-square bg-surface flex items-center justify-center text-text-dark">No Detail Shots</div>}
                            <button onClick={() => handleRegenerate('detailShots')} className="mt-2 text-primary text-sm hover:underline">Regenerate with Prompt</button>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-text-light">Aerial Map</h4>
                            {props.scene.aerialMap ? (
                                <img src={props.scene.aerialMap} className="rounded-lg w-full aspect-square object-cover bg-surface"/>
                            ) : <div className="rounded-lg w-full aspect-square bg-surface flex items-center justify-center text-text-dark">No Aerial Map</div>}
                            <button onClick={() => handleRegenerate('aerialMap')} className="mt-2 text-primary text-sm hover:underline">Regenerate with Prompt</button>
                        </div>
                    </div>
                );
            case 'casting':
                return (
                    <div>
                        <h4 className="font-semibold mb-2 text-text-light">Cast Objects in this Scene</h4>
                        <div className="space-y-2 max-w-md">
                            {props.userObjects.length > 0 ? props.userObjects.map(obj => {
                                const isCast = props.scene.castObjectIds?.includes(obj.id);
                                return (
                                    <div key={obj.id} className="flex items-center justify-between p-2 bg-surface rounded-md">
                                        <div className="flex items-center">
                                            <img src={obj.avatar} className="w-8 h-8 rounded-md mr-3 object-cover"/>
                                            <span className="text-text-light">{obj.name}</span>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={isCast}
                                            onChange={(e) => props.onCastObject(props.scene.id, obj.id, e.target.checked)}
                                            className="w-5 h-5 rounded bg-surface-light border-surface-light text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface"
                                        />
                                    </div>
                                );
                            }) : (
                                <p className="text-text-dark text-center py-4">You have no saved objects to cast.</p>
                            )}
                        </div>
                    </div>
                );
            case 'overview':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <img src={props.scene.referenceSheetImage} alt={props.scene.name} className="w-full h-auto object-cover rounded-lg"/>
                        <div>
                            <h4 className="font-semibold mb-2 text-text-light">Technical Sheet</h4>
                            <textarea value={editableSheet} onChange={e => setEditableSheet(e.target.value)} className="w-full h-64 bg-surface text-text-light p-2 rounded-md resize-none border border-surface-light focus:ring-primary focus:border-primary"/>
                             <button onClick={() => handleRegenerate('technicalSheet')} className="mt-2 text-primary text-sm hover:underline">Regenerate with Prompt</button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Modal title={`Inspector: ${props.scene.name}`} onClose={handleSave} size="max-w-4xl">
            <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex border-b border-surface-light mb-4">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</TabButton>
                    <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')}>Asset Library</TabButton>
                    <TabButton active={activeTab === 'casting'} onClick={() => setActiveTab('casting')}>Object Casting</TabButton>
                </div>

                {/* Regeneration Prompt */}
                {activeTab !== 'casting' && (
                    <div className="mb-4">
                        <input 
                            type="text"
                            placeholder="Optional: Add a prompt to guide regeneration (e.g., 'make the lighting more dramatic')..."
                            value={regenPrompt}
                            onChange={e => setRegenPrompt(e.target.value)}
                            className="w-full bg-surface-light p-2 rounded-md text-sm text-text-light placeholder-text-dark focus:ring-primary focus:border-primary border border-transparent"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-grow overflow-y-auto pr-2">
                    {renderCurrentTab()}
                </div>
            </div>
        </Modal>
    );
};
