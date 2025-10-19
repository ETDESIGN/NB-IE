import { useState, useCallback } from 'react';

export const useHistoryState = <T>(initialState: T) => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const setState = useCallback((newState: T | ((prevState: T) => T)) => {
        setHistory(currentHistory => {
            const newHistory = currentHistory.slice(0, historyIndex + 1);
            const resolvedState = typeof newState === 'function' 
                ? (newState as (prevState: T) => T)(newHistory[newHistory.length - 1]) 
                : newState;
            
            // Prevent adding duplicate states to the history
            if (resolvedState === newHistory[newHistory.length - 1]) {
                return currentHistory;
            }

            newHistory.push(resolvedState);
            setHistoryIndex(newHistory.length - 1);
            return newHistory;
        });
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1);
        }
    }, [historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1);
        }
    }, [historyIndex, history.length]);
    
    const reset = useCallback((newInitialState?: T) => {
        const stateToSet = newInitialState !== undefined ? newInitialState : initialState;
        setHistory([stateToSet]);
        setHistoryIndex(0);
    }, [initialState]);

    return {
        state: history[historyIndex],
        setState,
        undo,
        redo,
        reset,
        history,
        historyIndex,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
    };
};
