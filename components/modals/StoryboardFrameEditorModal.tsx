import React, { useState } from 'react';
import type { StoryboardImage } from '../../types';
import { Modal } from './Modal';
import { editImage } from '../../services/geminiService';
import { LoaderIcon } from '../../constants';

interface StoryboardFrameEditorModalProps {
    image: StoryboardImage;
    onClose: () => void;
    onSave: (sceneNumber: number, frameNumber: number, newImageData: string) => void;
}

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;

export const StoryboardFrameEditorModal: React.FC<StoryboardFrameEditorModalProps> = ({ image, onClose, onSave }) => {
    const [currentImageData, setCurrentImageData] = useState<string | null>(image.imageData);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApplyEdit = async () => {
        if (!prompt || !currentImageData) return;
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await editImage(currentImageData, prompt, { maskBase64: null });
            setCurrentImageData(newImage);
            setPrompt(''); // Clear prompt after applying
        } catch (e) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to apply edit: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAndClose = () => {
        if (currentImageData) {
            onSave(image.sceneNumber, image.frameNumber, currentImageData);
        }
        onClose();
    };

    return (
        <Modal title={`Editing Frame ${image.sceneNumber}:${image.frameNumber}`} onClose={onClose} size="max-w-4xl">
            <div className="grid grid-cols-3 gap-6 h-full">
                {/* Image Preview Column */}
                <div className="col-span-2 bg-surface rounded-lg flex items-center justify-center relative overflow-hidden">
                    {currentImageData ? (
                        <img src={currentImageData} alt={`Editing frame ${image.frameNumber}`} className="max-w-full max-h-full object-contain" />
                    ) : (
                        <div className="text-text-dark">Image not available</div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                            <LoaderIcon />
                            <p className="mt-2 text-text-light">Applying edit...</p>
                        </div>
                    )}
                </div>

                {/* Controls Column */}
                <div className="col-span-1 flex flex-col space-y-4">
                    <h3 className="text-lg font-semibold text-text-light">Modify Frame</h3>
                    <p className="text-sm text-text-dark">Describe the changes you want to make to this frame. You can apply multiple edits before saving.</p>
                    
                    <div className="flex-grow flex flex-col">
                        <label htmlFor="frame-edit-prompt" className="text-sm font-medium text-text-dark mb-1">Edit Prompt</label>
                        <textarea
                            id="frame-edit-prompt"
                            placeholder="e.g., make the cat's eyes glow, add rain outside the window..."
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full h-32 bg-surface-light p-2 rounded-lg text-text-light focus:ring-primary focus:border-primary border border-transparent resize-none"
                        />
                         <button
                            onClick={handleApplyEdit}
                            disabled={isLoading || !prompt}
                            className="w-full mt-2 flex items-center justify-center p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed"
                        >
                            Apply AI Edit
                            <SparklesIcon className="ml-2"/>
                        </button>
                    </div>
                    
                    {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded-md">{error}</p>}

                    <div className="flex-shrink-0 pt-4 border-t border-surface space-y-2">
                        <button
                            onClick={handleSaveAndClose}
                            className="w-full p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Save & Close
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full p-2 bg-surface-light text-text-light font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};