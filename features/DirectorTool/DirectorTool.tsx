import React from 'react';
import useAppStore from '../../store/appStore';
import { DirectorModal } from '../../components/modals/DirectorModal';

export const DirectorTool: React.FC = () => {
    const store = useAppStore();

    // The DirectorModal requires a lot of props. We select them from the store here.
    // This component acts as the bridge between the store and the presentational modal component.

    return (
        <DirectorModal
            onClose={() => store.setIsDirectorModalOpen(false)}
            blueprintText={store.blueprintText}
            onBlueprintTextChange={store.setBlueprintText}
            onParse={store.handleParseBlueprint}
            onGenerate={store.handleGenerateStoryboard}
            parsedBlueprint={store.parsedBlueprint}
            unresolvedAssets={store.unresolvedAssets}
            storyboardImages={store.storyboardImages}
            generationStatus={store.generationStatus}
            onResolveAsset={store.handleResolveAsset}
            onImagineAsset={store.handleImagineAsset}
            onAddUnresolvedAsset={store.handleAddUnresolvedAsset}
            onRetryImage={store.handleRetryStoryboardImage}
            onGenerateSingleScene={store.handleGenerateSingleScene}
            onUpdateGlobalContext={store.handleUpdateGlobalContext}
            // FIX: Renamed props to match the DirectorModalProps interface.
            savedCharacters={store.savedCharacters}
            userObjects={store.userObjects}
            savedScenes={store.savedScenes}
            onDeleteCharacter={store.handleDeleteCharacter}
            onCreateCharacter={store.handleCreateCharacter}
            onUpdateCharacter={store.handleUpdateCharacter}
            onDeleteObject={store.handleDeleteObject}
            onCreateObject={store.handleCreateObject}
            onUpdateObject={store.handleUpdateObject}
            onDeleteScene={store.handleDeleteScene}
            onCreateScene={store.handleCreateScene}
            onOpenSceneInspector={store.handleOpenSceneInspector}
            onScriptDirty={store.handleScriptDirty}
            onUpdateStoryboardImage={store.handleUpdateStoryboardImage}
        />
    );
};
