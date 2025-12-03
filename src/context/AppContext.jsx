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
    
    // ⬇️ NUEVA FUNCIÓN PARA ACTUALIZAR UNA ENTRADA DEL DIARIO POR ID ⬇️
    const updateJournalEntry = (updatedEntry) => {
        setData(prev => ({
            ...prev,
            // Mapea el array 'journal' y reemplaza la entrada cuyo ID coincide con 'updatedEntry.id'
            journal: prev.journal.map(entry => 
                entry.id === updatedEntry.id ? updatedEntry : entry
            )
        }));
    };
    // ⬆️ FIN DE LA NUEVA FUNCIÓN ⬆️

    return (
        <AppContext.Provider value={{
            data,
            userRole,
            setUserRole,
            updateJournal,
            updateCrew,
            updateCharacter,
            addJournalEntry,
            updateJournalEntry, // ⬅️ Asegúrate de exportar la nueva función
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
