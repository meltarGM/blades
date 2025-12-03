import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from '../services/storageService';
import { initialData } from '../services/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const saved = storageService.loadData();
        return saved || initialData;
    });

    const [userRole, setUserRole] = useState('GM'); // Default to GM for now, or 'GM', 'char_1', 'char_2'

    useEffect(() => {
        storageService.saveData(data);
    }, [data]);

    const updateJournal = (newJournal) => {
        setData(prev => ({ ...prev, journal: newJournal }));
    };

    const updateCrew = (newCrew) => {
        setData(prev => ({ ...prev, crew: newCrew }));
    };

    const updateCharacter = (charId, updates) => {
        setData(prev => ({
            ...prev,
            characters: prev.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
        }));
    };

    const addJournalEntry = (entry) => {
        setData(prev => ({
            ...prev,
            journal: [entry, ...prev.journal]
        }));
    };

    return (
        <AppContext.Provider value={{
            data,
            userRole,
            setUserRole,
            updateJournal,
            updateCrew,
            updateCharacter,
            addJournalEntry
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
