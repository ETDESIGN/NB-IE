import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ParsedBlueprint, StoryboardImage, Character, UserObject, SavedScene, CopilotMessage, AssetCreateSuggestionPayload, ScriptActionPayload, UIHighlightPayload, AnalysisReport, CinematicStyle, UnresolvedAsset } from '../../types';
import { LoaderIcon } from '../../constants';
import { getDirectorCopilotResponse, analyzeScriptForInsights } from '../../services/geminiService';
import { StoryboardFrameEditorModal } from './StoryboardFrameEditorModal';
import { toast } from 'react-hot-toast';


// --- ICONS ---
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> );
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const HourglassIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 2v6l4 4-4 4v6h12v-6l-4-4 4-4V2H6z" /></svg> );
const GeneratingIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> );
const ErrorIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );


interface DirectorModalProps {
  onClose: () => void;
  blueprintText: string;
  onBlueprintTextChange: (text: string | ((prev: string) => string)) => void;
  onParse: () => void;
  onGenerate: () => void;
  parsedBlueprint: ParsedBlueprint | null;
  unresolvedAssets: UnresolvedAsset[];
  storyboardImages: StoryboardImage[];
  generationStatus: 'idle' | 'parsing' | 'validating' | 'generating' | 'complete' | 'error';
  onResolveAsset: (assetData: UnresolvedAsset) => void;
  onImagineAsset: (blueprintId: string) => void;
  onAddUnresolvedAsset: (asset: UnresolvedAsset) => void;
  onRetryImage: (imageToRetry: StoryboardImage) => void; 
  onGenerateSingleScene: (sceneNumber: number, forceRegenerate?: boolean) => void;
  onUpdateGlobalContext: (field: keyof ParsedBlueprint['globalContext'], value: any) => void;
  
  // Asset Management Props (from main app)
  savedCharacters: Character[];
  userObjects: UserObject[];
  savedScenes: SavedScene[];

  // Handlers for main app asset management
  onDeleteCharacter: (id: string) => void;
  onCreateCharacter: (images: string[], name: string, description?: string) => Promise<Character>;
  onUpdateCharacter: (character: Character) => void;
  onDeleteObject: (id: string) => void;
  onCreateObject: (prompt: string, description?: string) => Promise<UserObject>;
  onUpdateObject: (object: UserObject) => void;
  onDeleteScene: (id: string) => void;
  onCreateScene: (images: string[], name: string, description: string) => Promise<SavedScene>;
  onOpenSceneInspector: (sceneId: string) => void;
  onScriptDirty: () => void;
  onUpdateStoryboardImage: (sceneNumber: number, frameNumber: number, newImageData: string) => void;
}

type RightPanelTab = 'copilot' | 'assets' | 'analysis' | 'style';

export const DirectorModal: React.FC<DirectorModalProps> = (props) => {
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<RightPanelTab>('copilot');
  const scriptTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [editingImage, setEditingImage] = useState<StoryboardImage | null>(null);

  // State for Co-pilot chat
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState<CopilotMessage[]>([
      { role: 'model', content: "Welcome! How can I help you build your story? Try one of these prompts:" }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  
  // State for Actionable Agent & Analysis
  const [lastScriptStateForUndo, setLastScriptStateForUndo] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisTimeoutRef = useRef<number | null>(null);
  
  const canParse = props.blueprintText.length > 50 && (props.generationStatus === 'idle' || props.generationStatus === 'complete' || props.generationStatus === 'error');

  const canGenerate = useMemo(() => {
    return !!props.parsedBlueprint && props.unresolvedAssets.length === 0 && (props.generationStatus === 'idle' || props.generationStatus === 'complete' || props.generationStatus === 'error');
  }, [props.parsedBlueprint, props.unresolvedAssets, props.generationStatus]);


  // Debounced Analysis Engine
  useEffect(() => {
      if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current);
      }
      if (props.blueprintText.length < 200) {
          setAnalysisReport(null);
          return;
      }
      analysisTimeoutRef.current = window.setTimeout(async () => {
          setIsAnalyzing(true);
          try {
              const report = await analyzeScriptForInsights(props.blueprintText);
              setAnalysisReport(report);
          } catch (error) {
              console.error("Script analysis failed:", error);
          } finally {
              setIsAnalyzing(false);
          }
      }, 2000);

      return () => {
          if (analysisTimeoutRef.current) {
              clearTimeout(analysisTimeoutRef.current);
          }
      };
  }, [props.blueprintText]);

  const handleUndo = () => {
    if (lastScriptStateForUndo !== null) {
        props.onBlueprintTextChange(lastScriptStateForUndo);
        setLastScriptStateForUndo(null); // Simple one-level undo
    }
  };

  const handleCopilotSend = async (prompt?: string) => {
    const textToSend = prompt || copilotInput;
    if (!textToSend.trim() || isCopilotLoading) return;

    const userMessage: CopilotMessage = { role: 'user', content: textToSend };
    setCopilotHistory(prev => [...prev, userMessage]);
    
    if (!prompt) setCopilotInput('');
    
    setIsCopilotLoading(true);

    try {
        const response = await getDirectorCopilotResponse(textToSend, props.blueprintText, copilotHistory);
        const modelMessage: CopilotMessage = { role: 'model', content: response.displayText };
        setCopilotHistory(prev => [...prev, modelMessage]);
        
        if (response.actions && response.actions.length > 0) {
            setLastScriptStateForUndo(props.blueprintText);

            const hasScriptModification = response.actions.some(a => 
                a.type === 'SCRIPT_APPEND' || 
                a.type === 'SCRIPT_REPLACE' || 
                a.type === 'SCRIPT_INSERT_AT_CURSOR'
            );

            if (hasScriptModification) {
                props.onScriptDirty();
            }

            for (const action of response.actions) {
                switch (action.type) {
                    case 'SCRIPT_APPEND':
                        props.onBlueprintTextChange(prev => prev + '\n' + (action.payload as ScriptActionPayload).content);
                        break;
                    case 'SCRIPT_REPLACE':
                        props.onBlueprintTextChange((action.payload as ScriptActionPayload).content);
                        break;
                    case 'SCRIPT_INSERT_AT_CURSOR':
                        handleInsertInScript((action.payload as ScriptActionPayload).content);
                        break;
                    case 'ASSET_CREATE_SUGGESTION':
                        const payload = action.payload as AssetCreateSuggestionPayload;
                        props.onAddUnresolvedAsset({ name: payload.assetName, type: payload.assetType, description: payload.description });
                        setActiveRightPanelTab('assets');
                        break;
                    case 'UI_HIGHLIGHT':
                        console.log("UI Highlight requested:", (action.payload as UIHighlightPayload).textToHighlight);
                        break;
                }
            }
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
  
  return (
    <>
      <div className="fixed inset-0 bg-brand-bg z-50 flex flex-col font-sans text-text-light animate-fade-in">
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

        <main className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
          <div className="col-span-4 bg-surface rounded-lg flex flex-col">
            <h2 className="text-lg font-semibold p-3 border-b border-surface-light">Script</h2>
            <div className="flex-grow p-1">
               <textarea
                  ref={scriptTextAreaRef}
                  value={props.blueprintText}
                  onChange={(e) => {
                      props.onBlueprintTextChange(e.target.value);
                      props.onScriptDirty();
                  }}
                  placeholder="[SCENE] A cat sits in a high-tech armchair..."
                  className="w-full h-full bg-transparent text-sm font-mono resize-none focus:outline-none p-2"
                  spellCheck="false"
              />
            </div>
          </div>

          <div className="col-span-5 bg-surface rounded-lg flex flex-col">
            <h2 className="text-lg font-semibold p-3 border-b border-surface-light">The Stage</h2>
            <StagePanel {...props} onImageClick={setEditingImage} />
          </div>

          <div className="col-span-3 bg-surface rounded-lg flex flex-col overflow-hidden">
            <div className="flex-shrink-0 flex border-b border-surface-light">
              <TabButton active={activeRightPanelTab === 'copilot'} onClick={() => setActiveRightPanelTab('copilot')}>Co-pilot</TabButton>
              <TabButton active={activeRightPanelTab === 'assets'} onClick={() => setActiveRightPanelTab('assets')}>Assets</TabButton>
              <TabButton active={activeRightPanelTab === 'analysis'} onClick={() => setActiveRightPanelTab('analysis')}>Analysis</TabButton>
              <TabButton active={activeRightPanelTab === 'style'} onClick={() => setActiveRightPanelTab('style')}>Style</TabButton>
            </div>
            <div className="flex-1 min-h-0">
              {activeRightPanelTab === 'copilot' && (
                <CopilotPanel 
                    history={copilotHistory}
                    input={copilotInput}
                    onInputChange={setCopilotInput}
                    onSend={handleCopilotSend}
                    isLoading={isCopilotLoading}
                />
              )}
              {activeRightPanelTab === 'assets' && <AssetsPanel {...props} />}
              {activeRightPanelTab === 'analysis' && <AnalysisPanel report={analysisReport} isLoading={isAnalyzing} />}
              {activeRightPanelTab === 'style' && <StylePanel {...props} />}
            </div>
          </div>
        </main>
      </div>
      {editingImage && (
        <StoryboardFrameEditorModal
            image={editingImage}
            onClose={() => setEditingImage(null)}
            onSave={props.onUpdateStoryboardImage}
        />
      )}
    </>
  );
};

// --- Sub-Components for Panels ---

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 py-2 text-sm font-semibold transition-colors focus:outline-none ${active ? 'bg-surface-light text-text-light' : 'bg-surface text-text-dark hover:bg-surface-light'}`}>
        {children}
    </button>
);

const CopilotPanel: React.FC<{ history: CopilotMessage[]; input: string; onInputChange: (v: string) => void; onSend: (p?: string) => void; isLoading: boolean; }> = ({ history, input, onInputChange, onSend, isLoading }) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    useEffect(() => { chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' }); }, [history, isLoading]);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } };

    return (
        <div className="flex flex-col h-full bg-surface">
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 space-y-4 text-sm">
                 {history.map((message, index) => (
                     (index === 0 && message.content.includes("How can I help")) ? (
                        <div key={index} className="flex justify-start">
                            <div className="max-w-[85%] p-3 rounded-lg bg-surface-light text-text-light">
                                <p className="mb-3">{message.content}</p>
                                <div className="space-y-2">
                                    <button onClick={() => onSend("Start a story about a cat who wants to be a ninja")} className="w-full text-left bg-surface p-2 rounded-lg hover:bg-gray-600 transition-colors text-xs">"Start a story about a cat who wants to be a ninja"</button>
                                    <button onClick={() => onSend("Give me a 3-act outline for a sci-fi mystery")} className="w-full text-left bg-surface p-2 rounded-lg hover:bg-gray-600 transition-colors text-xs">"Give me a 3-act outline for a sci-fi mystery"</button>
                                    <button onClick={() => onSend("finish the story")} className="w-full text-left bg-surface p-2 rounded-lg hover:bg-gray-600 transition-colors text-xs font-bold">"Finish the story for me"</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div key={index} className={`flex flex-col ${message.role === 'model' ? 'items-start' : 'items-end'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${message.role === 'model' ? 'bg-surface-light text-text-light' : 'bg-primary text-white'}`}>
                                {message.content}
                            </div>
                        </div>
                    )
                 ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-surface-light text-text-light animate-pulse">Thinking...</div></div>}
            </div>
            <div className="flex-shrink-0 p-4 border-t border-surface-light"><div className="flex items-center space-x-2">
                <input type="text" placeholder="Chat with your co-pilot..." value={input} onChange={(e) => onInputChange(e.target.value)} onKeyDown={handleKeyDown} disabled={isLoading} className="flex-grow bg-surface-light p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary border-transparent" />
                <button onClick={() => onSend()} disabled={isLoading || !input.trim()} className="p-2 bg-primary rounded-lg text-white hover:bg-primary-hover transition-colors disabled:bg-surface-light disabled:cursor-not-allowed"><SendIcon /></button>
            </div></div>
        </div>
    );
};

const AssetsPanel: React.FC<DirectorModalProps> = (props) => (
    <div className="p-4 space-y-6 flex-1 min-h-0 overflow-y-auto">
        <UnresolvedAssetsSection items={props.unresolvedAssets} onResolve={props.onResolveAsset} onImagine={props.onImagineAsset} />
        <AssetSection title="Characters" items={props.savedCharacters} />
        <AssetSection title="Objects" items={props.userObjects} />
        <AssetSection title="Scenes" items={props.savedScenes} />
    </div>
);

const UnresolvedAssetsSection: React.FC<{ items: UnresolvedAsset[], onResolve: (asset: UnresolvedAsset) => void, onImagine: (blueprintId: string) => void }> = ({ items, onResolve, onImagine }) => {
    if (items.length === 0) return null;
    return (
        <div className="animate-fade-in">
            <h3 className="text-md font-semibold text-yellow-400 mb-2">Unresolved Assets</h3>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.blueprintId || `${item.name}-${index}`} className="p-3 bg-surface-light rounded-md border-l-4 border-yellow-400">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-text-light">{item.name} <span className="text-xs text-text-dark">({item.type})</span></p>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onResolve(item)} className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-primary-hover">Resolve</button>
                                {item.type === 'Character' && item.blueprintId && (
                                    <button onClick={() => onImagine(item.blueprintId!)} className="text-xs bg-surface text-text-dark px-3 py-1 rounded-full hover:bg-gray-600">Imagine for Me</button>
                                )}
                            </div>
                        </div>
                        {item.description && <p className="text-xs text-text-dark mt-1 italic">"{item.description}"</p>}
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
                </div>
            )) : <p className="text-xs text-text-dark text-center py-2">No saved {title.toLowerCase()}.</p>}
        </div>
    </div>
);

const StagePanel: React.FC<DirectorModalProps & { onImageClick: (image: StoryboardImage) => void }> = (props) => {
    if (props.unresolvedAssets.length > 0 && props.parsedBlueprint) {
      return (
        <div className="flex-grow p-4 text-text-dark flex flex-col items-center justify-center">
            <h3 className="font-bold text-lg text-yellow-400 mb-2">Unresolved Assets</h3>
            <p className="text-sm mb-4">Please create or assign the following assets before generating a storyboard.</p>
            <div className="w-full max-w-md space-y-2">
                {props.unresolvedAssets.map(error => (
                    <div key={error.blueprintId} className="flex items-center justify-between p-2 bg-surface-light rounded-md">
                        <p><span className="font-semibold text-text-light">{error.name}</span> ({error.type})</p>
                         <div className="flex items-center space-x-2">
                            <button onClick={() => props.onResolveAsset(error)} className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-primary-hover">Resolve</button>
                             {error.type === 'Character' && error.blueprintId && (
                                <button onClick={() => props.onImagineAsset(error.blueprintId!)} className="text-xs bg-surface text-text-dark px-3 py-1 rounded-full hover:bg-gray-600">Imagine for Me</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )
    }

    if (!props.parsedBlueprint) {
        return (
            <div className="flex-grow p-4 text-center text-text-dark flex items-center justify-center">
                Parse your script to see scene breakdowns here.
            </div>
        );
    }
    return (
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {props.parsedBlueprint.scenes.map(scene => (
                <SceneCard key={scene.sceneNumber} scene={scene} {...props} onImageClick={props.onImageClick} />
            ))}
        </div>
    )
};

const SceneCard: React.FC<{ scene: ParsedBlueprint['scenes'][0] } & DirectorModalProps & { onImageClick: (image: StoryboardImage) => void }> = ({ scene, storyboardImages, onGenerateSingleScene, onRetryImage, generationStatus, onImageClick }) => {
    const sceneImages = storyboardImages.filter(img => img.sceneNumber === scene.sceneNumber);
    const isGeneratingThisScene = sceneImages.some(img => img.status === 'generating');
    const isGenerated = sceneImages.every(img => img.status === 'complete');
    
    return (
        <div className="bg-surface-light p-4 rounded-lg">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-md font-bold text-text-light pr-4">Scene {scene.sceneNumber}: <span className="font-normal">{scene.setting}</span></h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={() => onGenerateSingleScene(scene.sceneNumber)} disabled={isGeneratingThisScene || generationStatus === 'generating' || isGenerated} className="bg-primary text-white font-semibold py-1.5 px-4 rounded-full text-xs hover:bg-primary-hover disabled:bg-surface disabled:text-text-dark transition-colors">
                        {isGeneratingThisScene ? 'Generating...' : 'Generate Scene'}
                    </button>
                     <button onClick={() => onGenerateSingleScene(scene.sceneNumber, true)} disabled={isGeneratingThisScene || generationStatus === 'generating'} className="bg-surface text-text-dark font-semibold py-1.5 px-4 rounded-full text-xs hover:bg-gray-600 disabled:opacity-50 transition-colors">
                        Regenerate
                    </button>
                </div>
            </div>
            <p className="text-xs text-text-dark mb-1">{scene.action}</p>
            <div className="flex items-center space-x-4 text-xs text-text-dark mb-3 border-t border-surface pt-2 mt-2">
                {scene.camera && <div><strong className="text-text-dark/80">Camera:</strong> {scene.camera}</div>}
                {scene.lighting && <div><strong className="text-text-dark/80">Lighting:</strong> {scene.lighting}</div>}
            </div>
            <StoryboardGrid images={sceneImages} onRetry={onRetryImage} onImageClick={onImageClick} />
        </div>
    );
};

const StoryboardGrid: React.FC<{ images: StoryboardImage[], onRetry: (image: StoryboardImage) => void, onImageClick: (image: StoryboardImage) => void }> = ({ images, onRetry, onImageClick }) => {
    if (images.length === 0) {
        return <div className="text-xs text-text-dark text-center py-4">Click "Generate Scene" to create visuals.</div>;
    }
    return (
        <div className="grid grid-cols-5 gap-2">
            {images.map((img, i) => {
                let containerClasses = "aspect-video bg-surface rounded-md flex flex-col items-center justify-center p-2 text-xs relative group text-text-dark";
                if (img.status === 'complete' && img.imageData) {
                     return (
                        <div key={i} className="aspect-video bg-surface rounded-md relative group cursor-pointer" onClick={() => onImageClick(img)}>
                            <img src={img.imageData} alt={`Scene ${img.sceneNumber} Frame ${img.frameNumber}`} className="w-full h-full object-cover rounded-md" />
                             <div className="absolute inset-0 bg-black/70 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                               <button onClick={(e) => { e.stopPropagation(); onRetry(img); }} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-1 px-3 rounded-full">Regenerate</button>
                            </div>
                        </div>
                    );
                }
                return (
                     <div key={i} className={containerClasses} title={img.errorMessage}>
                        {img.status === 'pending' && <><HourglassIcon /> <span className="mt-1 font-semibold">Pending</span></>}
                        {img.status === 'generating' && <><LoaderIcon /> <span className="mt-1 font-semibold animate-pulse">Generating</span></>}
                        {img.status === 'error' && <><ErrorIcon /> <span className="mt-1 font-semibold">Error</span></>}
                        {img.status === 'error' && (
                            <div className="absolute inset-0 bg-black/70 flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                                <p className="text-white text-xs text-center mb-2 px-1">{img.errorMessage}</p>
                                <button onClick={() => onRetry(img)} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-1 px-3 rounded-full">Retry</button>
                            </div>
                        )}
                        <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">{img.sceneNumber}:{img.frameNumber}</div>
                    </div>
                );
            })}
        </div>
    );
};

const AnalysisPanel: React.FC<{ report: AnalysisReport | null; isLoading: boolean }> = ({ report, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-text-dark p-4">
                <LoaderIcon />
                <p className="mt-2 text-sm font-semibold">Analyzing script...</p>
            </div>
        );
    }
    if (!report) {
        return (
            <div className="flex items-center justify-center h-full text-text-dark p-4 text-center">
                <p>Type in the script editor to get real-time analysis of your story. Analysis requires at least 200 characters.</p>
            </div>
        );
    }
    return (
        <div className="p-4 space-y-6 flex-1 min-h-0 overflow-y-auto">
            <AnalysisSection title="Pacing & Tension">
                <PacingGraph data={report.pacingGraph} />
            </AnalysisSection>
            <AnalysisSection title="Character Voice">
                {report.characterVoiceScores.map(score => (
                    <div key={score.characterName} className="p-3 bg-surface-light rounded-md mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <h5 className="font-semibold text-text-light">{score.characterName}</h5>
                            <span className={`text-sm font-bold ${score.consistencyScore > 7 ? 'text-green-400' : score.consistencyScore > 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {score.consistencyScore}/10
                            </span>
                        </div>
                        <p className="text-xs text-text-dark">{score.analysis}</p>
                    </div>
                ))}
            </AnalysisSection>
             <AnalysisSection title="Show, Don't Tell">
                {report.showDontTellWarnings.length > 0 ? report.showDontTellWarnings.map((warning, i) => (
                    <div key={i} className="p-3 bg-surface-light rounded-md mb-2">
                        <p className="text-xs text-text-dark italic">Scene {warning.sceneNumber}: "{warning.lineText}"</p>
                        <p className="text-sm text-text-light mt-1"><strong className="text-primary">Suggestion:</strong> {warning.suggestion}</p>
                    </div>
                )) : <p className="text-xs text-text-dark">No issues found.</p>}
            </AnalysisSection>
             <AnalysisSection title="Thematic Resonance">
                {report.thematicResonance.map(theme => (
                     <div key={theme.theme} className="p-3 bg-surface-light rounded-md mb-2">
                        <div className="flex justify-between items-center mb-1">
                            <h5 className="font-semibold text-text-light">{theme.theme}</h5>
                             <span className={`text-sm font-bold ${theme.score > 7 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {theme.score}/10
                            </span>
                        </div>
                        <p className="text-xs text-text-dark">{theme.analysis}</p>
                    </div>
                ))}
            </AnalysisSection>
        </div>
    );
};

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-md font-semibold text-text-dark mb-2">{title}</h3>
        {children}
    </div>
);

const PacingGraph: React.FC<{ data: AnalysisReport['pacingGraph'] }> = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-xs text-text-dark">Not enough data to generate a graph.</div>;
    const maxTension = Math.max(...data.map(d => d.tensionScore), 10);
    return (
        <div className="bg-surface-light p-4 rounded-lg">
            <div className="flex items-end h-32 space-x-2">
                {data.map(point => (
                    <div key={point.sceneNumber} className="flex-1 flex flex-col items-center justify-end group relative" title={`Scene ${point.sceneNumber}: ${point.explanation}`}>
                        <div 
                            className="w-full bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary-hover" 
                            style={{ height: `${(point.tensionScore / maxTension) * 100}%` }}
                        />
                        <div className="text-xs mt-1 text-text-dark">{point.sceneNumber}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-text-dark mt-1">
                <span>Low Tension</span>
                <span>High Tension</span>
            </div>
        </div>
    );
};

const StylePanel: React.FC<DirectorModalProps> = ({ parsedBlueprint, onUpdateGlobalContext }) => {
    const [localStyle, setLocalStyle] = useState<CinematicStyle | null>(parsedBlueprint?.globalContext.cinematicStyle || null);

    useEffect(() => {
        if (parsedBlueprint) {
            setLocalStyle(parsedBlueprint.globalContext.cinematicStyle);
        }
    }, [parsedBlueprint]);

    if (!parsedBlueprint || !localStyle) {
        return <div className="p-4 text-text-dark text-center">Parse a script to define its cinematic style.</div>;
    }
    
    const handleStyleChange = <K extends keyof CinematicStyle>(field: K, value: CinematicStyle[K]) => {
        setLocalStyle(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSave = () => {
        if(localStyle) {
            onUpdateGlobalContext('cinematicStyle', localStyle);
            toast.success('Cinematic Style updated!');
        }
    };

    return (
        <div className="p-4 space-y-6 flex flex-col flex-1 min-h-0">
            <div className="flex-grow overflow-y-auto pr-2">
                <h3 className="text-lg font-semibold text-text-light">Cinematic Style</h3>
                <p className="text-sm text-text-dark mb-6">Define the core visual language for your project. The AI will use these settings to ensure all generated storyboards are consistent.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Camera Style</label>
                        <select value={localStyle.cameraStyle} onChange={(e) => handleStyleChange('cameraStyle', e.target.value as CinematicStyle['cameraStyle'])} className="w-full bg-surface-light p-2 rounded-md text-text-light focus:ring-primary focus:border-primary border border-surface">
                            <option>Static & Symmetrical</option>
                            <option>Handheld & Gritty</option>
                            <option>Sweeping & Epic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Lighting Style</label>
                        <select value={localStyle.lightingStyle} onChange={(e) => handleStyleChange('lightingStyle', e.target.value as CinematicStyle['lightingStyle'])} className="w-full bg-surface-light p-2 rounded-md text-text-light focus:ring-primary focus:border-primary border border-surface">
                            <option>High-contrast noir</option>
                            <option>Soft, natural light</option>
                            <option>Vibrant & Saturated</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-dark mb-1">Color Palette</label>
                        <textarea 
                            value={localStyle.colorPalette} 
                            onChange={(e) => handleStyleChange('colorPalette', e.target.value)}
                            placeholder="e.g., Saturated blues and accent reds"
                            className="w-full h-24 bg-surface-light p-2 rounded-md text-text-light focus:ring-primary focus:border-primary border border-surface resize-none"
                        />
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                 <button onClick={handleSave} className="w-full p-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors">
                    Save & Apply Style
                </button>
            </div>
        </div>
    );
};
