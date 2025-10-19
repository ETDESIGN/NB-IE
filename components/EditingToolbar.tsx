import React from 'react';

// Icons from Stitch
const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path>
    </svg>
);
const RedoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path>
    </svg>
);
const CompareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM40,128a88.1,88.1,0,0,1,88-88,40,40,0,0,1,0,80A56,56,0,0,0,77.39,200,88,88,0,0,1,40,128Zm88,88a40,40,0,0,1,0-80,56,56,0,0,0,50.61-79.95A88,88,0,0,1,128,216Zm12-40a12,12,0,1,1-12-12A12,12,0,0,1,140,176ZM116,80a12,12,0,1,1,12,12A12,12,0,0,1,116,80Z"></path>
    </svg>
);
// Re-using Undo icon for Reset as per the single provided icon in Stitch
const ResetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
        <path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"></path>
    </svg>
);


interface EditingToolbarProps {
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    onReset: () => void;
    onCompareToggle: (isComparing: boolean) => void;
}

const ToolButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
}> = ({ label, icon, onClick, onMouseDown, onMouseUp, onMouseLeave, disabled = false }) => (
    <button
      title={label}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className="p-3 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary hover:bg-white/10 disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed"
    >
        {icon}
    </button>
);

export const EditingToolbar: React.FC<EditingToolbarProps> = ({
    onUndo, canUndo, onRedo, canRedo, onReset, onCompareToggle
}) => {
    return (
        <div className="bg-black/50 backdrop-blur-sm p-1 rounded-full flex items-center space-x-1">
            <ToolButton label="Undo" icon={<UndoIcon />} onClick={onUndo} disabled={!canUndo} />
            <ToolButton label="Redo" icon={<RedoIcon />} onClick={onRedo} disabled={!canRedo} />
            <div className="h-6 w-px bg-surface-light mx-1"></div>
            <ToolButton 
                label="Compare to Original"
                icon={<CompareIcon />}
                onMouseDown={() => onCompareToggle(true)}
                onMouseUp={() => onCompareToggle(false)}
                onMouseLeave={() => onCompareToggle(false)}
                disabled={!canUndo}
            />
            <ToolButton label="Reset" icon={<ResetIcon />} onClick={onReset} disabled={!canUndo} />
        </div>
    );
};
