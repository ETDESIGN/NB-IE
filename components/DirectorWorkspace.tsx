import React, { useState, useEffect, useRef } from 'react';
import type { Character, UserObject, SavedScene, CopilotMessage, ParsedBlueprint, StoryboardImage, CopilotAgentResponse, ScriptActionPayload, AssetCreateSuggestionPayload, UIHighlightPayload } from '../types';
import { getDirectorCopilotResponse } from '../services/geminiService';
import { LoaderIcon } from '../constants';

// --- ICONS ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const InsertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const ReplaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 12L3 12m4 4L11 12m3-8v12m0 0l4-4m-4 4l-4-4" /></svg>;


interface DirectorWorkspaceProps {
  onClose: () => void;
  savedCharacters: Character[];
  userObjects: UserObject[];
  savedScenes: SavedScene[];
  blueprintText: string;
  onBlueprintTextChange: (text: string | ((prev: string) => string)) => void;
  onParse: () => void;
  onGenerate: () => void;
  parsedBlueprint: ParsedBlueprint | null;
  validationErrors: { type: 'character' | 'object' | 'scene', name: string, blueprintId: string }[]; 
  storyboardImages: StoryboardImage[];
  generationStatus: 'idle' | 'parsing' | 'validating' | 'generating' | 'complete' | 'error';
  onResolveAsset: (assetError: { type: 'character' | 'object' | 'scene', name: string, blueprintId: string }) => void;
  onRetryImage: (imageToRetry: StoryboardImage) => void; 
  onGenerateSingleScene: (sceneNumber: number) => void;
  onUpdateGlobalContext: (field: keyof ParsedBlueprint['globalContext'], value: any) => void;
}

type RightPanelTab = 'copilot' | 'assets';

export const DirectorWorkspace: React.FC<DirectorWorkspaceProps> = (props) => {
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<RightPanelTab>('copilot');
  const scriptTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // State for Co-pilot chat
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<CopilotMessage[]>([
      { role: 'model', content: "Welcome! How can I help you build your story? Try one of these prompts:" }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  
  // New state for Actionable Agent
  const [lastScriptStateForUndo, setLastScriptStateForUndo] = useState<string | null>(null);
  const [discoveredAssets, setDiscoveredAssets] = useState<AssetCreateSuggestionPayload[]>([]);
  
  const canParse = props.blueprintText.length > 50 && (props.generationStatus === 'idle' || props.generationStatus === 'complete' || props.generationStatus === 'error');
  const canGenerate = !!props.parsedBlueprint && props.validationErrors.length === 0 && (props.generationStatus === 'idle' || props.generationStatus === 'complete' || props.generationStatus === 'error');

  const handleUndo = () => {
    if (lastScriptStateForUndo !== null) {
        props.onBlueprintTextChange(lastScriptStateForUndo);
        setLastScriptStateForUndo(null); // Simple one-level undo for now
    }
  };

  const handleCopilotSend = async (prompt?: string) => {
    const textToSend = prompt || copilotInput;
    if (!textToSend.trim() || isCopilotLoading) return;

    const userMessage: CopilotMessage = { role: 'user', content: textToSend };
    setCopilotHistory(prev => [...prev, userMessage]);
    
    if (!prompt) {
        setCopilotInput('');
    }
    
    setIsCopilotLoading(true);

    try {
        // FIX: Added missing 'copilotHistory' argument to the function call.
        const response = await getDirectorCopilotResponse(textToSend, props.blueprintText, copilotHistory);
        
        const modelMessage: CopilotMessage = { role: 'model', content: response.displayText };
        setCopilotHistory(prev => [...prev, modelMessage]);
        
        // --- ACTION EXECUTOR ---
        if (response.actions && response.actions.length > 0) {
            setLastScriptStateForUndo(props.blueprintText);

            response.actions.forEach(action => {
                switch (action.type) {
                    case 'SCRIPT_APPEND':
                        props.onBlueprintTextChange(prev => prev + (action.payload as ScriptActionPayload).content);
                        break;
                    case 'SCRIPT_REPLACE':
                        // As per spec, this currently replaces the entire script.
                        // A more advanced version could target a selection.
                        props.onBlueprintTextChange((action.payload as ScriptActionPayload).content);
                        break;
                    case 'SCRIPT_INSERT_AT_CURSOR':
                        handleInsertInScript((action.payload as ScriptActionPayload).content);
                        break;
                    case 'ASSET_CREATE_SUGGESTION':
                        setDiscoveredAssets(prev => [...prev, action.payload as AssetCreateSuggestionPayload]);
                        setActiveRightPanelTab('assets'); // Switch to assets tab to show suggestion
                        break;
                    case 'UI_HIGHLIGHT':
                        console.log("UI Highlight requested:", (action.payload as UIHighlightPayload).textToHighlight);
                        // Future implementation: highlight text in script editor.
                        break;
                    default:
                        console.warn(`Unknown action type received: ${(action as any).type}`);
                }
            });
        }

    } catch (error) {
        console.error("Co-pilot error:", error);
        const errorMessage: CopilotMessage = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
        setCopilotHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsCopilotLoading(false);
    }
};

 const handleInsertInScript = (content: string) => {
    if (!scriptTextAreaRef.current) return;
    const { selectionStart, selectionEnd } = scriptTextAreaRef.current;
    const currentText = props.blueprintText;
    const newText = currentText.substring(0, selectionStart) + content + currentText.substring(selectionEnd);
    props.onBlueprintTextChange(newText);
    scriptTextAreaRef.current.focus();
};

const handleReplaceScript = (content: string) => {
    setLastScriptStateForUndo(props.blueprintText);
    props.onBlueprintTextChange(content);
};

  return (
    <div className="fixed inset-0 bg-brand-bg z-50 flex flex-col font-sans text-text-light animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-3 border-b border-surface-light flex-shrink-0">
        <h1 className="text-xl font-bold">Director's Workspace</h1>
        <div className="flex items-center space-x-4">
            <button onClick={handleUndo} disabled={lastScriptStateForUndo === null} className="text-sm font-semibold text-primary hover:underline disabled:text-text-dark disabled:cursor-not-allowed disabled:no-underline">
                Undo Last AI Action
            </button>
            <button onClick={props.onParse} disabled={!canParse} className="bg-surface-light text-text-light font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {props.generationStatus === 'parsing' ? <LoaderIcon /> : 'Parse & Validate'}
            </button>
            <button onClick={props.onGenerate} disabled={!canGenerate} className="bg-primary text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-primary-hover disabled:bg-surface-light disabled:text-text-dark disabled:cursor-not-allowed">
                {props.generationStatus === 'generating' ? 'Generating...' : 'Generate All'}
            </button>
            <button onClick={props.onClose} className="p-2 rounded-full hover:bg-surface-light transition-colors">
              <CloseIcon />
            </button>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Left Panel: The Script */}
        <div className="col-span-4 bg-surface rounded-lg flex flex-col">
          <h2 className="text-lg font-semibold p-3 border-b border-surface-light">Script</h2>
          <div className="flex-grow p-1">
             <textarea
                ref={scriptTextAreaRef}
                value={props.blueprintText}
                onChange={(e) => props.onBlueprintTextChange(e.target.value)}
                placeholder="[SCENE] A cat sits in a high-tech armchair..."
                className="w-full h-full bg-transparent text-sm font-mono resize-none focus:outline-none p-2"
                spellCheck="false"
            />
          </div>
        </div>

        {/* Center Panel: The Stage */}
        <div className="col-span-5 bg-surface rounded-lg flex flex-col">
          <h2 className="text-lg font-semibold p-3 border-b border-surface-light">The Stage</h2>
          <div className="flex-grow p-4 text-center text-text-dark flex items-center justify-center">
             Storyboard & Visualizations will appear here.
          </div>
        </div>

        {/* Right Panel: Co-pilot & Assets */}
        <div className="col-span-3 bg-surface rounded-lg flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex border-b border-surface-light">
            <TabButton active={activeRightPanelTab === 'copilot'} onClick={() => setActiveRightPanelTab('copilot')}>Co-pilot</TabButton>
            <TabButton active={activeRightPanelTab === 'assets'} onClick={() => setActiveRightPanelTab('assets')}>Assets</TabButton>
          </div>
          <div className="flex-1 min-h-0">
            {activeRightPanelTab === 'copilot' && (
              <CopilotPanel 
                  history={copilotHistory}
                  input={copilotInput}
                  onInputChange={setCopilotInput}
                  onSend={handleCopilotSend}
                  isLoading={isCopilotLoading}
                  onInsert={handleInsertInScript}
                  onReplace={handleReplaceScript}
              />
            )}
            {activeRightPanelTab === 'assets' && <AssetsPanel {...props} discoveredAssets={discoveredAssets} />}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components for Panels ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 py-2 text-sm font-semibold transition-colors focus:outline-none ${active ? 'bg-surface-light text-text-light' : 'text-text-dark hover:bg-surface-light'}`}>
        {children}
    </button>
);

interface CopilotPanelProps {
    history: CopilotMessage[];
    input: string;
    onInputChange: (value: string) => void;
    onSend: (prompt?: string) => void;
    isLoading: boolean;
    onInsert: (content: string) => void;
    onReplace: (content: string) => void;
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({ history, input, onInputChange, onSend, isLoading, onInsert, onReplace }) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-surface">
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 space-y-4 text-sm">
                 {history.map((message, index) => {
                    const isModel = message.role === 'model';
                    
                    if (index === 0 && message.content.includes("How can I help")) {
                        return (
                             <div key={index} className="flex justify-start">
                                <div className="max-w-[85%] p-3 rounded-lg bg-surface-light text-text-light">
                                    <p className="mb-3">{message.content}</p>
                                    <div className="space-y-2">
                                        <button onClick={() => onSend("Start a story about a cat who wants to be a ninja")} className="w-full text-left bg-surface p-2 rounded-lg hover:bg-gray-600 transition-colors text-xs">"Start a story about a cat who wants to be a ninja"</button>
                                        <button onClick={() => onSend("Give me a 3-act outline for a sci-fi mystery")} className="w-full text-left bg-surface p-2 rounded-lg hover:bg-gray-600 transition-colors text-xs">"Give me a 3-act outline for a sci-fi mystery"</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    return (
                        <div key={index} className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${isModel ? 'bg-surface-light text-text-light' : 'bg-primary text-white'}`}>
                                {message.content}
                            </div>
                            {isModel && !message.content.startsWith("Sorry,") && !message.content.includes("How can I help") && (
                                <div className="flex items-center space-x-2 mt-2">
                                    <button title="Insert at Cursor" onClick={() => onInsert(message.content)} className="flex items-center space-x-1 text-xs px-2 py-1 bg-surface-light rounded-md text-text-dark hover:text-white hover:bg-primary/50 transition-colors">
                                        <InsertIcon />
                                        <span>Insert</span>
                                    </button>
                                    <button title="Replace Entire Script" onClick={() => onReplace(message.content)} className="flex items-center space-x-1 text-xs px-2 py-1 bg-surface-light rounded-md text-text-dark hover:text-white hover:bg-primary/50 transition-colors">
                                        <ReplaceIcon />
                                        <span>Replace</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-[85%] p-3 rounded-lg bg-surface-light text-text-light animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-surface-light">
                <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        placeholder="Chat with your co-pilot..." 
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-grow bg-surface-light p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-transparent"
                    />
                    <button 
                        onClick={() => onSend()} 
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-primary rounded-lg text-white hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:cursor-not-allowed"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssetsPanel: React.FC<DirectorWorkspaceProps & { discoveredAssets: AssetCreateSuggestionPayload[] }> = (props) => {
    return (
        <div className="p-4 space-y-6 flex-1 min-h-0 overflow-y-auto">
            <DiscoveredAssetsSection items={props.discoveredAssets} />
            <AssetSection title="Characters" items={props.savedCharacters} />
            <AssetSection title="Objects" items={props.userObjects} />
            <AssetSection title="Scenes" items={props.savedScenes} />
        </div>
    );
};

const DiscoveredAssetsSection: React.FC<{ items: AssetCreateSuggestionPayload[] }> = ({ items }) => {
    if (items.length === 0) return null;

    return (
        <div className="animate-fade-in">
            <h3 className="text-md font-semibold text-yellow-400 mb-2">Discovered Assets</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="p-3 bg-surface-light rounded-md border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-light">{item.assetName} <span className="text-xs text-text-dark">({item.assetType})</span></p>
                            <button className="text-xs bg-primary/50 text-white px-3 py-1 rounded-full hover:bg-primary">Create</button>
                        </div>
                        <p className="text-xs text-text-dark mt-1">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AssetSection: React.FC<{ title: string; items: (Character | UserObject | SavedScene)[] }> = ({ title, items }) => (
    <div>
        <h3 className="text-md font-semibold text-text-dark mb-2">{title}</h3>
        <div className="space-y-2">
            {items.length > 0 ? items.map(item => (
                <div key={item.id} className="flex items-center p-2 bg-surface-light rounded-md">
                    <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-md object-cover mr-3 flex-shrink-0"/>
                    <p className="text-sm font-medium text-text-light truncate flex-grow">{item.name}</p>
                    <button className="text-xs bg-primary/50 text-white px-2 py-1 rounded-full hover:bg-primary transition-colors">Cast</button>
                </div>
            )) : <p className="text-xs text-text-dark text-center py-2">No saved {title.toLowerCase()}.</p>}
        </div>
    </div>
);