import React from 'react';
import { Modal } from './Modal';
import { ASPECT_RATIOS_DETAILED } from '../../data/generationData';
import type { AspectRatio } from '../../types';

interface AspectRatioModalProps {
    onClose: () => void;
    onSelect: (aspectRatio: AspectRatio) => void;
    currentRatio: AspectRatio;
}

const Icon: React.FC<{ type: 'square' | 'widescreen' | 'portrait', isSelected: boolean }> = ({ type, isSelected }) => {
    const baseClasses = `border-2 rounded-sm transition-colors ${isSelected ? 'border-primary' : 'border-text-dark'}`;
    if (type === 'square') return <div className={`${baseClasses} w-6 h-6`}></div>
    if (type === 'widescreen') return <div className={`${baseClasses} w-8 h-5`}></div>
    return <div className={`${baseClasses} w-5 h-8`}></div>
};

export const AspectRatioModal: React.FC<AspectRatioModalProps> = ({ onClose, onSelect, currentRatio }) => {
    return (
        <Modal title="Select Aspect Ratio" onClose={onClose} size="max-w-lg">
            <div className="grid grid-cols-2 gap-4">
                {ASPECT_RATIOS_DETAILED.map(({ value, name, icon }) => {
                    const isSelected = value === currentRatio;
                    return (
                        <button
                            key={value}
                            onClick={() => onSelect(value)}
                            className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${isSelected ? 'bg-primary/20' : 'bg-surface-light hover:bg-surface-light/50'}`}
                        >
                            <Icon type={icon} isSelected={isSelected} />
                            <div>
                                <p className={`font-semibold text-left ${isSelected ? 'text-text-light' : 'text-text-dark'}`}>{value}</p>
                                <p className="text-sm text-text-dark text-left">{name}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </Modal>
    );
};
