import React, { useState } from 'react';
import type { Layer } from '../types';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onLayerOpacityChange: (id: string, opacity: number) => void;
  onLayerNameChange: (id: string, name: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (draggedId: string, targetId: string) => void;
}

const EyeOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeClosedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .527-1.667 1.49-3.213 2.66-4.525M9.88 9.88l.36- .36m2.4-2.4l.359-.359M12 5c4.478 0 8.268 2.943 9.542 7a10.054 10.054 0 01-1.636 3.54M21 21l-6-6M3 3l6 6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


export const LayersPanel: React.FC<LayersPanelProps> = ({ layers, activeLayerId, onSelectLayer, onToggleVisibility, onDeleteLayer, onLayerOpacityChange, onReorderLayer, onLayerNameChange }) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    // Store the ID of the layer being dragged
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    // Use a timeout to update the state after the browser has created the drag ghost image
    setTimeout(() => setDraggedItemId(id), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    // This is necessary to allow a drop event
    e.preventDefault();
    if (draggedItemId && draggedItemId !== targetId) {
      setDragOverItemId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverItemId(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && targetId && draggedId !== targetId) {
      onReorderLayer(draggedId, targetId);
    }
    // Clean up state after drop
    setDraggedItemId(null);
    setDragOverItemId(null);
  };
  
  const handleDragEnd = () => {
    // Clean up state in case the drag is cancelled (e.g., by pressing Esc)
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleNameEditCommit = (id: string, name: string) => {
    if (name.trim()) onLayerNameChange(id, name.trim());
    setEditingLayerId(null);
    setEditingName('');
  };

  return (
    <div className="p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex-grow space-y-2">
        {layers.length > 0 ? (
            [...layers].reverse().map(layer => {
                const isActive = activeLayerId === layer.id;
                const isEditing = editingLayerId === layer.id;
                const isBeingDragged = draggedItemId === layer.id;
                // A line will appear above the target layer
                const isDragOverTarget = dragOverItemId === layer.id && !isBeingDragged;

                return (
                    <div
                        key={layer.id}
                        draggable={!isEditing}
                        onDragStart={(e) => handleDragStart(e, layer.id)}
                        onDragOver={(e) => handleDragOver(e, layer.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, layer.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface rounded-md transition-all duration-150 relative ${
                            isBeingDragged ? 'opacity-40' : 'opacity-100'
                        }`}
                    >
                        {/* Visual indicator for drop target */}
                        {isDragOverTarget && <div className="absolute top-0 left-0 w-full h-0.5 bg-primary z-10" />}

                        <div
                            onClick={() => onSelectLayer(layer.id)}
                            className={`flex items-center p-2 cursor-pointer rounded-t-md ${isActive ? 'bg-primary/50' : 'hover:bg-primary/20'}`}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                                className="mr-2 text-text-dark hover:text-text-light"
                            >
                                {layer.isVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                            </button>
                            <div className="flex-grow text-sm truncate" onDoubleClick={(e) => { e.stopPropagation(); setEditingLayerId(layer.id); setEditingName(layer.name); }}>
                                {isEditing ? (
                                    <input
                                        type="text" value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleNameEditCommit(layer.id, editingName)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleNameEditCommit(layer.id, editingName); if (e.key === 'Escape') setEditingLayerId(null); }}
                                        autoFocus
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-surface text-text-light p-0 m-0 border-0 focus:ring-1 focus:ring-primary rounded"
                                    />
                                ) : ( layer.name )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                                className="ml-2 text-text-dark hover:text-red-500"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                        {isActive && (
                            <div className="px-2 pb-2 bg-primary/20 rounded-b-md" onMouseDown={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between text-xs mb-1 text-text-dark font-semibold">
                                    <label>Opacity</label>
                                    <span>{layer.opacity}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100" value={layer.opacity}
                                    onChange={(e) => onLayerOpacityChange(layer.id, parseInt(e.target.value, 10))}
                                    className="w-full h-1 bg-surface-light rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        )}
                    </div>
                );
            })
        ) : (
            <div className="text-center text-text-dark pt-10">No layers yet.</div>
        )}
      </div>
    </div>
  );
};