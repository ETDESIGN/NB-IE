import React, { useState } from 'react';
import type { Tool } from '../types';

// --- Stitch Icons ---

const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M247.93,124.52C246.11,77.54,207.07,40,160.06,40A88.1,88.1,0,0,0,81.29,88.67h0A87.48,87.48,0,0,0,72,127.73,8.18,8.18,0,0,1,64.57,136,8,8,0,0,1,56,128a103.66,103.66,0,0,1,5.34-32.92,4,4,0,0,0-4.75-5.18A64.09,64.09,0,0,0,8,152c0,35.19,29.75,64,65,64H160A88.09,88.09,0,0,0,247.93,124.52Zm-58.27,25.14a8,8,0,0,1-11.32,0L160,131.31V192a8,8,0,0,1-16,0V131.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32A8,8,0,0,1,189.66,149.66Z"></path></svg>;
const GenerateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"></path></svg>;
const DirectorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,104H102.09L210,75.51a8,8,0,0,0,5.68-9.84l-8.16-30a15.93,15.93,0,0,0-19.42-11.13L35.81,64.74a15.75,15.75,0,0,0-9.7,7.4,15.51,15.51,0,0,0-1.55,12L32,111.56c0,.14,0,.29,0,.44v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V112A8,8,0,0,0,216,104ZM192.16,40l6,22.07-22.62,6L147.42,51.83Zm-66.69,17.6,28.12,16.24-36.94,9.75L88.53,67.37Zm-79.4,44.62-6-22.08,26.5-7L94.69,89.4ZM208,200H48V120H208v80Z"></path></svg>;
const CharacterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>;
const SceneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M164,80a28,28,0,1,0-28-28A28,28,0,0,0,164,80Zm0-40a12,12,0,1,1-12,12A12,12,0,0,1,164,40Zm90.88,155.92-54.56-92.08A15.87,15.87,0,0,0,186.55,96h0a15.85,15.85,0,0,0-13.76,7.84L146.63,148l-44.84-76.1a16,16,0,0,0-27.58,0L1.11,195.94A8,8,0,0,0,8,208H248a8,8,0,0,0,6.88-12.08ZM88,80l23.57,40H64.43ZM22,192l33-56h66l18.74,31.8,0,0,L154,192Zm150.57,0-16.66-28.28L186.55,112,234,192Z"></path></svg>;
const SelectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M152,40a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,40Zm-8,168H112a8,8,0,0,0,0,16h32a8,8,0,0,0,0-16ZM208,32H184a8,8,0,0,0,0,16h24V72a8,8,0,0,0,16,0V48A16,16,0,0,0,208,32Zm8,72a8,8,0,0,0-8,8v32a8,8,0,0,0,16,0V112A8,8,0,0,0,216,104Zm0,72a8,8,0,0,0-8,8v24H184a8,8,0,0,0,0,16h24a16,16,0,0,0,16-16V184A8,8,0,0,0,216,176ZM40,152a8,8,0,0,0,8-8V112a8,8,0,0,0-16,0v32A8,8,0,0,0,40,152Zm32,56H48V184a8,8,0,0,0-16,0v24a16,16,0,0,0,16,16H72a8,8,0,0,0,0-16ZM72,32H48A16,16,0,0,0,32,48V72a8,8,0,0,0,16,0V48H72a8,8,0,0,0,0-16Z"></path></svg>;
const CropIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,48H160V16a8,8,0,0,0-16,0V48H56a8,8,0,0,0-8,8V96a8,8,0,0,0,16,0V64H96v96H64v40a8,8,0,0,0,8,8h40v32a8,8,0,0,0,16,0V208h88a8,8,0,0,0,8-8V160a8,8,0,0,0-16,0v32H112V56a8,8,0,0,0-8-8H160a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8V56A8,8,0,0,0,208,48Z"></path></svg>;
const EnhanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M197.58,129.06l-51.61-19-19-51.65a15.92,15.92,0,0,0-29.88,0L78.07,110l-51.65,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0l19-51.61,51.65-19a15.92,15.92,0,0,0,0-29.88ZM140.39,163a15.87,15.87,0,0,0-9.43,9.43l-19,51.46L93,172.39A15.87,15.87,0,0,0,83.61,163h0L32.15,144l51.46-19A15.87,15.87,0,0,0,93,115.61l19-51.46,19,51.46a15.87,15.87,0,0,0,9.43,9.43l51.46,19ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"></path></svg>;
const RemoveBgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120ZM68.67,208A64.36,64.36,0,0,1,87.8,182.2a64,64,0,0,1,80.4,0A64.36,64.36,0,0,1,187.33,208ZM208,208h-3.67a79.9,79.9,0,0,0-46.68-50.29,48,48,0,1,0-59.3,0A79.9,79.9,0,0,0,51.67,208H48V48H208V208Z"></path></svg>;
const AnalyzeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>;
const AdjustIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"></path></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z"></path></svg>;
const ExpandMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M64,128a8,8,0,0,1,8-8h96a8,8,0,0,1,0,16H72A8,8,0,0,1,64,128Zm8,56h96a8,8,0,0,0,0-16H72a8,8,0,0,0,0,16Zm133.66-90.34a8,8,0,0,0-11.32,0l-24,24a8,8,0,0,0,11.32,11.32l24-24A8,8,0,0,0,205.66,93.66ZM72,88a8,8,0,0,0,0-16H168a8,8,0,0,0,0,16Z"></path></svg>;
const CollapseMenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16h88a8,8,0,0,1,0,16H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16H160a8,8,0,0,1,0-16h56a8,8,0,0,0,0-16Z"></path></svg>;

// --- Components ---

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  canDownload: boolean;
  onDownload: () => void;
}

interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  isExpanded: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ label, icon, isActive, onClick, disabled = false, isExpanded }) => {
  const baseClasses = 'w-full flex items-center p-3 rounded-lg transition-colors duration-200';
  const activeClasses = 'bg-primary text-white';
  const inactiveClasses = 'text-text-light hover:bg-surface-light';
  const disabledClasses = 'text-gray-600 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isExpanded ? 'justify-start' : 'justify-center'} ${disabled ? disabledClasses : (isActive ? activeClasses : inactiveClasses)}`}
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">{icon}</div>
      {isExpanded && <span className="ml-3 font-medium text-sm whitespace-nowrap">{label}</span>}
    </button>
  );
};

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool, canDownload, onDownload }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mainTools = [
    { label: "Upload Image", icon: <UploadIcon />, tool: 'upload' as Tool, action: () => onSelectTool('upload') },
    { label: "Generate Image", icon: <GenerateIcon />, tool: 'generate' as Tool, action: () => onSelectTool('generate') },
    { label: "Director Tool", icon: <DirectorIcon />, tool: 'director' as Tool, action: () => onSelectTool('director') },
    { label: "Character Creator", icon: <CharacterIcon />, tool: 'character' as Tool, action: () => onSelectTool('character') },
    { label: "Scene Creator", icon: <SceneIcon />, tool: 'scene' as Tool, action: () => onSelectTool('scene') },
  ];
  
  const editingTools = [
    { label: "Select & Edit", icon: <SelectIcon />, tool: 'select' as Tool, action: () => onSelectTool('select') },
    { label: "Crop/Resize", icon: <CropIcon />, tool: 'crop' as Tool, action: () => onSelectTool('crop') },
    { label: "Enhance Image", icon: <EnhanceIcon />, tool: 'enhance' as Tool, action: () => onSelectTool('enhance') },
    { label: "Remove Background", icon: <RemoveBgIcon />, tool: 'remove-bg' as Tool, action: () => onSelectTool('remove-bg') },
    { label: "Analyze Image", icon: <AnalyzeIcon />, tool: 'analyze' as Tool, action: () => onSelectTool('analyze') },
    { label: "Adjust Colors", icon: <AdjustIcon />, tool: 'adjust' as Tool, action: () => onSelectTool('adjust') },
  ];
  
  const utilityTools = [
      { label: "Download Image", icon: <DownloadIcon />, tool: 'download' as Tool, action: onDownload, disabled: !canDownload },
  ];

  return (
    <nav className={`bg-surface flex flex-col items-center border-r border-surface-light z-20 transition-all duration-300 ease-in-out ${isExpanded ? 'w-56 p-3' : 'w-16 p-2'}`}>
        <div className={`p-2 text-primary font-bold text-lg mb-4 ${isExpanded ? 'self-start' : ''}`}>NB</div>
        
        <div className="flex flex-col space-y-1 w-full">
            {mainTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    isExpanded={isExpanded}
                />
            ))}
        </div>
        
        <hr className={`w-full border-t border-surface-light my-3`} />

        <div className="flex flex-col space-y-1 w-full">
            {editingTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    isExpanded={isExpanded}
                />
            ))}
        </div>
        
        <div className="mt-auto w-full pt-4 space-y-1">
            {utilityTools.map(item => (
                <ToolButton
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeTool === item.tool}
                    onClick={item.action}
                    disabled={item.disabled}
                    isExpanded={isExpanded}
                />
            ))}
             <ToolButton
                label={isExpanded ? "Collapse" : "Expand"}
                icon={isExpanded ? <CollapseMenuIcon /> : <ExpandMenuIcon />}
                isActive={false}
                onClick={() => setIsExpanded(!isExpanded)}
                isExpanded={isExpanded}
            />
        </div>
    </nav>
  );
};